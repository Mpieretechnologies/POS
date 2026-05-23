"use client";

import Link from "next/link";
import { DownloadIcon, PrinterIcon } from "lucide-react";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Sale, SaleItem } from "@/types/sale";

type ReceiptModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale;
  items: SaleItem[];
};

export const ReceiptModal = ({ open, onOpenChange, sale, items }: ReceiptModalProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg print:max-w-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>Invoice generated</DialogTitle>
          <DialogDescription>Invoice {sale.invoiceNumber}</DialogDescription>
        </DialogHeader>
        <InvoicePreview sale={sale} items={items} />
        <DialogFooter className="print:hidden">
          <Button type="button" variant="outline" onClick={handlePrint}>
            <PrinterIcon />
            Print receipt
          </Button>
          <Button type="button" variant="outline" onClick={handlePrint}>
            <DownloadIcon />
            Save as PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            nativeButton={false}
            render={<Link href={`/dashboard/invoices/${sale.id}`} />}
          >
            View invoice
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
