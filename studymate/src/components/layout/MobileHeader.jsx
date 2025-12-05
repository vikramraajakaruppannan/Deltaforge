import { GraduationCap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileHeader({ setMobileOpen }) {
  return (
    <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 flex items-center justify-center bg-primary text-white rounded-lg">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-semibold text-sm">Studymate AI</span>
      </div>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  );
}
