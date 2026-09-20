"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Lightbulb, Palette, CalendarDays, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/studio", label: "Studio", icon: Palette },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/school", label: "School", icon: GraduationCap },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t-[2.5px] border-ink bg-paper pb-[env(safe-area-inset-bottom)] md:max-w-5xl md:rounded-t-card md:border-x-[2.5px]"
      aria-label="Main"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold",
                  active ? "text-ink" : "text-ink-soft/70",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative flex size-9 items-center justify-center">
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="outline-brutal absolute inset-0 rounded-full bg-lemon"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="relative size-5" strokeWidth={2.5} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
