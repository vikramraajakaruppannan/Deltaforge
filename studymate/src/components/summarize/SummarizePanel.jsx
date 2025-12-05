import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SummarizePanel() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");

  const summarize = () => {
    if (!text.trim()) return;
    setOutput("This is a sample summary preview...");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Enter Text</h3>
        <Textarea
          rows={10}
          placeholder="Paste your notes..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button className="mt-3 w-full" onClick={summarize}>
          Summarize
        </Button>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Summary</h3>
        <p className="text-sm text-muted-foreground">{output || "No summary yet."}</p>
      </Card>
    </div>
  );
}
