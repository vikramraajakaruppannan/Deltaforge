import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <Card
      className={cn(
        "flex items-center gap-4 p-5 hover:shadow-md transition-all rounded-xl border bg-card",
        className
      )}
    >
      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary shadow-inner">
        {Icon && <Icon className="h-6 w-6" />}
      </div>

      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>

        <p className="text-3xl font-bold mt-1 bg-clip-text text-primary/90">
          {value}
        </p>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div
          className={cn(
            "text-sm font-medium px-2 py-1 rounded-md shadow-sm",
            trend.isPositive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {trend.isPositive ? "+" : "-"}
          {trend.value}%
        </div>
      )}
    </Card>
  );
}
