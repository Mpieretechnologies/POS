export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const random = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, "0");
  return `INV-${date}-${time}-${random}`;
};
