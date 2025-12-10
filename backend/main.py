import os
import mimetypes
import re
from uuid import uuid4
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from supabase import create_client, Client
import fitz
from groq import Groq
import json

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "documents")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_pdf_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()


# ---------------------------
# 📌 Upload Document (same)
# ---------------------------
@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...), title: str = Form(None)):
    try:
        mime = file.content_type or mimetypes.guess_type(file.filename)[0]
        ext = file.filename.split(".")[-1]
        unique = f"{uuid4()}.{ext}"
        storage_path = f"uploads/{unique}"

        file_bytes = await file.read()

        supabase.storage.from_(SUPABASE_Bucket).upload(
            storage_path,
            file_bytes,
            {"content-type": mime}
        )

        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(storage_path)

        insert_resp = supabase.table("documents").insert({
            "title": title or file.filename,
            "file_name": file.filename,
            "storage_path": storage_path,
            "public_url": public_url,
            "size_bytes": len(file_bytes),
        }).execute()

        return {
            "message": "Upload complete",
            "document": insert_resp.data[0]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents")
def get_documents():
    r = supabase.table("documents").select("*").order("created_at", desc=True).execute()
    return r.data


@app.get("/api/documents/{doc_id}")
def get_document(doc_id: str):
    r = supabase.table("documents").select("*").eq("id", doc_id).single().execute()
    return r.data


@app.get("/api/documents/stream/{doc_id}")
def stream_document(doc_id: str):
    row = supabase.table("documents").select("storage_path").eq("id", doc_id).single().execute()
    storage_path = row.data["storage_path"]
    file_obj = supabase.storage.from_(SUPABASE_BUCKET).download(storage_path)
    return StreamingResponse(file_obj, media_type="application/pdf")


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str):
    row = supabase.table("documents").select("storage_path").eq("id", doc_id).single().execute()
    storage_path = row.data["storage_path"]

    supabase.storage.from_(SUPABASE_BUCKET).remove([storage_path])
    supabase.table("documents").delete().eq("id", doc_id).execute()

    return {"message": "Document deleted"}


# -------------------------------------------------------------
# ⭐ GROQ SUMMARIZATION ENDPOINT (REPLACES GEMINI COMPLETELY)
# -------------------------------------------------------------
@app.post("/api/summarize/{doc_id}")
def summarize_document(doc_id: str):
    try:
        print("\n--- GROQ SUMMARY START ---")
        print("DOC ID:", doc_id)

        resp = supabase.table("documents").select("*").eq("id", doc_id).single().execute()
        if not resp.data:
            raise HTTPException(status_code=404, detail="Document not found")

        row = resp.data

        file_obj = supabase.storage.from_(SUPABASE_BUCKET).download(row["storage_path"])
        pdf_bytes = file_obj

        full_text = extract_pdf_text(pdf_bytes)
        print("Extracted length:", len(full_text))

        trimmed = full_text[:12000]

        prompt = f"""
You are a structured summarization assistant.
Analyze the document and produce a JSON summary.

Return ONLY valid JSON with the shape:

{{
  "document_title": "<string>",
  "sections": [
    {{
      "heading": "<heading>",
      "summary": ["point 1", "point 2", ...]
    }}
  ]
}}

DOCUMENT:
{trimmed}
"""

        # ----------- FIXED GROQ CALL -----------
        groq_response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        # ❌ WRONG:  message["content"]
        # ✔ RIGHT:   message.content
        output_text = groq_response.choices[0].message.content.strip()

        print("Raw model output:", output_text[:400])

        cleaned = output_text.replace("```json", "").replace("```", "").strip()

        parsed = json.loads(cleaned)

        final_sections = []
        for sec in parsed.get("sections", []):
            summary = sec.get("summary")

            # Convert summary string → list
            if isinstance(summary, str):
                summary = [line.strip() for line in summary.split("\n") if line.strip()]

            final_sections.append({
                "heading": sec.get("heading", "Section"),
                "summary": summary
            })

        return {
            "document_title": parsed.get("document_title", row["title"]),
            "total_sections": len(final_sections),
            "sections": final_sections
        }

    except Exception as e:
        print("❌ ERROR in summarize:", e)
        raise HTTPException(status_code=500, detail=str(e))

