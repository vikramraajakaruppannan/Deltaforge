import os
import mimetypes
from uuid import uuid4
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "documents")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend running"}

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...), title: str = Form(None)):
    try:
        mime = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"
        ext = file.filename.split(".")[-1]
        unique = f"{uuid4()}.{ext}"
        storage_path = f"uploads/{unique}"

        file_bytes = await file.read()

        # ---- STORAGE UPLOAD ----
        try:
            upload_resp = supabase.storage.from_(SUPABASE_BUCKET).upload(
                storage_path,
                file_bytes,
                {"content-type": mime}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Supabase upload failed: {e}")

        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(storage_path)

        # ---- DB INSERT ----
        try:
            insert_resp = supabase.table("documents").insert({
                "title": title or file.filename,
                "file_name": file.filename,
                "storage_path": storage_path,
                "public_url": public_url,
                "size_bytes": len(file_bytes),
            }).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database insert failed: {e}")

        # Handle SDK variations: insert_resp may be dict or object
        data = None
        if isinstance(insert_resp, dict):
            data = insert_resp.get("data")
        else:
            data = getattr(insert_resp, "data", None)

        if not data:
            raise HTTPException(status_code=500, detail="DB insert returned no data")

        return {"message": "Upload successful", "document": data[0]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents")
def get_documents():
    try:
        resp = supabase.table("documents").select("*").order("created_at", desc=True).execute()

        if isinstance(resp, dict):
            return resp.get("data", [])
        else:
            return getattr(resp, "data", [])

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
