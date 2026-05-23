"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductSalesRow } from "@/types/reports";
import { formatCurrency } from "@/utils/currency";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142 76% 36%)",
  "hsl(221 83% 53%)",
  "hsl(24 95% 53%)",
  "hsl(262 83% 58%)",
  "hsl(346 77% 50%)",
];

type ProductPieChartProps = {
  products: ProductSalesRow[];
  title?: string;
};

export const ProductPieChart = ({
  products,
  title = "Product revenue share",
}: ProductPieChartProps) => {
  const chartData = products.slice(0, 6).map((product) => ({
    name: product.productName,
    value: product.revenue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              animationDuration={500}
              label={({ name, percent }) =>
                `${String(name).slice(0, 12)} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export { ProductPieChart as ProductSalesPieChart };
