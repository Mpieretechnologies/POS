
"use client";

import { useRef, type KeyboardEvent } from "react";
import { ScanBarcodeIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type BarcodeScannerInputProps = {
  onScan: (barcode: string) => void;
  disabled?: boolean;
  inputClassName?: string;
};

export const BarcodeScannerInput = ({
  onScan,
  disabled,
  inputClassName,
}: BarcodeScannerInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const value = inputRef.current?.value.trim() ?? "";
    if (!value) return;
    onScan(value);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="relative w-full">
      <ScanBarcodeIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Scan or enter barcode…"
        onKeyDown={handleKeyDown}
        onBlur={submit}
        disabled={disabled}
        className={cn("pl-9 font-mono", inputClassName)}
        aria-label="Barcode scanner input"
        autoComplete="off"
      />
    </div>
  );
};
