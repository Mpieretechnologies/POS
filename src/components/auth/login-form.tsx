"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextFormField } from "@/components/forms/text-form-field";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/schemas/login";
import { formatAuthError } from "@/utils/firebase-auth-error";

const getSafeReturnPath = (raw: string | null): string => {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
};

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmailPassword, authError, clearAuthError } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    clearAuthError();
    try {
      await signInWithEmailPassword(values.email, values.password);
      router.refresh();
      const next = getSafeReturnPath(searchParams.get("from"));
      router.replace(next);
    } catch (error) {
      setSubmitError(formatAuthError(error));
    }
  });

  const combinedError = submitError ?? authError;

  return (
    <Card className="w-full max-w-md border-border/80 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">Sign in</CardTitle>
        <CardDescription>Employee access for Smart POS</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          {combinedError ? (
            <Alert variant="destructive">
              <AlertDescription>{combinedError}</AlertDescription>
            </Alert>
          ) : null}

          <TextFormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            disabled={form.formState.isSubmitting}
            errorMessage={form.formState.errors.email?.message}
            registration={form.register("email")}
          />

          <TextFormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            disabled={form.formState.isSubmitting}
            errorMessage={form.formState.errors.password?.message}
            registration={form.register("password")}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              Back to home
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
