export const getStoreName = (): string =>
  (process.env.NEXT_PUBLIC_STORE_NAME ?? "Smart POS Store").trim();
