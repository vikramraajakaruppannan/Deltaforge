import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function Chat() {
  return (
    <MainLayout>
      <h1 className="text-xl font-semibold mb-6">Ask AI</h1>

      <ChatInterface />
    </MainLayout>
  );
}
