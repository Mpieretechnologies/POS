const BARCODE_PREFIX = "POS";

export const generateBarcode = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, "0");
  return `${BARCODE_PREFIX}${timestamp}${random}`;
};

export const normalizeBarcode = (value: string): string => value.trim().toUpperCase();

export const isValidBarcodeFormat = (value: string): boolean => {
  const normalized = normalizeBarcode(value);
  return normalized.length >= 4 && /^[A-Z0-9-]+$/.test(normalized);
};
