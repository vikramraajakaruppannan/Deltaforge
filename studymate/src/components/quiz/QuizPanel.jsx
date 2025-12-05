import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  {
    id: 1,
    question: "What is AI?",
    answers: ["Machine learning", "Human thinking", "Biology"],
    correct: 0,
  },
];

export function QuizPanel() {
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[current];

  const check = () => {
    if (answer === null) return;
    setFinished(true);
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">{q.question}</h3>

      <div className="space-y-2">
        {q.answers.map((a, idx) => (
          <button
            key={idx}
            className={`w-full text-left p-3 rounded-md border ${
              answer === idx ? "border-primary bg-primary/10" : "border-border"
            }`}
            onClick={() => setAnswer(idx)}
          >
            {a}
          </button>
        ))}
      </div>

      {!finished ? (
        <Button className="mt-4 w-full" onClick={check}>Submit</Button>
      ) : (
        <p className="mt-4 font-medium">
          {answer === q.correct ? "🎉 Correct!" : "❌ Wrong Answer"}
        </p>
      )}
    </Card>
  );
}
