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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatInterface() {
  const [docId, setDocId] = useState("");
  const [documents, setDocuments] = useState([]);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! Select a document and ask me anything from it ✨",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    getDocuments().then((d) => setDocuments(d || []));
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !docId) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatWithDocument(docId, input);

      const assistantMsg = {
        id: Date.now().toString() + "_ai",
        role: "assistant",
        content: res.answer,
        sources: res.sources,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          role: "assistant",
          content:
            "⚠️ Failed to fetch answer. Make sure embeddings exist for this document.",
        },
      ]);
    }

    setLoading(false);
    setInput("");
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Document Selector */}
      <Card className="p-4 flex items-center gap-4 border shadow-sm">
        <FileText className="h-5 w-5 text-primary" />

        <select
          className="border px-3 py-2 rounded-md w-full bg-muted"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
        >
          <option value="">📄 Select a document…</option>
          {documents.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title || d.file_name}
            </option>
          ))}
        </select>
      </Card>

      {/* Chat Window */}
      <Card
        ref={chatRef}
        className="p-4 h-[65vh] overflow-y-auto space-y-4 rounded-xl shadow-inner"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing Indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-muted w-fit px-4 py-2 rounded-xl flex gap-2 items-center text-sm"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Thinking…
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Input Row */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask something from this document…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!docId}
        />
        <Button onClick={send} disabled={loading || !docId}>
          {loading ? <Loader2 className="animate-spin" /> : "Send"}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------
   Chat Bubble Component
------------------------------ */
function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-xl max-w-[80%] shadow-sm ${
        isUser
          ? "ml-auto bg-primary text-white"
          : "bg-muted text-foreground border"
      }`}
    >
      <p className="whitespace-pre-wrap">{msg.content}</p>

      {/* Sources */}
      {!isUser && msg.sources && msg.sources.length > 0 && (
        <div className="mt-3">
          <button
            className="text-xs flex items-center gap-1 opacity-80 hover:opacity-100"
            onClick={() => setOpen(!open)}
          >
            <MessageSquare className="h-3 w-3" />
            {msg.sources.length} sources used
            {open ? <ChevronUp className="h-3" /> : <ChevronDown className="h-3" />}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 bg-background border rounded-md p-2 text-xs space-y-2"
              >
                {msg.sources.map((s, i) => (
                  <div key={i} className="p-2 bg-muted rounded-md">
                    <strong>Chunk {s.chunk_index}</strong>
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
