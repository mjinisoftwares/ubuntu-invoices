import { getQuotationHistory } from "@/utils/history";
import QuotationsClient from "./quotations-client";

export const metadata = {
  title: "Quotations | Ubuntu Logistics",
  description: "Manage and generate professional price estimates and quotations.",
};

export default async function QuotationsPage() {
  // Server-side data fetching for instant rendering & Next.js cache optimization
  const quotations = await getQuotationHistory();

  return <QuotationsClient initialQuotations={quotations} />;
}