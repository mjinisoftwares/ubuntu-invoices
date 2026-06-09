import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import prisma from "@/lib/prisma"
import data from "./data.json"

export default async function Page() {
  // Fetch invoices, quotations, and clients from the database
  const invoiceDb = await prisma.invoice.findMany({
    include: {
      client: true,
    },
    orderBy: {
      issueDate: "desc",
    },
  })

  const quotationDb = await prisma.quotation.findMany({
    include: {
      client: true,
    },
    orderBy: {
      issueDate: "desc",
    },
  })


  // Calculate statistics
  const totalRevenue = invoiceDb
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + Number(inv.totalAmount), 0)

  const invoicesCount = invoiceDb.length
  const quotationsCount = quotationDb.length

  // Build combined list of recent documents for the table
  const combinedDocs = [
    ...invoiceDb.map((inv) => ({
      date: inv.issueDate,
      header: `Invoice #${inv.invoiceNumber} - ${inv.client.name}`,
      type: "Invoice",
      status: inv.status === "PAID" ? "Done" : "In Process",
      target: `KES ${Number(inv.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limit: inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : "-",
      reviewer: inv.client.email,
    })),
    ...quotationDb.map((qtn) => ({
      date: qtn.issueDate,
      header: `Quotation #${qtn.quotationNumber} - ${qtn.client.name}`,
      type: "Quotation",
      status: qtn.status === "ACCEPTED" ? "Done" : "In Process",
      target: `KES ${Number(qtn.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limit: qtn.dueDate ? qtn.dueDate.toISOString().split("T")[0] : "-",
      reviewer: qtn.client.email,
    })),
  ]

  // Sort combined documents by date newest
  combinedDocs.sort((a, b) => b.date.getTime() - a.date.getTime())

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

  const hasData = invoiceDb.length > 0 || quotationDb.length > 0
  const finalTableData = hasData ? mappedTableData : data

  // Generate date list for last 90 days for chart
  const chartPoints: { [date: string]: { date: string; desktop: number; mobile: number } } = {}
  const today = new Date()
  for (let i = 90; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    chartPoints[dateStr] = { date: dateStr, desktop: 0, mobile: 0 }
  }

  // Populate invoices sum per day
  invoiceDb.forEach((inv) => {
    const dateStr = inv.issueDate.toISOString().split("T")[0]
    if (chartPoints[dateStr]) {
      chartPoints[dateStr].desktop += Number(inv.totalAmount)
    }
  })

  // Populate quotations sum per day
  quotationDb.forEach((qtn) => {
    const dateStr = qtn.issueDate.toISOString().split("T")[0]
    if (chartPoints[dateStr]) {
      chartPoints[dateStr].mobile += Number(qtn.totalAmount)
    }
  })


  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards
        totalRevenue={totalRevenue}
        invoicesCount={invoicesCount}
        quotationsCount={quotationsCount}
      />
     
      <DataTable data={finalTableData } />
    </div>
  )
}
