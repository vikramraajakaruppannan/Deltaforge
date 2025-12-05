import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SummarizePanel } from "@/components/summarize/SummarizePanel";

export default function Summarize() {
  return (
    <MainLayout>
      <h1 className="text-xl font-semibold mb-6">Summarize Notes</h1>

      <SummarizePanel />
    </MainLayout>
  );
}
