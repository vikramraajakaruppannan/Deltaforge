import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import {
  MessageSquare,
  FileText,
  Brain,
  HelpCircle
} from "lucide-react";

export default function Index() {
  return (
    <MainLayout>
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Questions Answered"
          value={128}
          subtitle="Last 7 days"
          icon={MessageSquare}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Documents Uploaded"
          value={34}
          subtitle="Study materials"
          icon={FileText}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Summaries Generated"
          value={18}
          icon={Brain}
          subtitle="Based on documents"
        />
        <StatsCard
          title="Quizzes Completed"
          value={10}
          icon={HelpCircle}
          subtitle="Average score: 82%"
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
      <QuickActions />

      {/* Recent Activity */}
      <h2 className="text-lg font-semibold mt-8 mb-3">Recent Activity</h2>
      <RecentActivity />
    </MainLayout>
  );
}
