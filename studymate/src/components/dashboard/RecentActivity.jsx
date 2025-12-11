import React from "react";
import { Card } from "@/components/ui/card";
import { FileText, MessageSquare, Brain, HelpCircle } from "lucide-react";

const icons = {
  upload: FileText,
  chat: MessageSquare,
  summary: Brain,
  quiz_completed: HelpCircle,
};

export function RecentActivity({ items }) {
  // 🔥 Show only the most recent 5 items
  const recentFive = (items || []).slice(0, 5);

  return (
    <Card className="rounded-xl border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-muted/40">
        <h3 className="text-sm font-semibold tracking-wide">Recent Activity</h3>
      </div>

      {/* Activity List */}
      <div className="divide-y">
        {recentFive.map((item) => {
          const Icon = icons[item.action] || FileText;

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-4 hover:bg-muted/40 transition rounded-lg"
            >
              {/* Icon Circle */}
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-sm font-medium">{item.details}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(item.created_at).toLocaleString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        {/* If no activity */}
        {recentFive.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">
            No activity yet.
          </p>
        )}
      </div>
    </Card>
  );
}
