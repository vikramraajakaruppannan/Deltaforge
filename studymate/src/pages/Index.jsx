import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { getStats, getActivity } from "@/lib/dashboard";

import { MessageSquare, FileText, Brain, HelpCircle } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    getStats().then(setStats);
    getActivity().then(setActivity);
  }, []);

  if (!stats)
    return <p className="text-center mt-10 text-muted-foreground">Loading dashboard…</p>;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Questions Answered"
          value={stats.questions_answered}
          subtitle="Through Ask AI"
          icon={MessageSquare}
        />
        <StatsCard
          title="Documents Uploaded"
          value={stats.documents}
          subtitle="Your study materials"
          icon={FileText}
        />
        <StatsCard
          title="Summaries Generated"
          value={stats.summaries}
          subtitle="From your notes"
          icon={Brain}
        />
        <StatsCard
          title="Quizzes Completed"
          value={stats.quizzes}
          subtitle="Good progress!"
          icon={HelpCircle}
        />
      </div>

      <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
      <QuickActions />

      <h2 className="text-lg font-semibold mt-8 mb-3">Recent Activity</h2>
      <RecentActivity items={activity} />
    </MainLayout>
  );
}
