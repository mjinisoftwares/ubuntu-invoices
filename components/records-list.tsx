import { useEffect, useState } from "react";
import { getInvoiceHistory, getQuotationHistory, deleteInvoiceRecord, deleteQuotationRecord } from "@/utils/history";
import { useInvoice } from "@/context/invoice-context";
import { useQuotation } from "@/context/quotation-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Trash2, Edit } from "lucide-react";
import { InvoiceData } from "@/types/invoice";
import { QuotationData } from "@/types/quotation";
import { formatDate } from "@/utils/formatters";

export default function RecordsList({ onSelectTab }: { onSelectTab: (tab: "invoice" | "quotation") => void }) {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const { updateInvoice } = useInvoice();
  const { updateQuotation } = useQuotation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDbRecords = async () => {
      try {
        setInvoices(await getInvoiceHistory());
        setQuotations(await getQuotationHistory());
      } catch (err) {
        console.error("Failed to load records from DB:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDbRecords();
  }, []);

  const loadInvoice = (inv: InvoiceData) => {
    updateInvoice(inv);
    onSelectTab("invoice");
  };

  const loadQuotation = (quot: QuotationData) => {
    updateQuotation(quot);
    onSelectTab("quotation");
  };

  const deleteInvoice = async (num: string) => {
    await deleteInvoiceRecord(num);
    setInvoices(await getInvoiceHistory());
  };

  const deleteQuotation = async (num: string) => {
    await deleteQuotationRecord(num);
    setQuotations(await getQuotationHistory());
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Connecting to Database...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Quotations History */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Quotations (Extracted from DB)</CardTitle>
        </CardHeader>
        <CardContent>
          {quotations.length === 0 ? (
            <p className="text-gray-500">No quotation records found in database.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-sm">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-600">Document ID</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Client</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Date</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Total Amount</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr key={q.quotationNumber} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold">{q.quotationNumber}</td>
                      <td className="py-3 px-4">{q.toName || "Unknown"}</td>
                      <td className="py-3 px-4 text-gray-500">{q.date ? formatDate(q.date) : "No date"}</td>
                      <td className="py-3 px-4 font-medium">KES {Number(q.total).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => loadQuotation(q)}>
                            <Edit className="w-4 h-4 mr-2" /> Load
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteQuotation(q.quotationNumber)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices History */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Invoices (Extracted from DB)</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-gray-500">No invoice records found in database.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-sm">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-600">Document ID</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Client</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Date</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Total Amount</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.invoiceNumber} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4">{inv.toName || "Unknown"}</td>
                      <td className="py-3 px-4 text-gray-500">{inv.date ? formatDate(inv.date) : "No date"}</td>
                      <td className="py-3 px-4 font-medium">KES {Number(inv.total).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => loadInvoice(inv)}>
                            <Edit className="w-4 h-4 mr-2" /> Load
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteInvoice(inv.invoiceNumber)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
