"use client";

import { RefreshCwIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ReportErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export const ReportErrorState = ({ message, onRetry }: ReportErrorStateProps) => (
  <Alert variant="destructive">
    <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span>{message}</span>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCwIcon data-icon="inline-start" />
          Retry
        </Button>
      ) : null}
    </AlertDescription>
  </Alert>
);
