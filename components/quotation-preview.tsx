"use client";

import { Download, Globe, Mail, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useQuotation } from "@/context/quotation-context";
import { formatDate } from "@/utils/formatters";
import { generatePDF } from "@/utils/pdf-generator";
import { saveQuotationToHistory } from "@/utils/history";

interface QuotationPreviewProps {
  onBack: () => void;
}

export default function QuotationPreview({ onBack }: QuotationPreviewProps) {
  const { quotation } = useQuotation();

  const handleDownloadPDF = () => {
    generatePDF(`quotation-${quotation.quotationNumber}`);
    saveQuotationToHistory(quotation);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">
            Quotation Preview
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
                className="h-20 lg:h-32 w-auto object-contain"
              />

              <div className="text-left sm:text-right">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  QUOTATION
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  #{quotation.quotationNumber}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {formatDate(quotation.date)}
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
                  {quotation.fromName}
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
                  PREPARED FOR
                </h3>
                <p className="font-semibold text-lg sm:text-xl">
                  {quotation.toName}
                </p>
                <p className="text-gray-600 text-sm">
                  {quotation.toEmail}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm">Date</th>
                    <th className="text-center py-3 px-4 text-sm">Pickup Point</th>
                    <th className="text-center py-3 px-4 text-sm">Dropoff / Return</th>
                    <th className="text-right py-3 px-4 text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-3 px-4 text-sm">
                        {item.date ? formatDate(item.date) : ""}
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        {item.pickupPaid}
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        {item.dropoffReturnTrip}
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
                <div className="flex justify-between font-bold text-base sm:text-lg">
                  <span>Total</span>
                  <span>KES {Number(quotation.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

        
            {/* Footer */}
            <div className="space-y-2 text-sm text-gray-700">
  <h3 className="font-semibold underline">Terms and Conditions</h3>

  <ul className="list-disc space-y-1 pl-5">
    <li>This quotation is valid for 7 days from the date of issue.</li>

    <li>
      Payment terms: A 50% booking fee is required, with the remaining balance
      payable before boarding. Services will only be rendered upon full payment.
    </li>

    <li>
      Accepted payment methods include cash, cheque, and bank transfer payable
      to:
      <span className="font-medium">
        {' '}
       KCB Bank Account: 1350132330 (Tai Ubuntu Logistics Ltd)
      </span>
      {' '}or{' '}
      <span className="font-medium">
         PAY BY MPESA PAYBILL: 522533, ACCOUNT:  8077526
      </span>
      .
    </li>

    <li>
      Payment confirmation should be sent via SMS, WhatsApp, or email to{' '}
      <a
        href="mailto:info@ubuntulogistics.co.ke"
        className="text-blue-600 underline"
      >
        info@ubuntulogistics.co.ke
      </a>
      .
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
                  {formatDate(quotation.date)}
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