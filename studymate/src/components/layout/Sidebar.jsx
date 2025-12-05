import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  FileText,
  Brain,
  HelpCircle,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "My Documents", href: "/documents", icon: FileText },
  { name: "Ask AI", href: "/chat", icon: MessageSquare },
  { name: "Summarize", href: "/summarize", icon: Brain },
  { name: "Quiz", href: "/quiz", icon: HelpCircle },
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border shadow-sm transition-transform",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
          <div className="h-9 w-9 flex items-center justify-center bg-primary text-white rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Studymate AI</p>
            <p className="text-xs text-muted-foreground">
              Your AI learning companion
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "text-muted-foreground hover:bg-accent hover:text-foreground",
                    isActive && "bg-primary/10 text-primary"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* BACKDROP (Mobile Only) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
