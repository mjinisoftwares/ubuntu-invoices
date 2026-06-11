import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

const getBase64Image = (img: HTMLImageElement): string => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width || 300;
    canvas.height = img.naturalHeight || img.height || 300;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    }
  } catch (e) {
    console.error("Failed to convert image to base64", e);
  }
  return img.src;
};

const getUtilityCategory = (cls: string): string => {
  const displayClasses = [
    "hidden", "block", "inline-block", "inline", "flex", "grid",
    "inline-flex", "inline-grid", "table", "table-row", "table-cell"
  ];
  if (displayClasses.includes(cls)) {
    return "display";
  }

  const positionClasses = ["static", "relative", "absolute", "fixed", "sticky"];
  if (positionClasses.includes(cls)) {
    return "position";
  }

  const visibilityClasses = ["visible", "invisible"];
  if (visibilityClasses.includes(cls)) {
    return "visibility";
  }

  const prefixes = [
    "p-", "px-", "py-", "pt-", "pb-", "pl-", "pr-",
    "m-", "mx-", "my-", "mt-", "mb-", "ml-", "mr-",
    "w-", "h-", "max-w-", "max-h-", "min-w-", "min-h-",
    "flex-", "items-", "justify-", "gap-",
    "grid-", "col-", "row-",
    "border-", "rounded-", "opacity-", "shadow-",
    "bg-", "font-", "leading-", "tracking-"
  ];
  for (const prefix of prefixes) {
    if (cls.startsWith(prefix)) {
      if (prefix === "text-") {
        if (cls === "text-left" || cls === "text-center" || cls === "text-right" || cls === "text-justify") {
          return "text-align";
        }
        if (cls.startsWith("text-gray-") || cls.startsWith("text-white") || cls.startsWith("text-red-") || cls.startsWith("text-blue-")) {
          return "text-color";
        }
        return "text-size";
      }
      return prefix;
    }
  }
  return cls;
};

const resolveTailwindResponsiveClasses = (element: HTMLElement) => {
  const elements = [element, ...Array.from(element.querySelectorAll("*"))];
  const breakpoints = ["sm", "md", "lg", "xl"];

  elements.forEach((el) => {
    if (!(el instanceof HTMLElement) || !el.className) return;

    const classes = el.className.split(/\s+/).filter(Boolean);
    const baseClassesMap = new Map<string, string>();
    const responsiveClassesMap = new Map<string, { breakpoint: string; value: string }>();

    classes.forEach((cls) => {
      const parts = cls.split(":");
      if (parts.length === 2 && breakpoints.includes(parts[0])) {
        const breakpoint = parts[0];
        const actualClass = parts[1];
        const category = getUtilityCategory(actualClass);

        const existing = responsiveClassesMap.get(category);
        if (!existing || breakpoints.indexOf(breakpoint) > breakpoints.indexOf(existing.breakpoint)) {
          responsiveClassesMap.set(category, { breakpoint, value: actualClass });
        }
      } else if (parts.length === 1) {
        const category = getUtilityCategory(cls);
        baseClassesMap.set(category, cls);
      }
    });

    responsiveClassesMap.forEach((res, category) => {
      baseClassesMap.set(category, res.value);
    });

    el.className = Array.from(baseClassesMap.values()).join(" ");
  });
};

export const generatePDF = async (filename: string) => {
  const element = document.getElementById("invoice-document");

  if (!element) {
    console.error("Invoice document element not found for PDF generation.");
    return;
  }

  const targetWidth = 794; // A4 width in px

  // Create off-screen container with fixed width to ensure correct desktop layout dimensions
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = `${targetWidth}px`;
  container.style.height = "auto";

  // Clone invoice
  const clone = element.cloneNode(true) as HTMLElement;

  // Inline images to avoid relative paths & loading issues on mobile SVG rendering
  const originalImages = Array.from(element.querySelectorAll("img"));
  const clonedImages = Array.from(clone.querySelectorAll("img"));

  originalImages.forEach((origImg, index) => {
    const clonedImg = clonedImages[index];
    if (clonedImg) {
      if (origImg.complete && origImg.naturalWidth > 0) {
        clonedImg.src = getBase64Image(origImg);
      }
    }
  });

  // Force specific dimensions for PDF elements as requested
  const headerLogo = clone.querySelector('img[alt="logo"]') as HTMLElement | null;
  const footerLogo = clone.querySelector('img[alt="footer logo"]') as HTMLElement | null;
  const footerStamp = clone.querySelector('img[alt="stamp"]') as HTMLElement | null;

  if (headerLogo) {
    headerLogo.className = "h-20 object-contain";
  }
  if (footerLogo) {
    footerLogo.className = "h-20 object-contain";
  }
  if (footerStamp) {
    footerStamp.className = "h-20 lg:h-24 object-contain";
  }

  // Resolve Tailwind responsive classes to force desktop layout inside clone
  resolveTailwindResponsiveClasses(clone);

  // ===== PDF STYLING FIXES (YOUR REQUEST) =====
  clone.style.width = `${targetWidth}px`;
  clone.style.maxWidth = "none";
  clone.style.height = "auto";
  clone.style.margin = "0";
  clone.style.boxSizing = "border-box";
  clone.style.paddingLeft = "40px";
  clone.style.paddingRight = "40px";
  clone.style.paddingTop = "40px";

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

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (img.height * pageWidth) / img.width;

    // Threshold to scale to fit a single A4 page instead of splitting: 1.25 * pageHeight (371.25 mm)
    // This allows slightly taller templates to gracefully fit on one page.
    const singlePageThreshold = pageHeight * 1.25;

    if (imgHeight <= pageHeight) {
      // Content fits naturally on a single A4 page
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    } else if (imgHeight <= singlePageThreshold) {
      // Content slightly overflows: scale down proportionally to fit on a single page
      const scaledWidth = (pageHeight * img.width) / img.height;
      const xOffset = (pageWidth - scaledWidth) / 2;
      pdf.addImage(imgData, "PNG", xOffset, 0, scaledWidth, pageHeight);
    } else {
      // Content is very long: render over multiple pages
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};