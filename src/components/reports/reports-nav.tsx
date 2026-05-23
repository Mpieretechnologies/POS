"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard/reports", label: "Overview" },
  { href: "/dashboard/reports/daily", label: "Daily" },
  { href: "/dashboard/reports/monthly", label: "Monthly" },
  { href: "/dashboard/reports/products", label: "Products" },
  { href: "/dashboard/reports/employees", label: "Employees" },
];

export const ReportsNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 rounded-xl border bg-card p-1">
      {items.map(({ href, label }) => {
        const isActive =
          href === "/dashboard/reports"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};
