import { getInvoiceHistory } from "@/utils/history";
import InvoicesClient from "./invoices-client";

export const metadata = {
  title: "Invoices | Ubuntu Logistics",
  description: "Manage and generate professional invoices for your clients.",
};

export default async function InvoicesPage() {
  // Server-side data fetching for instant rendering & Next.js cache optimization
  const invoices = await getInvoiceHistory();

  return <InvoicesClient initialInvoices={invoices} />;
}