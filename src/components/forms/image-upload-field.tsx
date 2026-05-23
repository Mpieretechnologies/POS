"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { validateProductImage } from "@/services/storage/product-image-service";
import { ImageIcon, UploadIcon, XIcon } from "lucide-react";

export type ImageUploadFieldProps = {
  id: string;
  label: string;
  value?: string;
  onChange: (file: File | null) => void;
  onClearRemote?: () => void;
  disabled?: boolean;
  errorMessage?: string;
};

export const ImageUploadField = ({
  id,
  label,
  value,
  onChange,
  onClearRemote,
  disabled,
  errorMessage,
}: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayUrl = previewUrl ?? value ?? null;

  const handleFileChange = (file: File | null) => {
    setLocalError(null);
    if (!file) {
      setPreviewUrl(null);
      onChange(null);
      return;
    }

    const validationError = validateProductImage(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onChange(file);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setLocalError(null);
    onChange(null);
    onClearRemote?.();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const combinedError = errorMessage ?? localError;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
        {displayUrl ? (
          <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-lg bg-muted">
            <Image
              src={displayUrl}
              alt="Product preview"
              fill
              className="object-cover"
              sizes="200px"
              unoptimized={displayUrl.startsWith("blob:")}
            />
          </div>
        ) : (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-8 opacity-60" />
            <p className="text-sm">Upload a product image (optional)</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon data-icon="inline-start" />
            Choose image
          </Button>
          {displayUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={handleClear}
            >
              <XIcon data-icon="inline-start" />
              Remove
            </Button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={disabled}
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
        />
      </div>
      {combinedError ? (
        <p className="text-sm text-destructive" role="alert">
          {combinedError}
        </p>
      ) : null}
    </div>
  );
};
