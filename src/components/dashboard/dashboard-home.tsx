"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BarChart3Icon,
  IndianRupeeIcon,
  LogOutIcon,
  MonitorIcon,
  PackageIcon,
  ReceiptIcon,
  RefreshCwIcon,
  ShieldIcon,
  ShoppingCartIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { RoleGate } from "@/components/auth/role-gate";
import { ChartSkeleton } from "@/components/charts/chart-skeleton";
import { StockAlertCard } from "@/components/inventory/stock-alert-card";
import { RecentTransactionsTable } from "@/components/reports/recent-transactions-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useInventoryStats } from "@/hooks/use-inventory-stats";
import { useReports } from "@/hooks/use-reports";
import { getStoreName } from "@/lib/store-config";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";

const SalesChart = dynamic(
  () => import("@/components/charts/sales-chart").then((mod) => mod.SalesChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getDisplayName = (displayName?: string, email?: string): string => {
  if (displayName?.trim()) return displayName.trim();
  if (email) return email.split("@")[0] ?? "there";
  return "there";
};

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

type QuickAction = {
  href: string;
  title: string;
  description: string;
  icon: typeof ShoppingCartIcon;
  accent: string;
  featured?: boolean;
};

const quickActions: QuickAction[] = [
  {
    href: "/dashboard/pos",
    title: "POS",
    description: "Full-screen checkout mode for counter sales.",
    icon: MonitorIcon,
    accent: "from-emerald-500/20 to-emerald-600/5 text-emerald-700 dark:text-emerald-300",
    featured: true,
  },
  {
    href: "/dashboard/billing",
    title: "Billing",
    description: "Standard checkout with search and barcode scan.",
    icon: ShoppingCartIcon,
    accent: "from-teal-500/20 to-teal-600/5 text-teal-700 dark:text-teal-300",
  },
  {
    href: "/dashboard/inventory",
    title: "Inventory",
    description: "Manage products, stock levels, and pricing.",
    icon: PackageIcon,
    accent: "from-sky-500/20 to-sky-600/5 text-sky-700 dark:text-sky-300",
  },
  {
    href: "/dashboard/reports",
    title: "Reports",
    description: "Analytics, trends, and exportable sales data.",
    icon: BarChart3Icon,
    accent: "from-violet-500/20 to-violet-600/5 text-violet-700 dark:text-violet-300",
  },
  {
    href: "/dashboard/admin",
    title: "Admin",
    description: "User roles and store administration.",
    icon: ShieldIcon,
    accent: "from-amber-500/20 to-amber-600/5 text-amber-700 dark:text-amber-300",
  },
];

type StatCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: typeof IndianRupeeIcon;
  iconClassName: string;
  trend?: { value: number; label: string };
  loading?: boolean;
};

const StatCard = ({
  title,
  value,
  hint,
  icon: Icon,
  iconClassName,
  trend,
  loading,
}: StatCardProps) => {
  if (loading) {
    return <Skeleton className="h-[7.5rem] rounded-xl" />;
  }

  const isPositive = trend && trend.value >= 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-60" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          {trend ? (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
              )}
            >
              {isPositive ? (
                <TrendingUpIcon className="size-3.5" />
              ) : (
                <TrendingDownIcon className="size-3.5" />
              )}
              {isPositive ? "+" : ""}
              {trend.value.toFixed(1)}% {trend.label}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
            iconClassName,
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
};

export const DashboardHome = () => {
  const router = useRouter();
  const { appUser, signOutApp, loading: authLoading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const isAdmin = appUser?.role === "ADMIN";
  const employeeId = isAdmin ? undefined : appUser?.uid;

  const { analytics, loading: reportsLoading, error: reportsError, reload } = useReports({
    employeeId,
    enabled: !authLoading && Boolean(appUser),
  });

  const {
    stats: inventoryStats,
    loading: inventoryLoading,
    reload: reloadInventory,
  } = useInventoryStats();

  const displayName = getDisplayName(appUser?.displayName, appUser?.email);
  const greeting = getGreeting();
  const storeName = getStoreName();
  const loading = authLoading || reportsLoading;

  const recentTransactions = useMemo(
    () => analytics?.recentTransactions.slice(0, 5) ?? [],
    [analytics?.recentTransactions],
  );

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await signOutApp();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  };

  const handleRefresh = () => {
    void reload();
    void reloadInventory();
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/[0.08] via-card to-card shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.55 0.12 250 / 0.15), transparent 45%), radial-gradient(circle at 80% 0%, oklch(0.65 0.14 160 / 0.12), transparent 40%)",
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 size-48 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-md ring-4 ring-primary/10">
              {authLoading ? <Skeleton className="size-8 rounded-lg" /> : getInitials(displayName)}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{storeName}</p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight md:text-3xl">
                {greeting}, {authLoading ? "…" : displayName}
              </h1>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                {isAdmin
                  ? "Your store overview — sales, inventory, and performance at a glance."
                  : "Your personal sales hub — track today’s performance and jump into checkout."}
              </p>
              {appUser ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant={isAdmin ? "default" : "secondary"}>{appUser.role}</Badge>
                  <span className="text-xs text-muted-foreground">{appUser.email}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCwIcon className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={signingOut}>
              <LogOutIcon className="size-4" />
              {signingOut ? "Signing out…" : "Log out"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/billing" />}
            >
              <ShoppingCartIcon className="size-4" />
              Billing
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/pos" />}
              className="shadow-sm"
            >
              <MonitorIcon className="size-4" />
              Open POS
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* KPI row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's revenue"
          value={analytics ? formatCurrency(analytics.dailyRevenue) : "—"}
          hint="Sales recorded today"
          icon={IndianRupeeIcon}
          iconClassName="from-emerald-500/25 to-emerald-600/10 text-emerald-700 dark:text-emerald-300"
          loading={loading}
        />
        <StatCard
          title="Last 7 days"
          value={analytics ? formatCurrency(analytics.summary.totalRevenue) : "—"}
          hint={
            analytics
              ? `${analytics.summary.totalOrders} orders · AOV ${formatCurrency(analytics.summary.averageOrderValue)}`
              : "Weekly performance"
          }
          icon={ReceiptIcon}
          iconClassName="from-sky-500/25 to-sky-600/10 text-sky-700 dark:text-sky-300"
          trend={
            analytics
              ? { value: analytics.growthPercentage, label: "vs previous period" }
              : undefined
          }
          loading={loading}
        />
        <StatCard
          title="This month"
          value={analytics ? formatCurrency(analytics.monthlyRevenue) : "—"}
          hint="Month-to-date revenue"
          icon={TrendingUpIcon}
          iconClassName="from-violet-500/25 to-violet-600/10 text-violet-700 dark:text-violet-300"
          loading={loading}
        />
        <StatCard
          title="Products"
          value={inventoryLoading ? "—" : String(inventoryStats.totalProducts)}
          hint={
            inventoryStats.lowStockCount + inventoryStats.outOfStockCount > 0
              ? `${inventoryStats.lowStockCount} low · ${inventoryStats.outOfStockCount} out of stock`
              : `Inventory worth ${formatCurrency(inventoryStats.totalInventoryValue)}`
          }
          icon={PackageIcon}
          iconClassName="from-amber-500/25 to-amber-600/10 text-amber-700 dark:text-amber-300"
          loading={inventoryLoading}
        />
      </section>

      {reportsError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-destructive">{reportsError}</p>
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Quick actions */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
            <p className="text-sm text-muted-foreground">Jump straight into your most-used workflows</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            const card = (
              <Link
                href={action.href}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
                  action.featured && "ring-2 ring-primary/20",
                )}
              >
                <div
                  className={cn(
                    "mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br",
                    action.accent,
                  )}
                >
                  <ActionIcon className="size-6" />
                </div>
                <h3 className="font-semibold">{action.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{action.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open
                  <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            );

            if (action.href === "/dashboard/admin") {
              return (
                <RoleGate key={action.href} allow={["ADMIN"]} fallback={null}>
                  {card}
                </RoleGate>
              );
            }

            return (
              <div key={action.href} className="contents">
                {card}
              </div>
            );
          })}
        </div>
      </section>

      {/* Charts + sidebar */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : analytics && analytics.salesTrend.length > 0 ? (
            <SalesChart data={analytics.salesTrend} title="Revenue trend (last 7 days)" />
          ) : (
            <Card className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <CardHeader>
                <CardTitle>No sales data yet</CardTitle>
                <CardDescription>
                  Complete your first sale to see trends and analytics here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button nativeButton={false} render={<Link href="/dashboard/billing" />}>
                  <ShoppingCartIcon className="size-4" />
                  Go to billing
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <StockAlertCard stats={inventoryStats} loading={inventoryLoading} />

          {analytics?.bestProduct ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Best seller</CardTitle>
                <CardDescription>Top product in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="truncate font-semibold">{analytics.bestProduct.productName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {analytics.bestProduct.quantitySold} units ·{" "}
                  {formatCurrency(analytics.bestProduct.revenue)}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <RoleGate allow={["ADMIN"]} fallback={null}>
            {analytics?.topEmployee ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top performer</CardTitle>
                  <CardDescription>Highest revenue this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="truncate font-semibold">{analytics.topEmployee.employeeName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {analytics.topEmployee.invoiceCount} invoices ·{" "}
                    {formatCurrency(analytics.topEmployee.revenue)}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </RoleGate>
        </div>
      </section>

      {/* Recent transactions */}
      <section>
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b">
            <div>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>Latest sales from the past 7 days</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/reports" />}
            >
              View all reports
              <ArrowRightIcon className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              <RecentTransactionsTable transactions={recentTransactions} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No transactions yet. Head to billing to record your first sale.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
