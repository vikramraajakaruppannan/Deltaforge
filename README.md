📘 Smart Campus Assistant – AI-Powered Learning & Document Intelligence Platform

Smart Campus Assistant is an AI-driven academic assistant platform that enables students to upload study materials (PDFs) and interact with them through document-based chat, structured summaries, auto-generated quizzes, and an activity-driven dashboard.

The system is built using FastAPI, local embeddings, Retrieval-Augmented Generation (RAG), Groq LLMs, Supabase, and a modern React UI, making it robust, explainable, and production-ready.

🚀 Key Features

📄 Upload and manage academic documents (PDFs)

🧠 AI-powered structured summarization

💬 Ask questions strictly from uploaded documents (RAG)

🔍 Semantic search using local embeddings

📝 Auto-generated MCQ quizzes (15 questions)

📊 Dynamic dashboard with stats and recent activity

🧩 Graceful fallback when answers are not found

🔐 Secure, scalable backend architecture

🧠 System Architecture
User (Web UI)
   ↓
FastAPI Backend
   ↓
PDF Upload & Parsing
   ↓
Text Chunking
   ↓
Local Embeddings (Sentence Transformers)
   ↓
Vector Similarity Search (RAG)
   ↓
Groq LLM (LLaMA 3)
   ↓
Chat / Summary / Quiz
   ↓
Dashboard Analytics

🧠 AI Pipeline Design
1️⃣ Document Upload & Embedding

Endpoint

POST /api/documents/upload


Process

Upload PDF file

Extract text using PyMuPDF

Split content into chunks

Generate local embeddings

Store vectors in Supabase

2️⃣ AI Summarization Layer

Endpoint

POST /api/summarize/{doc_id}


Capabilities

Produces structured, topic-wise summaries

Ensures clean JSON output

Handles malformed LLM responses safely

3️⃣ Chat With Document (RAG)

Endpoint

POST /api/chat/{doc_id}


Features

Uses document-only context

Prevents hallucination

Returns accurate, explainable answers

Gracefully responds when content is unavailable

4️⃣ Quiz Generator (Hybrid AI)

Endpoint

POST /api/quiz/{doc_id}


Highlights

Generates exactly 15 MCQs

Difficulty levels: Easy / Medium / Hard

Includes explanations and sources

Works even with partial document context

5️⃣ Dashboard & Activity Tracking

Endpoints

GET /api/dashboard/stats
GET /api/dashboard/activity


Tracked Actions

Document uploads

Chat interactions

Summaries generated

Quizzes completed

🗂️ Project Structure
🔹 Backend (FastAPI)
backend/
├── main.py
├── helpers/
│   ├── pdf_utils.py
│   ├── embedding_utils.py
│   ├── llm_utils.py
│
├── routes/
│   ├── documents.py
│   ├── chat.py
│   ├── summarize.py
│   ├── quiz.py
│   ├── dashboard.py
│
├── requirements.txt
└── README.md

🔹 Frontend (React)
frontend/
├── components/
│   ├── ChatInterface.jsx
│   ├── SummarizePanel.jsx
│   ├── QuizPanel.jsx
│   ├── Dashboard/
│   │   ├── StatsCard.jsx
│   │   ├── RecentActivity.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Chat.jsx
│   ├── Upload.jsx
│
├── lib/
│   └── api.js
└── main.jsx

🛠️ Tech Stack
Layer	Technology
Backend	FastAPI, Python
AI / LLM	Groq (LLaMA 3.3)
Embeddings	Sentence Transformers (Local)
Vector Search	Supabase RPC
Database	Supabase (PostgreSQL)
Frontend	React, Tailwind CSS
UI	Shadcn UI, Lucide Icons
📦 Database Schema
documents
id UUID PRIMARY KEY
title TEXT
file_name TEXT
storage_path TEXT
public_url TEXT
size_bytes INT
created_at TIMESTAMP

document_chunks
id UUID PRIMARY KEY
doc_id UUID
chunk_index INT
text TEXT
embedding VECTOR

activity_logs
id UUID PRIMARY KEY
action TEXT
details TEXT
created_at TIMESTAMP

🔍 Example User Queries

“Summarize this document”

“Explain human values from this PDF”

“Generate a quiz from this document”

“Ask questions only from the uploaded file”

🧪 Error Handling & Reliability

Prevents hallucinations using strict document context

Handles malformed AI responses gracefully

Embedding dimension mismatch protection

Non-blocking activity logging

🌱 Future Enhancements

User authentication & personalization

Voice-based document interaction

Multi-document chat support

Cloud deployment using Docker

Mobile-responsive UI

👨‍💻 Author

Vikram Karuppannan
B.Tech – Artificial Intelligence & Data Science
FastAPI | AI Systems | RAG | Backend Engineering

⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork and contribute

💬 Share feedback
