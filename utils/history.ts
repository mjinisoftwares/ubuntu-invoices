"use server";

import prisma from "@/lib/prisma";

import { InvoiceData } from "@/types/invoice";
import { QuotationData } from "@/types/quotation";
import { revalidatePath } from "next/cache";

export async function getInvoiceHistory(): Promise<InvoiceData[]> {
  const invoices = await prisma.invoice.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      client: true,
      items: true,
    },
  });

  return invoices.map((inv) => {
    let fromName = "Ubuntu Logistics";
    let fromEmail = "info@ubuntulogistics.co.ke";
    let taxRate = 16;
    let originalNotes = inv.notes || "";

    if (inv.notes) {
      try {
        const parsed = JSON.parse(inv.notes);
        if (parsed && typeof parsed === "object") {
          fromName = parsed.fromName ?? fromName;
          fromEmail = parsed.fromEmail ?? fromEmail;
          taxRate = parsed.taxRate ?? taxRate;
          originalNotes = parsed.notes ?? originalNotes;
        }
      } catch (e) {
        // Not JSON notes, fallback to raw value
      }
    }

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      date: inv.issueDate.toISOString().split("T")[0],
      dueDate: inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : undefined,
      fromName,
      fromEmail,
      toName: inv.client.name,
      toEmail: inv.client.email,
      items: inv.items.map((item) => {
        let description = item.description;
        let numberOfDays = 1;
        try {
          const parsed = JSON.parse(item.description);
          if (parsed && typeof parsed === "object") {
            description = parsed.description ?? item.description;
            numberOfDays = parsed.numberOfDays ?? 1;
          }
        } catch {
          description = item.description;
        }

        return {
          id: item.id,
          description,
          quantity: item.quantity,
          rate: Number(item.unitPrice),
          numberOfDays,
          amount: Number(item.amount),
        };
      }),
      taxRate,
      taxAmount: Number(inv.taxAmount),
      subtotal: Number(inv.subtotal),
      total: Number(inv.totalAmount),
      notes: originalNotes,
      status: inv.status,
      numberOfDays: inv.numberOfDays || 1,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    };
  });
}

export async function saveInvoiceToHistory(invoice: InvoiceData) {
  // 1. Upsert Client by email
  const client = await prisma.client.upsert({
    where: { email: invoice.toEmail },
    update: { name: invoice.toName },
    create: {
      name: invoice.toName,
      email: invoice.toEmail,
    },
  });

  // 2. Serialize metadata into notes
  const notesJson = JSON.stringify({
    fromName: invoice.fromName,
    fromEmail: invoice.fromEmail,
    taxRate: invoice.taxRate === "" ? 0 : Number(invoice.taxRate),
    notes: invoice.notes || "",
  });

  // 3. Prepare items data
  const itemsData = invoice.items.map((item) => ({
    description: JSON.stringify({
      description: item.description,
      numberOfDays: item.numberOfDays === "" ? 1 : Number(item.numberOfDays) || 1,
    }),
    quantity: item.quantity === "" ? 0 : Number(item.quantity),
    unitPrice: item.rate === "" ? 0 : Number(item.rate),
    amount: item.amount,
  }));

  const totalDays = invoice.items.reduce(
    (sum, item) => sum + (item.numberOfDays === "" ? 1 : Number(item.numberOfDays) || 1),
    0
  );

  // 4. Upsert Invoice
  const existingInvoice = await prisma.invoice.findUnique({
    where: { invoiceNumber: invoice.invoiceNumber },
  });

  const invoiceStatus = (invoice.status || "DRAFT") as any;

  let result;
  if (existingInvoice) {
    // Delete existing items to recreate them
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: existingInvoice.id },
    });

    result = await prisma.invoice.update({
      where: { id: existingInvoice.id },
      data: {
        issueDate: new Date(invoice.date),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
        numberOfDays: totalDays,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.total,
        notes: notesJson,
        status: invoiceStatus,
        clientId: client.id,
        items: {
          create: itemsData,
        },
      },
    });
  } else {
    result = await prisma.invoice.create({
      data: {
        invoiceNumber: invoice.invoiceNumber,
        issueDate: new Date(invoice.date),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
        numberOfDays: totalDays,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.total,
        notes: notesJson,
        status: invoiceStatus,
        clientId: client.id,
        items: {
          create: itemsData,
        },
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/clients");
  return result;
}

export async function updateInvoiceStatus(invoiceNumber: string, status: string) {
  const result = await prisma.invoice.update({
    where: { invoiceNumber },
    data: {
      status: status as any,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  return result;
}

export async function getQuotationHistory(): Promise<QuotationData[]> {
  const quotations = await prisma.quotation.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      client: true,
      items: true,
    },
  });

  return quotations.map((qtn) => {
    let fromName = "Ubuntu Logistics";
    let fromEmail = "info@ubuntulogistics.co.ke";
    let originalNotes = qtn.notes || "";

    if (qtn.notes) {
      try {
        const parsed = JSON.parse(qtn.notes);
        if (parsed && typeof parsed === "object") {
          fromName = parsed.fromName ?? fromName;
          fromEmail = parsed.fromEmail ?? fromEmail;
          originalNotes = parsed.notes ?? originalNotes;
        }
      } catch (e) {
        // Not JSON notes, fallback to raw value
      }
    }

    return {
      id: qtn.id,
      quotationNumber: qtn.quotationNumber,
      date: qtn.issueDate.toISOString().split("T")[0],
      dueDate: qtn.dueDate ? qtn.dueDate.toISOString().split("T")[0] : undefined,
      fromName,
      fromEmail,
      toName: qtn.client.name,
      toEmail: qtn.client.email,
      items: qtn.items.map((item) => {
        let date = qtn.issueDate.toISOString().split("T")[0];
        let pickupPaid = "";
        let dropoffReturnTrip = "";
        let numberOfDays = 1;

        try {
          const parsedDesc = JSON.parse(item.description);
          if (parsedDesc && typeof parsedDesc === "object") {
            date = parsedDesc.date ?? date;
            pickupPaid = parsedDesc.pickupPaid ?? "";
            dropoffReturnTrip = parsedDesc.dropoffReturnTrip ?? "";
            numberOfDays = parsedDesc.numberOfDays ?? 1;
          }
        } catch (e) {
          // Fallback if not JSON
          pickupPaid = item.description;
        }

        return {
          id: item.id,
          date,
          pickupPaid,
          dropoffReturnTrip,
          numberOfDays,
          amount: Number(item.amount),
          status: qtn.status,
        };
      }),
      total: Number(qtn.totalAmount),
      notes: originalNotes,
      status: qtn.status,
      numberOfDays: qtn.numberOfDays || 1,
      createdAt: qtn.createdAt,
      updatedAt: qtn.updatedAt,
    };
  });
}

export async function saveQuotationToHistory(quotation: QuotationData) {
  // 1. Upsert Client by email
  const client = await prisma.client.upsert({
    where: { email: quotation.toEmail },
    update: { name: quotation.toName },
    create: {
      name: quotation.toName,
      email: quotation.toEmail,
    },
  });

  // 2. Serialize metadata into notes
  const notesJson = JSON.stringify({
    fromName: quotation.fromName,
    fromEmail: quotation.fromEmail,
    notes: quotation.notes || "",
  });

  // 3. Prepare items data
  const itemsData = quotation.items.map((item) => ({
    description: JSON.stringify({
      date: item.date,
      pickupPaid: item.pickupPaid,
      dropoffReturnTrip: item.dropoffReturnTrip,
      numberOfDays: item.numberOfDays === "" ? 1 : Number(item.numberOfDays) || 1,
    }),
    quantity: 1,
    unitPrice: item.amount === "" ? 0 : Number(item.amount),
    amount: item.amount === "" ? 0 : Number(item.amount),
  }));

  const totalDays = quotation.items.reduce(
    (sum, item) => sum + (item.numberOfDays === "" ? 1 : Number(item.numberOfDays) || 1),
    0
  );

  // 4. Upsert Quotation
  const existingQuotation = await prisma.quotation.findUnique({
    where: { quotationNumber: quotation.quotationNumber },
  });

  const quotationStatus = (quotation.status || "DRAFT") as any;

  let result;
  if (existingQuotation) {
    // Delete existing items to recreate them
    await prisma.quotationItem.deleteMany({
      where: { quotationId: existingQuotation.id },
    });

    result = await prisma.quotation.update({
      where: { id: existingQuotation.id },
      data: {
        issueDate: new Date(quotation.date),
        dueDate: quotation.dueDate ? new Date(quotation.dueDate) : null,
        numberOfDays: totalDays,
        subtotal: quotation.total,
        totalAmount: quotation.total,
        notes: notesJson,
        status: quotationStatus,
        clientId: client.id,
        items: {
          create: itemsData,
        },
      },
    });
  } else {
    result = await prisma.quotation.create({
      data: {
        quotationNumber: quotation.quotationNumber,
        issueDate: new Date(quotation.date),
        dueDate: quotation.dueDate ? new Date(quotation.dueDate) : null,
        numberOfDays: totalDays,
        subtotal: quotation.total,
        totalAmount: quotation.total,
        notes: notesJson,
        status: quotationStatus,
        clientId: client.id,
        items: {
          create: itemsData,
        },
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/quotations");
  revalidatePath("/dashboard/clients");
  return result;
}

export async function updateQuotationStatus(quotationNumber: string, status: string) {
  const result = await prisma.quotation.update({
    where: { quotationNumber },
    data: {
      status: status as any,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/quotations");
  return result;
}

export async function deleteInvoiceRecord(invoiceNumber: string) {
  const deleted = await prisma.invoice.delete({
    where: { invoiceNumber },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  return deleted;
}

export async function deleteQuotationRecord(quotationNumber: string) {
  const deleted = await prisma.quotation.delete({
    where: { quotationNumber },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/quotations");
  return deleted;
}
