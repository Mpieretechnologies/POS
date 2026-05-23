const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (amount: number): string => formatter.format(amount);

export const roundMoney = (amount: number): number =>
  Math.round((amount + Number.EPSILON) * 100) / 100;
