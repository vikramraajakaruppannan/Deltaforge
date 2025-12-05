import React from "react";
import { Card } from "@/components/ui/card";
import { FileText, MessageSquare, Brain, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  upload: FileText,
  chat: MessageSquare,
  summarize: Brain,
  quiz: HelpCircle
};

const typeColors = {
  upload: "bg-blue-100 text-blue-700",
  chat: "bg-green-100 text-green-700",
  summarize: "bg-purple-100 text-purple-700",
  quiz: "bg-orange-100 text-orange-700",
};

const ACTIVITY = [
  { id: 1, type: "upload", text: "Uploaded study material", time: "2 hrs ago" },
  { id: 2, type: "chat", text: "Asked AI about Calculus", time: "5 hrs ago" },
  { id: 3, type: "summarize", text: "Generated a summary", time: "1 day ago" },
  { id: 4, type: "quiz", text: "Completed a quiz", time: "2 days ago" }
];

export function RecentActivity() {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Recent Activity</h3>
      </div>

      <div>
        {ACTIVITY.map((item) => {
          const Icon = ICONS[item.type];
          const color = typeColors[item.type];

          return (
            <div key={item.id} className="p-4 flex items-center gap-4 border-b border-border">
              <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg", color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
