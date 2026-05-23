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
import type { EmployeeSalesRow } from "@/types/reports";
import { formatCurrency } from "@/utils/currency";

type EmployeePerformanceChartProps = {
  employees: EmployeeSalesRow[];
  title?: string;
};

export const EmployeePerformanceChart = ({
  employees,
  title = "Employee performance",
}: EmployeePerformanceChartProps) => {
  const chartData = employees.slice(0, 8).map((employee) => ({
    name: employee.employeeName.split(" ")[0] ?? employee.employeeName,
    revenue: employee.revenue,
    invoices: employee.invoiceCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 8, left: 24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => [
                name === "revenue"
                  ? formatCurrency(Number(value ?? 0))
                  : Number(value ?? 0),
                name === "revenue" ? "Revenue" : "Invoices",
              ]}
            />
            <Bar
              dataKey="revenue"
              fill="hsl(var(--chart-2, var(--primary)))"
              radius={[0, 4, 4, 0]}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
