import React from "react";
import { Link } from "react-router-dom";
import { Upload, MessageSquare, Brain, HelpCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const ACTIONS = [
  {
    title: "Upload Materials",
    description: "Add PDFs, notes, or documents.",
    href: "/upload",
    icon: Upload,
    color: "from-primary/90 via-primary to-primary/70",
  },
  {
    title: "Ask AI",
    description: "Chat with AI about your notes.",
    href: "/chat",
    icon: MessageSquare,
    color: "from-emerald-500 via-emerald-400 to-teal-500",
  },
  {
    title: "Summarize Notes",
    description: "Convert notes into clear summaries.",
    href: "/summarize",
    icon: Brain,
    color: "from-violet-500 via-violet-400 to-indigo-500",
  },
  {
    title: "Practice Quiz",
    description: "Master concepts with quizzes.",
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
          <Link key={action.title} to={action.href}>
            <Card
              className={`
                group relative h-full overflow-hidden p-5 
                bg-gradient-to-br ${action.color} text-white
                shadow-md hover:shadow-xl transition-all rounded-xl cursor-pointer
              `}
            >
              <div className="flex justify-between items-center">
                <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-black/20">
                  <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </div>

                <ArrowRight className="h-4 w-4 opacity-80 group-hover:translate-x-1 transition-transform" />
              </div>

              <h3 className="mt-4 text-lg font-semibold">{action.title}</h3>
              <p className="text-xs mt-1 opacity-90">{action.description}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
