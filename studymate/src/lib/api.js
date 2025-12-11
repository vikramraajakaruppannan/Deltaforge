// src/lib/api.js

const API_BASE_URL = "http://127.0.0.1:8000";

export async function uploadDocument(file, title) {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Upload error response:", text);
    throw new Error("Upload failed");
  }

  return res.json();
}

export async function getDocuments() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("getDocuments HTTP error:", text);
      throw new Error("Failed to fetch documents");
    }

    const data = await res.json();
    console.log("getDocuments raw data:", data);

    // If backend returns an array (your case)
    if (Array.isArray(data)) return data;

    // If backend ever returns { data: [...] }
    if (data && Array.isArray(data.data)) return data.data;

    return [];
  } catch (err) {
    console.error("getDocuments() threw:", err);
    throw err;
  }
}

export async function deleteDocument(id) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export async function getDocument(id) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}`);
  if (!res.ok) throw new Error("Failed to fetch single document");
  return res.json();
}

export function getDocumentStreamUrl(id) {
  return `${API_BASE_URL}/api/documents/stream/${id}`;
}


export async function summarizeDocument(docId) {
  const res = await fetch(`${API_BASE_URL}/api/summarize/${docId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to summarize");

  return res.json();
}

export async function chatWithDocument(docId, question) {
  const res = await fetch(`${API_BASE_URL}/api/chat/${docId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

export async function generateQuiz(docId) {
  const res = await fetch(`http://127.0.0.1:8000/api/quiz/${docId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Quiz generation failed");
  return res.json();
}
