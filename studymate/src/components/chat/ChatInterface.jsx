import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDocuments, chatWithDocument } from "@/lib/api";
import {
  Loader2,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  SendHorizonal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------------------------
   📌 Chat Interface Component
------------------------------------------------- */
export function ChatInterface() {
  const [docId, setDocId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Welcome! Select a document and ask anything from it.",
    },
  ]);

  const chatRef = useRef(null);

  /* Fetch documents on load */
  useEffect(() => {
    getDocuments().then((d) => setDocuments(d || []));
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* ---------------------------------------
     SEND MESSAGE (Press button)
  --------------------------------------- */
  const send = async () => {
    if (!input.trim() || !docId) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatWithDocument(docId, userMsg.content);

      const assistantMsg = {
        id: `${Date.now()}_ai`,
        role: "assistant",
        content: res.answer,
        sources: res.sources,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}_err`,
          role: "assistant",
          content: "⚠️ Unable to answer. Ensure embeddings exist for this document.",
        },
      ]);
    }

    setLoading(false);
  };

  /* ---------------------------------------
     ENTER TO SEND (Shift+Enter → new line)
  --------------------------------------- */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-5">
      {/* -------------------------------
         Document Selector Card (Fancy)
      -------------------------------- */}
      <Card className="p-4 flex items-center gap-4 rounded-2xl shadow-lg border bg-gradient-to-r from-muted to-background/40 backdrop-blur">
        <FileText className="h-6 w-6 text-primary" />

        <select
          className="border px-3 py-2 rounded-md w-full bg-muted/60 backdrop-blur text-sm shadow-sm"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
        >
          <option value="">📄 Select your document…</option>
          {documents.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title || d.file_name}
            </option>
          ))}
        </select>
      </Card>

      {/* -------------------------------
         Chat Window
      -------------------------------- */}
      <Card
        ref={chatRef}
        className="p-6 h-[70vh] overflow-y-auto space-y-5 rounded-2xl shadow-inner border bg-background/80 backdrop-blur"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}

        {/* AI Typing Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-muted px-4 py-2 rounded-xl w-fit flex gap-2 items-center text-sm shadow-md"
            >
              <Loader2 className="animate-spin h-4 w-4 text-primary" />
              Thinking…
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* -------------------------------
         Input Field + Send Button
      -------------------------------- */}
      <div className="flex gap-3 items-center">
        <textarea
          placeholder={
            docId ? "Ask something from this document…" : "Select a document first…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          rows={1}
          className="flex-1 border rounded-xl px-4 py-3 resize-none bg-muted/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <Button
          onClick={send}
          disabled={!docId || loading}
          className="px-5 py-3 flex items-center gap-2 rounded-xl shadow-lg"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   🌟 Chat Bubble Component (upgraded UI)
------------------------------------------------- */
function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl max-w-[80%] shadow-md whitespace-pre-wrap leading-relaxed ${
        isUser
          ? "ml-auto bg-primary text-white"
          : "bg-muted text-foreground border backdrop-blur"
      }`}
    >
      <p>{msg.content}</p>

      {/* RAG Sources */}
      {!isUser && msg.sources?.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setOpen(!open)}
            className="text-xs opacity-80 flex items-center gap-1 hover:opacity-100"
          >
            <MessageSquare className="h-3 w-3" />
            {msg.sources.length} context chunks used
            {open ? <ChevronUp className="h-3" /> : <ChevronDown className="h-3" />}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 bg-background border rounded-xl p-3 text-xs space-y-3 shadow-sm"
              >
                {msg.sources.map((s, i) => (
                  <div
                    key={i}
                    className="p-2 bg-muted rounded-md border shadow-sm"
                  >
                    <strong className="block text-primary">📌 Chunk {s.chunk_index}</strong>
                    <p className="opacity-80">{s.text}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
