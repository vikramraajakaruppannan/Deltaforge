import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { getDocuments, generateQuiz } from "@/lib/api";

/* ------------------------------
   Helper: Convert A/B/C/D → index
------------------------------ */
const mapAnswerLetter = (letter) => {
  const map = { A: 0, B: 1, C: 2, D: 3 };
  return map[letter] ?? null;
};

export function QuizPanel() {
  const [documents, setDocuments] = useState([]);
  const [docId, setDocId] = useState("");
  const [quiz, setQuiz] = useState(null);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const q = quiz ? quiz.questions[current] : null;
  const correctIndex = q ? mapAnswerLetter(q.answer) : null;

  useEffect(() => {
    getDocuments().then((d) => setDocuments(d || []));
  }, []);

  /* ------------------------------
      Start Quiz
------------------------------ */
  const startQuiz = async () => {
    if (!docId) return;

    setLoading(true);
    try {
      const res = await generateQuiz(docId);

      if (!res.quiz || !Array.isArray(res.quiz.questions)) {
        throw new Error("Invalid quiz format from backend");
      }

      setQuiz(res.quiz);
      setCurrent(0);
      setScore(0);
      setFinished(false);
      setSelected(null);
      setChecked(false);
    } catch (e) {
      alert("Failed to load quiz. Check backend output.");
    }
    setLoading(false);
  };

  /* ------------------------------
      Submit Answer
------------------------------ */
  const handleSubmit = () => {
    if (selected === null) return;

    setChecked(true);

    if (selected === correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  /* ------------------------------
      Next Question
------------------------------ */
  const nextQuestion = () => {
    setSelected(null);
    setChecked(false);

    if (current + 1 < quiz.questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <Card className="p-6 space-y-4 max-w-3xl mx-auto mt-6 shadow-lg rounded-xl">
      {/* Document Selector */}
      <div className="flex gap-3 items-center">
        <select
          className="border px-3 py-2 rounded-lg bg-muted w-full"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
        >
          <option value="">Select Document for Quiz…</option>
          {documents.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>

        <Button onClick={startQuiz} disabled={loading || !docId}>
          {loading ? "Loading…" : "Start Quiz"}
        </Button>
      </div>

      {/* No quiz yet */}
      {!quiz && (
        <p className="text-muted-foreground">Select a document to generate quiz.</p>
      )}

      {/* Quiz Section */}
      {quiz && !finished && q && (
        <div>
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${((current + 1) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={q.question}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4">{q.question}</h3>

              {/* Options */}
              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === correctIndex;
                  const isSelected = idx === selected;

                  let style = "border-border";

                  if (checked) {
                    if (isCorrect) style = "border-green-500 bg-green-100";
                    else if (isSelected) style = "border-red-500 bg-red-100";
                  } else if (isSelected) {
                    style = "border-primary bg-primary/10";
                  }

                  return (
                    <button
                      key={idx}
                      className={`w-full text-left p-3 rounded-lg border transition ${style}`}
                      onClick={() => !checked && setSelected(idx)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Submit / Next */}
              {!checked ? (
                <Button
                  className="w-full mt-5"
                  onClick={handleSubmit}
                  disabled={selected === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <div className="mt-5 space-y-4 text-center">
                  {selected === correctIndex ? (
                    <div className="flex justify-center gap-2 text-green-600 font-medium">
                      <CheckCircle className="h-5 w-5" /> Correct!
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2 text-red-600 font-medium">
                      <XCircle className="h-5 w-5" /> Incorrect
                    </div>
                  )}

                  {/* Explanation */}
                  <p className="text-sm bg-muted p-3 rounded-md border">
                    {q.explanation}
                  </p>

                  <Button className="w-full" onClick={nextQuestion}>
                    Next Question →
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Final Results */}
      {quiz && finished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center"
        >
          <h2 className="text-2xl font-bold">Quiz Completed 🎉</h2>
          <p className="text-lg">
            Score: <b>{score}</b> / {quiz.questions.length}
          </p>

          <Button onClick={startQuiz}>Retry Quiz</Button>
        </motion.div>
      )}
    </Card>
  );
}
