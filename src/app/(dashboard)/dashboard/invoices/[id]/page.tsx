"use client";

import Link from "next/link";
import { ArrowLeftIcon, PrinterIcon } from "lucide-react";
import { use } from "react";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSale } from "@/hooks/use-sale";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default function InvoicePage({ params }: InvoicePageProps) {
  const { id } = use(params);
  const { data, loading, error } = useSale(id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/billing" />}>
          <ArrowLeftIcon />
          Back to billing
        </Button>
        {data ? (
          <Button type="button" onClick={handlePrint}>
            <PrinterIcon />
            Print / Save PDF
          </Button>
        ) : null}
      </div>

      {loading ? <Skeleton className="h-[480px] w-full" /> : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {data ? <InvoicePreview sale={data.sale} items={data.items} /> : null}
    </div>
  );
}
