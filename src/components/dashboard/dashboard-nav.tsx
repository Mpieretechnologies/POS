"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3Icon,
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/dashboard/billing", label: "Billing", icon: ShoppingCartIcon },
  { href: "/dashboard/inventory", label: "Inventory", icon: PackageIcon },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3Icon },
];

export const DashboardNav = () => {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card/50">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 md:px-10">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
