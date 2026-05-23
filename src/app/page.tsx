import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Smart POS System</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Run checkout, stock, and reporting in one place
        </h1>
        <p className="text-lg text-muted-foreground">
          Phase 1 covers secure employee login, roles, and your team dashboard. Sign in to
          continue.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
          Employee login
        </Link>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
