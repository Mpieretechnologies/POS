import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type TextFormFieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
  errorMessage?: string;
  registration: UseFormRegisterReturn;
};

export const TextFormField = ({
  id,
  label,
  type = "text",
  autoComplete,
  disabled,
  errorMessage,
  registration,
}: TextFormFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
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
