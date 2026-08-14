import { DataTable } from "@/components/data-table"
import prisma from "@/lib/prisma"
import data from "./data.json"

export default async function Page() {
  // Fetch invoices, quotations, and clients from the database
  const invoiceDb = await prisma.invoice.findMany({
    include: {
      client: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  const quotationDb = await prisma.quotation.findMany({
    include: {
      client: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })


  // Build combined list of recent documents for the table
  const combinedDocs = [
    ...invoiceDb.map((inv) => ({
      savedAt: inv.updatedAt || inv.createdAt,
      date: inv.issueDate,
      header: `Invoice #${inv.invoiceNumber} - ${inv.client.name}`,
      type: "Invoice",
      status: inv.status === "PAID" ? "Done" : "In Process",
      target: `KES ${Number(inv.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limit: inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : "-",
      reviewer: inv.client.email,
    })),
    ...quotationDb.map((qtn) => ({
      savedAt: qtn.updatedAt || qtn.createdAt,
      date: qtn.issueDate,
      header: `Quotation #${qtn.quotationNumber} - ${qtn.client.name}`,
      type: "Quotation",
      status: qtn.status === "ACCEPTED" ? "Done" : "In Process",
      target: `KES ${Number(qtn.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limit: qtn.dueDate ? qtn.dueDate.toISOString().split("T")[0] : "-",
      reviewer: qtn.client.email,
    })),
  ]

  // Sort combined documents by most recently saved first
  combinedDocs.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime())

  // Map to the exact DataTable format (needs id as number)
  const mappedTableData = combinedDocs.map((doc, idx) => ({
    id: idx + 1,
    header: doc.header,
    type: doc.type,
    status: doc.status,
    target: doc.target,
    limit: doc.limit,
    reviewer: doc.reviewer,
  }))

  const hasData = invoiceDb.length > 0 || quotationDb.length >0
  const finalTableData = hasData ? mappedTableData : data

 


  return (
    <div className="flex flex-col gap-4 py-4 md:gap-4 md:py-6">
      
      <DataTable data={finalTableData } />
    </div>
  )
}
