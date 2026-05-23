"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailySalesPoint, MonthlySalesPoint } from "@/types/reports";
import { formatCurrency } from "@/utils/currency";

type TrendPoint = Pick<DailySalesPoint | MonthlySalesPoint, "label" | "revenue" | "orders">;

type RevenueTrendChartProps = {
  data: TrendPoint[];
  title?: string;
  dataKey?: "date" | "month";
};

export const RevenueTrendChart = ({
  data,
  title = "Revenue trend",
  dataKey = "date",
}: RevenueTrendChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
          <Tooltip
            formatter={(value, name) => [
              name === "revenue"
                ? formatCurrency(Number(value ?? 0))
                : Number(value ?? 0),
              name === "revenue" ? "Revenue" : "Orders",
            ]}
            labelFormatter={(label) => `${dataKey === "month" ? "Month" : "Date"}: ${label}`}
          />
          <Bar
            dataKey="revenue"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
