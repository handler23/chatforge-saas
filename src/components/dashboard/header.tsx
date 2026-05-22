"use client";

import { LogOut, Menu } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
  email,
  workspaceName,
  onMenuClick,
}: {
  email: string;
  workspaceName: string;
  onMenuClick?: () => void;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">Workspace</p>
          <p className="font-medium text-foreground">{workspaceName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
        <ThemeToggle />
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
