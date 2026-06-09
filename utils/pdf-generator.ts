import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

export const generatePDF = async (filename: string) => {
  const element = document.getElementById("invoice-document");

  if (!element) {
    console.error("Invoice document element not found for PDF generation.");
    return;
  }

  // Create off-screen container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";

  // Clone invoice
  const clone = element.cloneNode(true) as HTMLElement;

  const targetWidth = 794; // A4 width in px

  // ===== PDF STYLING FIXES (YOUR REQUEST) =====
  clone.style.width = `${targetWidth}px`;
  clone.style.maxWidth = "none";
  clone.style.height = "auto";
  clone.style.margin = "0";

  // 🔥 INCREASED PADDING (change 24px → 12px if you want px-3 feel)
  clone.style.padding = "24px";
  clone.style.boxSizing = "border-box";

  // Better readability in PDF
  clone.style.lineHeight = "1.4";
  clone.style.fontSize = "14px";

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const targetHeight = clone.offsetHeight;

    // Convert to image
    const imgData = await toPng(clone, {
      pixelRatio: 3, // 🔥 sharper PDF
      backgroundColor: "#ffffff",
      width: targetWidth,
      height: targetHeight,
      style: {
        width: `${targetWidth}px`,
        maxWidth: "none",
        margin: "0",
      },
    });

    // Load image
    const img = new Image();
    img.src = imgData;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (img.height * pdfWidth) / img.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};