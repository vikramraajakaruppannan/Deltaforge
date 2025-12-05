import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Upload from "@/pages/Upload";
import Documents from "@/pages/Documents";
import Chat from "@/pages/Chat";
import Summarize from "@/pages/Summarize";
import Quiz from "@/pages/Quiz";
// import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/summarize" element={<Summarize />} />
        <Route path="/quiz" element={<Quiz />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
