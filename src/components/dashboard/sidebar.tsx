"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CreditCard,
  Key,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bots", label: "Chatbots", icon: Bot },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel flex h-full w-64 shrink-0 flex-col border-r border-white/10 p-4">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
          <Bot className="h-5 w-5" />
        </span>
        <span className="font-semibold text-foreground">ChatForge</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
