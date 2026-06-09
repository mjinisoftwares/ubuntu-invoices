"use client";

import { Download, Globe, Mail, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useInvoice } from "@/context/invoice-context";
import { formatDate } from "@/utils/formatters";
import { generatePDF } from "@/utils/pdf-generator";
import { saveInvoiceToHistory } from "@/utils/history";

interface InvoicePreviewProps {
  onBack: () => void;
}

export default function InvoicePreview({ onBack }: InvoicePreviewProps) {
  const { invoice } = useInvoice();

  const handleDownloadPDF = () => {
    generatePDF(`invoice-${invoice.invoiceNumber}`);
    saveInvoiceToHistory(invoice);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">
            Invoice Preview
          </h1>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
              Back
            </Button>
            <Button onClick={handleDownloadPDF} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card
          id="invoice-document"
          className="relative overflow-hidden shadow-xl rounded-2xl bg-white"
        >
          {/* Watermark */}
          <img
            src="/ubuntu.webp"
            alt="watermark"
            className="absolute inset-0 w-full h-full object-contain opacity-5 pointer-events-none"
          />

          <CardContent className="p-4 sm:p-6 lg:p-10 relative z-10">
            {/* Top Section */}
            <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <img
                src="/ubuntu.webp"
                alt="logo"
                className="h-16 sm:h-20 lg:h-32 w-auto object-contain"
              />

              <div className="text-left sm:text-right">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  INVOICE
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  #{invoice.invoiceNumber}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {formatDate(invoice.date)}
                </p>
              </div>
            </div>

            <hr className="border-gray-300 mb-6" />

            {/* From / To */}
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                  FROM
                </h3>
                <p className="font-semibold text-lg sm:text-xl mb-2">
                  {invoice.fromName}
                </p>

                <div className="flex items-center gap-2 mb-1 text-sm">
                  <Mail className="w-4 h-4" />
                  info@ubuntulogistics.co.ke
                </div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <Phone className="w-4 h-4" />
                 +254 728 798589
                </div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <Globe className="w-4 h-4" />
                  www.ubuntulogistics.co.ke
                </div>
              </div>

              <div className="md:text-right">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                  BILL TO
                </h3>
                <p className="font-semibold text-lg sm:text-xl">
                  {invoice.toName}
                </p>
                <p className="text-gray-600 text-sm">
                  {invoice.toEmail}
                </p>
              </div>
            </div>

            {/* Table (Scrollable on Mobile) */}
            <div className="rounded-xl border overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm">Description</th>
                    <th className="text-center py-3 px-4 text-sm">Qty</th>
                    <th className="text-right py-3 px-4 text-sm">Rate</th>
                    <th className="text-right py-3 px-4 text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-3 px-4 text-sm">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        KES {Number(item.rate).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-sm">
                        KES {Number(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-start sm:justify-end mt-8">
              <div className="w-full sm:w-80 bg-gray-50 p-4 rounded-xl border">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Subtotal</span>
                  <span>KES {Number(invoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Tax ({invoice.taxRate || 0}%)</span>
                  <span>KES {Number(invoice.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                  <span>Total</span>
                  <span>KES {Number(invoice.total).toFixed(2)}</span>
                </div>
              </div>
            </div>


     {/* Footer - Terms & Conditions */}
<div className="space-y-3 text-sm text-gray-700 mt-8">
  <h3 className="font-semibold underline">Terms and Conditions</h3>

  <ul className="list-disc space-y-2 pl-5">
    <li>
      This invoice is valid for <span className="font-medium">30 days</span> from the date of issue unless otherwise stated.
    </li>

    <li>
      A <span className="font-medium">50% deposit (booking fee)</span> is required to confirm and secure the service booking.
      The remaining balance must be settled <span className="font-medium">before commencement or boarding</span>.
    </li>

    <li>
      Services will only be rendered upon receipt of full payment unless a prior written agreement has been made.
    </li>

    <li>
      Accepted payment methods include:
      <span className="font-medium">
        {" "}Cash, Bank Transfer, and Mobile Money (M-PESA)
      </span>.
      Payments should be made to:
      <br />
      <span className="font-medium">
        KCB Bank Account: 1350132330 (Tai Ubuntu Logistics Ltd)
      </span>
      <br />
      <span className="font-medium">
         M-PESA PAYBILL: 522533, ACCOUNT:  8077526
      </span>
    </li>

    <li>
      Payment confirmation must be sent immediately via SMS, WhatsApp, or email to{" "}
      <a
        href="mailto:info@ubuntulogistics.co.ke"
        className="text-blue-600 underline"
      >
        info@ubuntulogistics.co.ke
      </a>
      .
    </li>

    <li>
      Cancellation policy: Cancellations made less than 24 hours before the service may attract a cancellation fee.
    </li>

    <li>
      The company is not liable for delays caused by unforeseen circumstances such as traffic, weather conditions, or government restrictions.
    </li>
  </ul>
</div>
            <div className="mt-10 flex flex-row justify-between items-center gap-6">
              <div className="relative">
                <img
                  src="/stamp.webp"
                  alt="stamp"
                  className="h-20 sm:h-24 lg:h-28 object-contain"
                />
                <p className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-red-500">
                  {formatDate(invoice.date)}
                </p>
              </div>

              <img
                src="/ubuntu.webp"
                alt="footer logo"
                className="h-16 sm:h-20 lg:h-24 object-contain"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}