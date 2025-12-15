# 📘 Smart Campus Assistant

The **Smart Campus Assistant** is an AI-powered learning platform designed to revolutionize how students interact with their PDF study materials. It leverages state-of-the-art Generative AI and Retrieval-Augmented Generation (RAG) to provide chat, structured summaries, and auto-generated quizzes directly from uploaded documents.

---

## 🚀 Features

* ✅ **Upload PDF Study Materials:** Easily upload and process any educational PDF.
* 💬 **Document Chat:** Ask specific questions and get answers *only* from the uploaded document content, preventing AI hallucinations.
* 📝 **Structured Summaries:** Generate high-quality, organized summaries of complex documents.
* 🧠 **Auto-Generated Quizzes:** Instantly create 15-question Multiple Choice Quizzes (MCQs) for self-assessment.
* 📊 **Activity Dashboard:** Track your learning progress with key usage metrics and recent activity feeds.
* 🔒 **Hallucination Prevention:** The system is strictly grounded in the document content via RAG.

---

## 🛠️ Tech Stack

This project is built using a modern, efficient, and scalable technology stack.

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | **FastAPI (Python)** | High-performance, asynchronous web framework for the API. |
| **AI Model** | **Groq LLaMA 3** | Utilized for low-latency, high-throughput text generation (Chat, Summary, Quiz). |
| **Embeddings** | **Sentence Transformers** | Local model for converting text chunks into dense vectors. |
| **Database** | **Supabase (PostgreSQL)** | Used for robust data persistence and as the Vector Store for embeddings. |
| **Frontend** | **React + Tailwind CSS** | Modern component-based UI with utility-first styling for a responsive design. |

---

## 🧠 How It Works: The RAG Pipeline

The core intelligence of the assistant is powered by a Retrieval-Augmented Generation (RAG) workflow, ensuring outputs are accurate and contextually relevant to the uploaded documents.

1.  **PDF Upload & Extraction:** The PDF is uploaded and its text content is extracted.
2.  **Chunking:** The text is divided into manageable, overlapping chunks.
3.  **Local Embedding:** Each chunk is converted into a vector representation using Sentence Transformers.
4.  **Vector Storage:** These vectors are stored in the Supabase Vector Store.
5.  **RAG Search:** When a user asks a question, the query is embedded and used to retrieve the most relevant source document chunks.
6.  **LLM Generation:** The retrieved chunks are passed as **context** to the Groq LLaMA 3 model, which then generates the final, grounded **Answer / Summary / Quiz**.

---

## 🔗 API Overview

The backend exposes a clean and logical set of REST endpoints managed by FastAPI.

| Feature | HTTP Method | Endpoint | Details |
| :--- | :--- | :--- | :--- |
| **Upload Document** | `POST` | `/api/documents/upload` | Uploads and processes a new PDF. |
| **Document Chat** | `POST` | `/api/chat/{doc_id}` | Asks a question about a specific document. |
| **Summarize** | `POST` | `/api/summarize/{doc_id}` | Generates a structured summary. |
| **Generate Quiz** | `POST` | `/api/quiz/{doc_id}` | Creates the 15-question MCQ. |
| **Dashboard Stats** | `GET` | `/api/dashboard/stats` | Retrieves key usage statistics. |
| **Recent Activity** | `GET` | `/api/dashboard/activity` | Fetches the feed of recent user interactions. |


## 📈 Dashboard Metrics

The dashboard provides users with transparent insight into their learning activity:

* **Documents Uploaded**
* **Questions Asked**
* **Summaries Generated**
* **Quizzes Completed**
* **Recent Activity Feed**
