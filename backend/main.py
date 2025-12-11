import os
import mimetypes
import re
import json
from uuid import uuid4
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from supabase import create_client, Client
import fitz
from groq import Groq

from sentence_transformers import SentenceTransformer

# -----------------------------------------------------
# Load env
# -----------------------------------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "documents")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase env variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

# Embeddings model
embedder = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# -----------------------------------------------------
# FASTAPI
# -----------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------
# Shared Helpers
# -----------------------------------------------------
def log_activity(action: str, details: str = ""):
    try:
        supabase.table("activity_logs").insert({
            "action": action,
            "details": details
        }).execute()
    except:
        pass


def extract_pdf_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = []
    for page in doc:
        text.append(page.get_text())
    return "".join(text).strip()


def chunk_text(text: str, size: int = 700) -> List[str]:
    if not text:
        return []
    words = text.split()
    chunks = []
    temp = []
    for w in words:
        temp.append(w)
        if len(" ".join(temp)) >= size:
            chunks.append(" ".join(temp))
            temp = []
    if temp:
        chunks.append(" ".join(temp))
    return chunks


# --------- universal groq safe-text-extractor -----------
def get_model_text(resp: Any) -> str:
    try:
        return resp.choices[0].message.content.strip()
    except:
        try:
            return resp["choices"][0]["message"]["content"].strip()
        except:
            try:
                return resp["choices"][0].get("text", "").strip()
            except:
                return str(resp)


def extract_json_from_text(text: str) -> Optional[Dict]:
    if not text:
        return None

    cleaned = text.strip()
    cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    # direct JSON
    try:
        return json.loads(cleaned)
    except:
        pass

    # regex fallback
    match = re.search(r"\{(?:.|\n)*\}", cleaned)
    if match:
        try:
            return json.loads(match.group(0))
        except:
            return None

    return None


# -----------------------------------------------------
# Routes
# -----------------------------------------------------
@app.get("/")
def root():
    return {"message": "Backend online"}


# -----------------------------------------------------
# Upload Document
# -----------------------------------------------------
@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...), title: str = Form(None)):
    try:
        mime = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/pdf"
        ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        unique = f"{uuid4()}.{ext}"
        storage_path = f"uploads/{unique}"

        pdf_bytes = await file.read()

        supabase.storage.from_(SUPABASE_BUCKET).upload(storage_path, pdf_bytes, {"content-type": mime})
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(storage_path)

        resp = supabase.table("documents").insert({
            "title": title or file.filename,
            "file_name": file.filename,
            "storage_path": storage_path,
            "public_url": public_url,
            "size_bytes": len(pdf_bytes)
        }).execute()

        doc = resp.data[0]

        # embeddings
        text = extract_pdf_text(pdf_bytes)
        chunks = chunk_text(text)

        rows = []
        for idx, chunk in enumerate(chunks):
            rows.append({
                "id": str(uuid4()),
                "doc_id": doc["id"],
                "chunk_index": idx,
                "text": chunk,
                "embedding": embedder.encode(chunk).tolist()
            })

        if rows:
            supabase.table("document_chunks").insert(rows).execute()

        log_activity("upload", f"Uploaded: {doc['title']}")

        return {"message": "Uploaded", "document": doc, "chunks": len(rows)}

    except Exception as e:
        raise HTTPException(500, str(e))


# -----------------------------------------------------
# GET Documents
# -----------------------------------------------------
@app.get("/api/documents")
def get_documents():
    resp = supabase.table("documents").select("*").order("created_at", desc=True).execute()
    return resp.data


@app.get("/api/documents/{doc_id}")
def get_document(doc_id: str):
    resp = supabase.table("documents").select("*").eq("id", doc_id).single().execute()
    return resp.data


@app.get("/api/documents/stream/{doc_id}")
def stream_document(doc_id: str):
    resp = supabase.table("documents").select("storage_path").eq("id", doc_id).single().execute()
    storage_path = resp.data["storage_path"]
    file_bytes = supabase.storage.from_(SUPABASE_BUCKET).download(storage_path)
    return StreamingResponse(file_bytes, media_type="application/pdf")


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str):
    resp = supabase.table("documents").select("storage_path,title").eq("id", doc_id).single().execute()
    row = resp.data

    supabase.storage.from_(SUPABASE_BUCKET).remove([row["storage_path"]])
    supabase.table("documents").delete().eq("id", doc_id).execute()
    supabase.table("document_chunks").delete().eq("doc_id", doc_id).execute()

    log_activity("delete", f"Deleted {row['title']}")

    return {"message": "Deleted"}


# -----------------------------------------------------
# Summarize
# -----------------------------------------------------
@app.post("/api/summarize/{doc_id}")
def summarize_document(doc_id: str):
    try:
        row = supabase.table("documents").select("*").eq("id", doc_id).single().execute().data
        pdf_bytes = supabase.storage.from_(SUPABASE_BUCKET).download(row["storage_path"])

        text = extract_pdf_text(pdf_bytes)
        trimmed = text[:12000]

        prompt = f"""
Return ONLY valid JSON:

{{
 "document_title": "",
 "sections": [
    {{"heading":"", "summary":["point1","point2"]}}
 ]
}}

DOCUMENT:
{trimmed}
"""

        resp = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        raw = get_model_text(resp)
        parsed = extract_json_from_text(raw)

        if not parsed:
            parsed = {
                "document_title": row["title"],
                "sections": [{"heading": "Summary", "summary": [raw]}]
            }

        log_activity("summary", f"Summarized: {row['title']}")

        return {
            "document_title": parsed.get("document_title", row["title"]),
            "total_sections": len(parsed.get("sections", [])),
            "sections": parsed.get("sections", [])
        }

    except Exception as e:
        raise HTTPException(500, str(e))


# -----------------------------------------------------
# Chat (Ask AI)
# -----------------------------------------------------
def rag_search(doc_id: str, query: str, top_k: int = 5):
    try:
        q_emb = embedder.encode(query).tolist()
        res = supabase.rpc(
            "match_document_chunks",
            {
                "query_embedding": q_emb,
                "match_count": top_k,
                "docid": doc_id
            }
        ).execute()

        return res.data or []
    except Exception as e:
        print("❌ RAG ERROR:", e)
        return []



@app.post("/api/chat/{doc_id}")
def chat_with_document(doc_id: str, body: Dict):
    print("\n======================")
    print("📌 CHAT REQUEST START")
    print("======================")

    try:
        print(f"➡️ DOC ID: {doc_id}")
        print(f"➡️ RAW BODY: {body}")

        question = (body or {}).get("question", "").strip()
        print(f"➡️ Question Extracted: '{question}'")

        if not question:
            print("❌ ERROR: Empty question")
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        # ---------- STEP 1: RAG SEARCH ----------
        print("\n--- STEP 1: Running rag_search() ---")
        matches = rag_search(doc_id, question)
        print(f"📌 RAG Results Raw: {matches}")

        if matches is None:
            print("❌ ERROR: rag_search returned None")
            raise HTTPException(500, "RAG failed (no matches array)")

        if not isinstance(matches, list):
            print("❌ ERROR: rag_search returned non-list")
            raise HTTPException(500, f"Expected list, got {type(matches)}")

        # ---------- STEP 2: BUILD CONTEXT ----------
        print("\n--- STEP 2: Building Context ---")

        try:
            context_chunks = []
            for m in matches:
                print(f"   🔍 Match item: {m}")
                if isinstance(m, dict) and "text" in m:
                    context_chunks.append(m["text"])
                else:
                    print("❌ INVALID MATCH ITEM (missing 'text')")

            context = "\n\n".join(context_chunks)
        except Exception as e:
            print(f"❌ ERROR building context: {e}")
            raise HTTPException(500, "Failed to build context")

        if not context.strip():
            print("⚠️ WARNING: No context found")
            context = "NO RELEVANT CONTEXT FOUND"

        print(f"📌 Final Context: {context[:300]}...")
        print(f"📌 Context Length: {len(context)} characters")

        # ---------- STEP 3: LLM CALL ----------
        print("\n--- STEP 3: Sending to Groq LLM ---")

        prompt = f"""
Answer ONLY using the context below.

CONTEXT:
{context}

QUESTION:
{question}

If answer not found, reply:
"I cannot find information about that in the document."
"""

        print(f"➡️ LLM PROMPT (first 300 chars): {prompt[:300]}")

        llm_response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        print(f"📌 LLM Raw Response: {llm_response}")

        # Extract model text safely
        answer_text = get_model_text(llm_response)
        print(f"📌 LLM Extracted Answer: {answer_text}")

        # ---------- STEP 4: LOG ACTIVITY ----------
        log_activity("chat", f"Asked: {question[:120]}")

        print("\n✅ CHAT SUCCESSFUL\n")
        return {"answer": answer_text, "sources": matches}

    except Exception as e:
        print("\n❌ CHAT ERROR OCCURRED")
        print(f"❌ ERROR DETAILS: {e}")
        print("======================\n")
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------
# QUIZ GENERATOR (15 MCQs)
# -----------------------------------------------------
@app.post("/api/quiz/{doc_id}")
def generate_quiz(doc_id: str):
    print("\n====================")
    print("📌 QUIZ GENERATION START")
    print("====================")

    try:
        # 1️⃣ Load document
        print(f"➡️ DOC ID: {doc_id}")
        doc_resp = supabase.table("documents").select("*").eq("id", doc_id).single().execute()
        doc = doc_resp.data

        if not doc:
            print("❌ ERROR: Document not found")
            raise HTTPException(status_code=404, detail="Document not found")

        print(f"📄 Document Loaded: {doc['title']}")

        # 2️⃣ Load chunks
        chunk_resp = supabase.table("document_chunks").select("text").eq("doc_id", doc_id).execute()
        chunks = [c["text"] for c in (chunk_resp.data or [])]

        print(f"📌 Chunks Found: {len(chunks)}")

        context = "\n\n".join(chunks)[:15000] if chunks else "NO_RAG_CONTENT_AVAILABLE"

        print("📌 Context Preview:\n", context[:500], "...\n")

        # 3️⃣ Build prompt
        prompt = f"""
Generate EXACTLY 15 MCQ questions based on the document context.

Return ONLY valid JSON.

JSON STRUCTURE:
{{
  "document_title": "{doc.get("title")}",
  "questions": [
    {{
      "difficulty": "easy" | "medium" | "hard",
      "question": "text",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "",
      "source": ""
    }}
  ]
}}

CONTEXT:
{context}
"""

        print("➡️ QUIZ PROMPT SENT (first 400 chars):")
        print(prompt[:400], "\n")

        # 4️⃣ Call Groq
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=3800
        )

        print("📌 RAW GROQ RESPONSE:")
        print(response)

        raw = get_model_text(response)
        print("\n📌 Extracted Text From Model:")
        print(raw[:500], "...\n")

        # 5️⃣ Clean formatting
        cleaned = (
            raw.replace("```json", "")
                .replace("```", "")
                .strip()
        )

        print("📌 CLEANED MODEL OUTPUT:")
        print(cleaned[:500], "...\n")

        # 6️⃣ Try JSON parse directly
        try:
            parsed = json.loads(cleaned)
            print("✅ JSON parsed successfully (direct)")
        except Exception as e1:
            print("❌ Direct JSON parse failed:", e1)

            import re
            match = re.search(r"\{(?:.|\n)*\}", cleaned)
            if not match:
                print("❌ NO JSON OBJECT FOUND IN RESPONSE")
                raise HTTPException(status_code=500, detail="Model returned no JSON")

            json_candidate = match.group(0)
            print("📌 Extracted JSON Candidate:")
            print(json_candidate[:500], "...\n")

            try:
                parsed = json.loads(json_candidate)
                print("✅ JSON parsed successfully (regex extraction)")
            except Exception as e2:
                print("❌ JSON parsing FAILED after regex:", e2)
                raise HTTPException(500, "Model returned invalid JSON structure")

        # 7️⃣ Validate structure
        if "questions" not in parsed:
            print("❌ ERROR: 'questions' key missing in JSON")
            raise HTTPException(500, "Missing 'questions' in model response")

        if len(parsed["questions"]) == 0:
            print("❌ ERROR: No questions returned by model")
            raise HTTPException(500, "Model returned empty question list")

        print(f"✅ TOTAL QUESTIONS RETURNED: {len(parsed['questions'])}")

        # 8️⃣ Log activity
        log_activity("quiz_completed", f"Quiz generated: {doc['title']}")

        print("\n✅ QUIZ GENERATION SUCCESSFUL\n")
        print("=============================\n")

        return {
            "message": "Quiz generated",
            "quiz": parsed
        }

    except Exception as e:
        print("\n❌ QUIZ GENERATION ERROR")
        print("❌ ERROR DETAILS:", e)
        print("========================\n")

        return {
            "message": "Quiz generation failed",
            "error": str(e),
            "quiz": {
                "document_title": (doc["title"] if "doc" in locals() else "Unknown"),
                "questions": []
            }
        }

# -----------------------------------------------------
# Dashboard Stats
# -----------------------------------------------------
@app.get("/api/dashboard/stats")
def get_stats():
    docs = supabase.table("documents").select("id").execute().data
    summaries = supabase.table("activity_logs").select("id").eq("action", "summary").execute().data
    chats = supabase.table("activity_logs").select("id").eq("action", "chat").execute().data
    quizzes = supabase.table("activity_logs").select("id").eq("action", "quiz_completed").execute().data

    return {
        "documents": len(docs),
        "summaries": len(summaries),
        "questions_answered": len(chats),
        "quizzes": len(quizzes),
    }


# -----------------------------------------------------
# Dashboard Activity Feed
# -----------------------------------------------------
@app.get("/api/dashboard/activity")
def activity_feed():
    resp = supabase.table("activity_logs").select("*").order("created_at", desc=True).limit(10).execute()
    return resp.data
