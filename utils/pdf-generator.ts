import { jsPDF } from "jspdf";
import { InvoiceData } from "@/types/invoice";
import { QuotationData } from "@/types/quotation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "";
  const date =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Load an image from a public URL and return it as a transparent-aware PNG data-URL.
 *  Uses PNG (not JPEG) so that transparent logos/stamps keep their alpha channel
 *  instead of rendering with a black background.
 */
async function loadImageAsBase64(src: string, opacity: number = 1): Promise<{ data: string; width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        // Downsample to keep file size small
        const MAX = 400; // Increased slightly to keep watermark sharp
        const scale = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1);
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        if (opacity < 1) {
          ctx.globalAlpha = opacity;
        }
        // ✅ Do NOT fill with any background — canvas is transparent by default
        // This preserves the alpha channel of logos/stamps with transparent backgrounds
        ctx.drawImage(img, 0, 0, w, h);
        // PNG supports transparency (JPEG does not — JPEG turns alpha to black)
        resolve({ data: canvas.toDataURL("image/png"), width: img.naturalWidth, height: img.naturalHeight });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawImageProportional(
  pdf: jsPDF,
  imgData: { data: string; width: number; height: number },
  x: number,
  y: number,
  maxW: number,
  maxH: number,
  align: "left" | "right" | "center" = "left"
) {
  const ratio = imgData.width / imgData.height;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  
  let drawX = x;
  if (align === "right") {
    drawX = x + maxW - w;
  } else if (align === "center") {
    drawX = x + (maxW - w) / 2;
  }
  
  pdf.addImage(imgData.data, "PNG", drawX, y, w, h, undefined, "FAST");
}

// ─── Layout constants (all in mm, A4 = 210 × 297) ────────────────────────────

const PW = 210;         // page width
const PH = 297;         // page height
const ML = 14;          // margin left
const MR = 14;          // margin right
const CW = PW - ML - MR; // content width

// Zone boundaries  (30% header/footer, 70% content)
const HEADER_END  = PH * 0.30; // 89.1 mm
const FOOTER_START = PH * 0.75; // 222.75 mm  (leaves ~74mm for footer)
const CONTENT_Y_START = HEADER_END;

// ─── Shared drawing helpers ───────────────────────────────────────────────────

function setFont(
  pdf: jsPDF,
  size: number,
  style: "normal" | "bold" | "italic" = "normal",
  color = "#111111"
) {
  pdf.setFontSize(size);
  pdf.setFont("helvetica", style);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  pdf.setTextColor(r, g, b);
}

function drawHRule(pdf: jsPDF, y: number, color = "#d1d5db") {
  const [r, g, b] = [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16),
  ];
  pdf.setDrawColor(r, g, b);
  pdf.setLineWidth(0.3);
  pdf.line(ML, y, ML + CW, y);
}

function drawFilledRect(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string
) {
  const r = parseInt(fill.slice(1, 3), 16);
  const g = parseInt(fill.slice(3, 5), 16);
  const b = parseInt(fill.slice(5, 7), 16);
  pdf.setFillColor(r, g, b);
  pdf.setDrawColor(r, g, b);
  pdf.rect(x, y, w, h, "F");
}

function drawRoundedBox(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string
) {
  pdf.setFillColor(
    parseInt(fill.slice(1, 3), 16),
    parseInt(fill.slice(3, 5), 16),
    parseInt(fill.slice(5, 7), 16)
  );
  pdf.setDrawColor(
    parseInt(stroke.slice(1, 3), 16),
    parseInt(stroke.slice(3, 5), 16),
    parseInt(stroke.slice(5, 7), 16)
  );
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, w, h, 2, 2, "FD");
}

// ─── Invoice PDF ──────────────────────────────────────────────────────────────

export async function generateInvoicePDF(
  invoice: InvoiceData,
  filename: string
) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Pre-load images (fire in parallel)
  const [logoData, stampData, watermarkData] = await Promise.all([
    loadImageAsBase64("/ubuntu.webp"),
    loadImageAsBase64("/stamp.webp"),
    loadImageAsBase64("/ubuntu.webp", 0.05),
  ]);

  // Watermark (Center of page)
  if (watermarkData) {
    const wmSize = 160;
    const wmY = (PH - wmSize) / 2;
    drawImageProportional(pdf, watermarkData, (PW - wmSize) / 2, wmY, wmSize, wmSize, "center");
  }

  // ── HEADER ZONE (0 → 89 mm) ─────────────────────────────────────────────

  // Top accent bar
  drawFilledRect(pdf, 0, 0, PW, 6, "#1a1a2e");

  let y = 24; // Increased top padding (pt-12)

  // Logo (left)
  if (logoData) {
    drawImageProportional(pdf, logoData, ML, y, 36, 22, "left");
  }

  // INVOICE title + number + date (right)
  setFont(pdf, 22, "bold", "#1a1a2e");
  pdf.text("INVOICE", ML + CW, y + 6, { align: "right" });

  setFont(pdf, 9, "normal", "#6b7280");
  pdf.text(`#${invoice.invoiceNumber}`, ML + CW, y + 12, { align: "right" });
  pdf.text(formatDate(invoice.date), ML + CW, y + 17, { align: "right" });

  y += 30;
  drawHRule(pdf, y);
  y += 6;

  // FROM / BILL TO columns
  const colMid = ML + CW / 2;

  setFont(pdf, 7, "bold", "#6b7280");
  pdf.text("FROM", ML, y);
  pdf.text("BILL TO", colMid, y);

  y += 4;
  setFont(pdf, 10, "bold", "#111111");
  pdf.text(invoice.fromName || "Ubuntu Logistics", ML, y);
  pdf.text(invoice.toName || "—", colMid, y);

  y += 5;
  setFont(pdf, 8, "normal", "#4b5563");
  pdf.text("info@ubuntulogistics.co.ke", ML, y);
  pdf.text(invoice.toEmail || "", colMid, y);

  y += 4;
  pdf.text("+254 728 798589", ML, y);

  y += 4;
  pdf.text("www.ubuntulogistics.co.ke", ML, y);

  // ── CONTENT ZONE (89 → 222 mm) ──────────────────────────────────────────

  y = CONTENT_Y_START + 4;

  // Table header row
  const colDesc = ML;
  const colQty  = ML + CW * 0.44;
  const colRate = ML + CW * 0.64;
  const colDays = ML + CW * 0.78;
  const colAmt  = ML + CW;

  drawFilledRect(pdf, ML, y, CW, 7, "#f3f4f6");
  setFont(pdf, 8, "bold", "#374151");
  pdf.text("Description",  colDesc + 2, y + 4.8);
  pdf.text("Qty",          colQty,      y + 4.8, { align: "center" });
  pdf.text("Rate",         colRate,     y + 4.8, { align: "right" });
  pdf.text("Days",         colDays,     y + 4.8, { align: "center" });
  pdf.text("Amount",       colAmt,      y + 4.8, { align: "right" });

  y += 7;

  // Table rows
  invoice.items.forEach((item, i) => {
    const rowH = 7;
    if (i % 2 === 1) drawFilledRect(pdf, ML, y, CW, rowH, "#f9fafb");
    setFont(pdf, 8, "normal", "#111111");
    pdf.text(item.description || "", colDesc + 2, y + 4.8, {
      maxWidth: CW * 0.38,
    });
    pdf.text(String(item.quantity ?? ""), colQty, y + 4.8, { align: "center" });
    setFont(pdf, 8, "normal", "#374151");
    pdf.text(
      `KES ${Number(item.rate).toFixed(2)}`,
      colRate,
      y + 4.8,
      { align: "right" }
    );
    const itemDays = item.numberOfDays === "" ? 1 : Number(item.numberOfDays) || 1;
    pdf.text(String(itemDays), colDays, y + 4.8, { align: "center" });
    setFont(pdf, 8, "bold", "#111111");
    pdf.text(
      `KES ${Number(item.amount).toFixed(2)}`,
      colAmt,
      y + 4.8,
      { align: "right" }
    );
    y += rowH;
  });

  // Bottom border of table
  drawHRule(pdf, y);
  y += 6;

  // Totals box (right-aligned, ~75mm wide)
  const boxW = 78;
  const boxX = ML + CW - boxW;
  const lineH = 6;

  drawRoundedBox(pdf, boxX, y, boxW, lineH * 3 + 2, "#f9fafb", "#e5e7eb");

  setFont(pdf, 8, "normal", "#374151");
  pdf.text("Subtotal", boxX + 3, y + lineH * 0.8);
  pdf.text(
    `KES ${Number(invoice.subtotal).toFixed(2)}`,
    boxX + boxW - 3,
    y + lineH * 0.8,
    { align: "right" }
  );

  y += lineH;
  pdf.text(`Tax (${invoice.taxRate || 0}%)`, boxX + 3, y + lineH * 0.8);
  pdf.text(
    `KES ${Number(invoice.taxAmount).toFixed(2)}`,
    boxX + boxW - 3,
    y + lineH * 0.8,
    { align: "right" }
  );

  y += lineH;
  drawHRule(pdf, y, "#e5e7eb");
  y += 1;
  setFont(pdf, 9, "bold", "#111111");
  pdf.text("TOTAL", boxX + 3, y + lineH * 0.85);
  pdf.text(
    `KES ${Number(invoice.total).toFixed(2)}`,
    boxX + boxW - 3,
    y + lineH * 0.85,
    { align: "right" }
  );

  // ── FOOTER ZONE (222 → 297 mm) ──────────────────────────────────────────

  y = FOOTER_START + 2;
  drawHRule(pdf, y, "#e5e7eb");
  y += 5;

  // Terms & Conditions
  setFont(pdf, 8, "bold", "#374151");
  pdf.text("Terms and Conditions", ML, y);
  y += 5;

  const terms = [
    "Accounts are due on demand.",
    "A 50% deposit (booking fee) is required to confirm and secure the service booking. The remaining balance must be settled before commencement or boarding.",
    "Services will only be rendered upon receipt of full payment unless a prior written agreement has been made.",
    "Accepted payments: Cash, Bank Transfer, Mobile Money (M-PESA). KCB Bank Account: 1350132330 (Tai Ubuntu Logistics Ltd) | M-PESA PAYBILL: 522533, ACCOUNT: 8077526",
  ];

  setFont(pdf, 7.5, "normal", "#4b5563");
  terms.forEach((term) => {
    const lines = pdf.splitTextToSize(`• ${term}`, CW - 4);
    pdf.text(lines, ML + 2, y);
    y += lines.length * 4 + 1.5;
  });

  // Stamp + footer logo row
  const stampY = PH - 36;

  if (stampData) {
    drawImageProportional(pdf, stampData, ML, stampY, 22, 22, "left");
  }
  setFont(pdf, 6.5, "bold", "#ef4444");
  pdf.text(formatDate(invoice.date), ML + 11, stampY + 12, { align: "center" });

  if (logoData) {
    drawImageProportional(pdf, logoData, ML + CW - 28, stampY, 28, 17, "right");
  }

  // Bottom bar
  drawFilledRect(pdf, 0, PH - 4, PW, 4, "#1a1a2e");

  pdf.save(`${filename}.pdf`);
}

// ─── Quotation PDF ────────────────────────────────────────────────────────────

export async function generateQuotationPDF(
  quotation: QuotationData,
  filename: string
) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const [logoData, stampData, watermarkData] = await Promise.all([
    loadImageAsBase64("/ubuntu.webp"),
    loadImageAsBase64("/stamp.webp"),
    loadImageAsBase64("/ubuntu.webp", 0.05),
  ]);

  // Watermark (Center of page)
  if (watermarkData) {
    const wmSize = 160;
    const wmY = (PH - wmSize) / 2;
    drawImageProportional(pdf, watermarkData, (PW - wmSize) / 2, wmY, wmSize, wmSize, "center");
  }

  // ── HEADER ZONE ─────────────────────────────────────────────────────────

  drawFilledRect(pdf, 0, 0, PW, 6, "#1a1a2e");

  let y = 24; // Increased top padding (pt-12)

  if (logoData) {
    drawImageProportional(pdf, logoData, ML, y, 36, 22, "left");
  }

  setFont(pdf, 22, "bold", "#1a1a2e");
  pdf.text("QUOTATION", ML + CW, y + 6, { align: "right" });

  setFont(pdf, 9, "normal", "#6b7280");
  pdf.text(`#${quotation.quotationNumber}`, ML + CW, y + 12, { align: "right" });
  pdf.text(formatDate(quotation.date), ML + CW, y + 17, { align: "right" });

  y += 30;
  drawHRule(pdf, y);
  y += 6;

  const colMid = ML + CW / 2;

  setFont(pdf, 7, "bold", "#6b7280");
  pdf.text("FROM", ML, y);
  pdf.text("PREPARED FOR", colMid, y);

  y += 4;
  setFont(pdf, 10, "bold", "#111111");
  pdf.text(quotation.fromName || "Ubuntu Logistics", ML, y);
  pdf.text(quotation.toName || "—", colMid, y);

  y += 5;
  setFont(pdf, 8, "normal", "#4b5563");
  pdf.text("info@ubuntulogistics.co.ke", ML, y);
  pdf.text(quotation.toEmail || "", colMid, y);

  y += 4;
  pdf.text("+254 728 798589", ML, y);

  y += 4;
  pdf.text("www.ubuntulogistics.co.ke", ML, y);

  // ── CONTENT ZONE ────────────────────────────────────────────────────────

  y = CONTENT_Y_START + 4;

  // Column positions for quotation table
  const qColDate    = ML;
  const qColDays    = ML + CW * 0.20;
  const qColPickup  = ML + CW * 0.32;
  const qColDrop    = ML + CW * 0.64;
  const qColAmt     = ML + CW;

  drawFilledRect(pdf, ML, y, CW, 7, "#f3f4f6");
  setFont(pdf, 8, "bold", "#374151");
  pdf.text("Date",             qColDate + 2,   y + 4.8);
  pdf.text("Days",             qColDays,       y + 4.8, { align: "center" });
  pdf.text("Pickup Point",     qColPickup + 2,  y + 4.8);
  pdf.text("Dropoff / Return", qColDrop + 2,    y + 4.8);
  pdf.text("Amount",           qColAmt,         y + 4.8, { align: "right" });

  y += 7;

  quotation.items.forEach((item, i) => {
    const rowH = 7;
    if (i % 2 === 1) drawFilledRect(pdf, ML, y, CW, rowH, "#f9fafb");
    setFont(pdf, 8, "normal", "#111111");
    pdf.text(item.date ? formatDate(item.date) : "", qColDate + 2, y + 4.8);
    const itemDays = item.numberOfDays === "" ? 1 : Number(item.numberOfDays) || 1;
    pdf.text(String(itemDays), qColDays, y + 4.8, { align: "center" });
    pdf.text(item.pickupPaid || "", qColPickup + 2, y + 4.8, {
      maxWidth: CW * 0.30,
    });
    pdf.text(item.dropoffReturnTrip || "", qColDrop + 2, y + 4.8, {
      maxWidth: CW * 0.28,
    });
    setFont(pdf, 8, "bold", "#111111");
    pdf.text(
      `KES ${Number(item.amount).toFixed(2)}`,
      qColAmt,
      y + 4.8,
      { align: "right" }
    );
    y += rowH;
  });

  drawHRule(pdf, y);
  y += 6;

  // Total box
  const boxW = 68;
  const boxX = ML + CW - boxW;
  const lineH = 7;

  drawRoundedBox(pdf, boxX, y, boxW, lineH + 2, "#f9fafb", "#e5e7eb");
  setFont(pdf, 9, "bold", "#111111");
  pdf.text("TOTAL", boxX + 3, y + lineH * 0.9);
  pdf.text(
    `KES ${Number(quotation.total).toFixed(2)}`,
    boxX + boxW - 3,
    y + lineH * 0.9,
    { align: "right" }
  );

  // ── FOOTER ZONE ─────────────────────────────────────────────────────────

  y = FOOTER_START + 2;
  drawHRule(pdf, y, "#e5e7eb");
  y += 5;

  setFont(pdf, 8, "bold", "#374151");
  pdf.text("Terms and Conditions", ML, y);
  y += 5;

  const terms = [
    "Accounts are due on demand.",
    "Payment terms: A 50% booking fee is required, with the remaining balance payable before boarding. Services will only be rendered upon full payment.",
    "Accepted payment methods include cash, cheque, and bank transfer payable to: KCB Bank Account: 1350132330 (Tai Ubuntu Logistics Ltd) | PAY BY MPESA PAYBILL: 522533, ACCOUNT: 8077526",
  ];

  setFont(pdf, 7.5, "normal", "#4b5563");
  terms.forEach((term) => {
    const lines = pdf.splitTextToSize(`• ${term}`, CW - 4);
    pdf.text(lines, ML + 2, y);
    y += lines.length * 4 + 1.5;
  });

  const stampY = PH - 36;

  if (stampData) {
    drawImageProportional(pdf, stampData, ML, stampY, 22, 22, "left");
  }
  setFont(pdf, 6.5, "bold", "#ef4444");
  pdf.text(formatDate(quotation.date), ML + 11, stampY + 12, { align: "center" });

  if (logoData) {
    drawImageProportional(pdf, logoData, ML + CW - 28, stampY, 28, 17, "right");
  }

  drawFilledRect(pdf, 0, PH - 4, PW, 4, "#1a1a2e");

  pdf.save(`${filename}.pdf`);
}

// ─── Legacy shim (keeps any old callers working) ──────────────────────────────

export async function generatePDF(filename: string) {
  console.warn(
    "generatePDF() is deprecated — use generateInvoicePDF() or generateQuotationPDF() instead."
  );
}