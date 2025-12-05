import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { QuizPanel } from "@/components/quiz/QuizPanel";

export default function Quiz() {
  return (
    <MainLayout>
      <h1 className="text-xl font-semibold mb-6">Practice Quiz</h1>

      <QuizPanel />
    </MainLayout>
  );
}
