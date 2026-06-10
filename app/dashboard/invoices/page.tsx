"use client";

import { useEffect, useState } from "react";
import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { useInvoice } from "@/context/invoice-context";
import { getInvoiceHistory, deleteInvoiceRecord } from "@/utils/history";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit, ArrowLeft, Eye } from "lucide-react";
import { formatDate } from "@/utils/formatters";



export default function InvoicesPage() {
  const [view, setView] = useState<"list" | "form" | "preview">("list");
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

  const { invoice, updateInvoice } = useInvoice();

  

 
  // ✅ SAFE LOAD (no eslint warning, no cascading renders)
  useEffect(() => {
    if (view !== "list") return;

    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);

        const history = await getInvoiceHistory();

        if (!ignore) {
          setInvoices(history || []);
        }
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [view]);

  const handleCreateNew = () => {
    const today = new Date().toISOString().split("T")[0];

    updateInvoice({
      id: undefined,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: today,
      dueDate: "",
      fromName: "Ubuntu Logistics",
      fromEmail: "info@ubuntulogistics.co.ke",
      toName: "",
      toEmail: "",
      items: [
        {
          id: Math.random().toString(36).substring(2, 9),
          description: "",
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
      taxRate: 16,
      taxAmount: 0,
      subtotal: 0,
      total: 0,
      notes: "",
      status: "DRAFT",
    });

    setView("form");
  };

  const handleLoadInvoice = (inv: InvoiceData) => {
    updateInvoice(inv);
    setView("form");
  };

  const handleDeleteInvoice = async (num: string) => {
    if (!confirm(`Are you sure you want to delete Invoice #${num}?`)) return;

    try {
      await deleteInvoiceRecord(num);

      // ✅ instant UI update (no refetch needed)
      setInvoices((prev) =>
        prev.filter((i) => i.invoiceNumber !== num)
      );
    } catch (err) {
      console.error("Failed to delete invoice:", err);
    }
  };

  if (view === "preview") {
    return <InvoicePreview onBack={() => setView("form")} />;
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {view === "list" ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Invoices
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage and generate professional invoices for your clients.
              </p>
            </div>

            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading saved invoices...
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl">
                  <p className="text-gray-500 mb-4">
                    No invoices found in database.
                  </p>
                  <Button onClick={handleCreateNew} variant="outline">
                    Create your first invoice
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-sm">
                      <tr>
                        <th className="py-3 px-4 font-semibold text-gray-600">
                          Invoice ID
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600">
                          Client
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600">
                          Date
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600">
                          Total Amount
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600">
                          Status
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoices.map((inv) => (
                        <tr
                          key={inv.invoiceNumber}
                          className="border-t hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold">
                            {inv.invoiceNumber}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium">
                              {inv.toName || "N/A"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {inv.toEmail}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-sm text-gray-500">
                            {inv.date ? formatDate(inv.date) : "N/A"}
                          </td>

                          <td className="py-3 px-4 font-semibold">
                            KES {Number(inv.total).toFixed(2)}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                inv.status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {inv.status || "DRAFT"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleLoadInvoice(inv)
                                }
                              >
                                <Edit className="w-3.5 h-3.5 mr-1" />
                                Edit
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteInvoice(
                                    inv.invoiceNumber
                                  )
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setView("list")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div>
              <h1 className="text-xl font-bold">
                {invoice.id
                  ? "Edit Invoice"
                  : "Create New Invoice"}
              </h1>

              <p className="text-xs text-muted-foreground">
                Document ID: {invoice.invoiceNumber}
              </p>
            </div>

            <Button
              className="ml-auto"
              onClick={() => setView("preview")}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Invoice
            </Button>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <InvoiceForm />
          </div>
        </>
      )}
    </div>
  );
}