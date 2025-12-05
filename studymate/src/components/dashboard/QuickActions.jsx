import React from "react";
import { Link } from "react-router-dom";
import { Upload, MessageSquare, Brain, HelpCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    title: "Upload Materials",
    description: "Add PDFs, notes, and documents.",
    href: "/upload",
    icon: Upload,
    color: "from-primary via-primary/90 to-accent",
  },
  {
    title: "Ask AI",
    description: "Chat with AI about any topic.",
    href: "/chat",
    icon: MessageSquare,
    color: "from-emerald-500 via-emerald-400 to-teal-500",
  },
  {
    title: "Summarize Notes",
    description: "Generate easy summaries.",
    href: "/summarize",
    icon: Brain,
    color: "from-violet-500 via-violet-400 to-indigo-500",
  },
  {
    title: "Practice Quiz",
    description: "Test yourself with auto-generated quizzes.",
    href: "/quiz",
    icon: HelpCircle,
    color: "from-amber-500 via-amber-400 to-orange-500",
  }
];

export function QuickActions() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.title} to={action.href} className="group">
            <Card
              className={cn(
                "relative h-full overflow-hidden p-4 bg-gradient-to-r text-white shadow-md hover:shadow-lg transition-shadow",
                action.color
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/20">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{action.title}</h3>
              <p className="text-xs opacity-90 mt-1">{action.description}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
