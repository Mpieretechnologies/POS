import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Smart POS</h1>
        <p className="mt-2 text-sm text-muted-foreground">Secure employee sign-in</p>
      </div>
      <Suspense
        fallback={
          <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border bg-card p-8 shadow-sm">
            <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
