"use client";

import { useState } from "react";
import { Download, Globe, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useQuotation } from "@/context/quotation-context";
import { formatDate } from "@/utils/formatters";
import { generateQuotationPDF } from "@/utils/pdf-generator";
import { saveQuotationToHistory } from "@/utils/history";
import { toast } from "sonner";

interface QuotationPreviewProps {
  onBack: () => void;
  /** Called after PDF is downloaded — parent can reset form / navigate */
  onDownloadComplete?: () => void;
}

export default function QuotationPreview({
  onBack,
  onDownloadComplete,
}: QuotationPreviewProps) {
  const { quotation } = useQuotation();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    const toastId = "quotation-pdf-download";
    setIsGenerating(true);
    toast.loading(
      `Generating PDF for Quotation #${quotation.quotationNumber}...`,
      { id: toastId }
    );

    try {
      await saveQuotationToHistory(quotation);
      await generateQuotationPDF(
        quotation,
        `quotation-${quotation.quotationNumber}`
      );
      toast.success(
        `Quotation #${quotation.quotationNumber} PDF downloaded successfully!`,
        { id: toastId }
      );
      onDownloadComplete?.();
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate and download quotation PDF.", {
        id: toastId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">

        {/* Page controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Quotation Preview</h1>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
              Back
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? "Generating…" : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* ─── A4-ratio paper card ─── */}
        <div
          id="invoice-document"
          className="relative bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          style={{ aspectRatio: "1 / 1.414" }}
        >
          {/* Watermark */}
          <img
            src="/ubuntu.webp"
            alt="watermark"
            className="absolute inset-0 w-full h-full object-contain opacity-5 pointer-events-none z-0"
          />

          {/* TOP ACCENT BAR */}
          <div className="h-2 bg-[#1a1a2e] flex-shrink-0" />

          {/* ════════════════════════════════════════
              HEADER ZONE  —  30% of card height
          ════════════════════════════════════════ */}
          <div
            className="relative z-10 flex flex-col justify-between px-6 sm:px-10"
            style={{ height: "28%" }}
          >
            {/* Logo + Title row */}
            <div className="flex flex-row justify-between items-start pt-4 gap-4">
              <img
                src="/ubuntu.webp"
                alt="logo"
                className="h-12 sm:h-16 lg:h-20 w-auto object-contain"
              />
              <div className="text-right">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] tracking-wide">
                  QUOTATION
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">
                  #{quotation.quotationNumber}
                </p>
                <p className="text-gray-400 text-xs">
                  {formatDate(quotation.date)}
                </p>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* FROM / PREPARED FOR */}
            <div className="flex flex-row justify-between gap-4 pb-2">
              <div>
                <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  From
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {quotation.fromName}
                </p>
                <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-500">
                  <Mail className="w-2.5 h-2.5" />
                  info@ubuntulogistics.co.ke
                </div>
                <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-500">
                  <Phone className="w-2.5 h-2.5" />
                  +254 728 798589
                </div>
                <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-500">
                  <Globe className="w-2.5 h-2.5" />
                  www.ubuntulogistics.co.ke
                </div>
              </div>

              <div className="text-right">
                <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  Prepared For
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {quotation.toName || "—"}
                </p>
                <p className="text-[9px] sm:text-xs text-gray-500">
                  {quotation.toEmail}
                </p>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              CONTENT ZONE  —  70% of card height
          ════════════════════════════════════════ */}
          <div
            className="relative z-10 flex flex-col px-6 sm:px-10 overflow-hidden"
            style={{ height: "72%" }}
          >
            {/* Items table */}
            <div className="rounded-lg border overflow-hidden mb-3 mt-1">
              <table className="w-full text-[10px] sm:text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-600">
                      No of Days
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-600">
                      Pickup Point
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-600">
                      Dropoff / Return
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-t ${idx % 2 === 1 ? "bg-gray-50/60" : ""}`}
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        {item.date ? formatDate(item.date) : ""}
                      </td>
                      <td className="py-2 px-3 text-center font-medium">
                        {item.numberOfDays === "" ? 1 : Number(item.numberOfDays) || 1}
                      </td>
                      <td className="py-2 px-3">{item.pickupPaid}</td>
                      <td className="py-2 px-3">{item.dropoffReturnTrip}</td>
                      <td className="py-2 px-3 text-right font-semibold">
                        KES {Number(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total box */}
            <div className="flex justify-end">
              <div className="w-full sm:w-60 bg-gray-50 border rounded-xl p-3">
                <div className="flex justify-between font-bold text-xs sm:text-sm">
                  <span>Total</span>
                  <span>KES {Number(quotation.total).toFixed(2)}</span>
                </div>

                  {/* Status badge */}
                {quotation.status && (
                  <div className="mt-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold ${
                        quotation.status === "DRAFT"
                          ? "bg-gray-200 text-gray-600"
                          : quotation.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700"
                          : quotation.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {quotation.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* ── FOOTER ── */}
            <div className="border-t border-gray-200 pt-2 pb-1">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                Terms &amp; Conditions
              </h3>
              <ul className="list-disc pl-3 space-y-0.5 text-[8px] sm:text-[9px] text-gray-500">
                <li>Accounts are due on demand.</li>
                <li>
                  A <strong>50% booking fee</strong> is required, with the
                  remaining balance payable before boarding.
                </li>
                <li>
                  Accepted payments: Cash, Cheque, Bank Transfer. KCB Bank:{" "}
                  <strong>1350132330</strong> (Tai Ubuntu Logistics Ltd) |
                  M-PESA Paybill: <strong>522533</strong>, Acc:{" "}
                  <strong>8077526</strong>.
                </li>
              </ul>

              <div className="flex justify-between items-center mt-2">
                <div className="relative w-16 sm:w-20">
                  <img
                    src="/stamp.webp"
                    alt="stamp"
                    className="w-full object-contain"
                  />
                  <p className="absolute inset-0 flex items-center justify-center text-[6px] sm:text-[8px] font-bold text-red-500 text-center leading-tight px-1">
                    {formatDate(quotation.date)}
                  </p>
                </div>
                <img
                  src="/ubuntu.webp"
                  alt="footer logo"
                  className="h-10 sm:h-14 object-contain"
                />
              </div>
            </div>
          </div>

          {/* BOTTOM ACCENT BAR */}
          <div className="h-1.5 bg-[#1a1a2e] flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}