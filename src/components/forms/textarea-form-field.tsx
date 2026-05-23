"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type TextareaFormFieldProps = {
  id: string;
  label: string;
  disabled?: boolean;
  errorMessage?: string;
  registration: UseFormRegisterReturn;
  rows?: number;
};

export const TextareaFormField = ({
  id,
  label,
  disabled,
  errorMessage,
  registration,
  rows = 4,
}: TextareaFormFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        rows={rows}
        disabled={disabled}
        aria-invalid={Boolean(errorMessage)}
        {...registration}
      />
      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};
