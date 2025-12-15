# 📘 Smart Campus Assistant – AI-Powered Learning & Document Intelligence Platform

Smart Campus Assistant is an **AI-driven academic assistant platform** that enables students to **upload study materials (PDFs)** and interact with them through **document-based chat, structured summaries, auto-generated quizzes, and an activity-driven dashboard**.

The system is built using **FastAPI, local embeddings, Retrieval-Augmented Generation (RAG), Groq LLMs, Supabase, and a modern React UI**, making it **robust, explainable, and production-ready**.

---

## 🚀 Key Features

- 📄 Upload and manage academic documents (PDFs)
- 🧠 AI-powered structured summarization
- 💬 Ask questions strictly from uploaded documents (RAG)
- 🔍 Semantic search using local embeddings
- 📝 Auto-generated MCQ quizzes (15 questions)
- 📊 Dynamic dashboard with stats and recent activity
- 🧩 Graceful fallback when answers are not found
- 🔐 Secure, scalable backend architecture

---

## 🧠 System Architecture

```text
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
