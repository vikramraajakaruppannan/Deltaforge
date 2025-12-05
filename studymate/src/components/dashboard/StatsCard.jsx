import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <Card className={cn("flex items-center gap-4 p-5", className)}>
      {/* Icon Section */}
      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
        {Icon && <Icon className="h-6 w-6" />}
      </div>

      {/* Text Section */}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {/* Trend Section */}
      {trend && (
        <div
          className={cn(
            "text-sm font-medium px-2 py-1 rounded-md",
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
