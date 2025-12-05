import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChatInterface() {
  const [messages, setMessages] = useState([
    { id: "1", role: "assistant", content: "Hello! Ask me anything from your notes ✨" },
  ]);

  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[75vh] border rounded-xl p-4">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[75%] ${
              msg.role === "user" ? "ml-auto bg-primary text-white" : "bg-muted"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  );
}
