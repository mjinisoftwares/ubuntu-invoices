"use client";

import { useCallback, useEffect, useState } from "react";
import QuotationForm from "@/components/quotation-form";
import QuotationPreview from "@/components/quotation-preview";
import { useQuotation } from "@/context/quotation-context";
import {
  getQuotationHistory,
  deleteQuotationRecord,
} from "@/utils/history";
import { QuotationData } from "@/types/quotation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Eye,
  Save,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { toast } from "sonner";

export default function QuotationsPage() {
  const [view, setView] = useState<"list" | "form" | "preview">("list");
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { quotation, updateQuotation, saveQuotation } = useQuotation();

  const loadQuotations = useCallback(async () => {
    try {
      setLoading(true);

      const history = await getQuotationHistory();

      setQuotations(history || []);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      toast.error("Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  let ignore = false;

  const load = async () => {
    try {
      setLoading(true);

      const history = await getQuotationHistory();

      if (!ignore) {
        setQuotations(history || []);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
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
}, []);

  const handleSave = async () => {
    if (!quotation.toName || !quotation.toEmail) {
      toast.error("Please provide client name and email before saving.");
      return;
    }

    try {
      setIsSaving(true);

      await saveQuotation();

      toast.success(
        `Quotation #${quotation.quotationNumber} saved successfully!`
      );

      await loadQuotations();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save quotation.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    const today = new Date().toISOString().split("T")[0];

    updateQuotation({
      id: undefined,
      quotationNumber: `QTN-${Math.floor(
        100000 + Math.random() * 900000
      )}`,
      date: today,
      dueDate: "",
      fromName: "Ubuntu Logistics",
      fromEmail: "info@ubuntulogistics.co.ke",
      toName: "",
      toEmail: "",
      items: [
        {
          id: crypto.randomUUID(),
          date: today,
          pickupPaid: "",
          dropoffReturnTrip: "",
          amount: 0,
        },
      ],
      total: 0,
      notes: "",
      status: "DRAFT",
    });

    setView("form");
  };

  const handleLoadQuotation = (quotationData: QuotationData) => {
    updateQuotation(quotationData);
    setView("form");
  };

  const handleBackToList = async () => {
    setView("list");
    await loadQuotations();
  };

  const handleDeleteQuotation = async (
    quotationNumber: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Quotation #${quotationNumber}?`
    );

    if (!confirmed) return;

    try {
      await deleteQuotationRecord(quotationNumber);

      toast.success("Quotation deleted successfully.");

      setQuotations((prev) =>
        prev.filter(
          (q) => q.quotationNumber !== quotationNumber
        )
      );
    } catch (error) {
      console.error("Failed to delete quotation:", error);
      toast.error("Failed to delete quotation.");
    }
  };

  if (view === "preview") {
    return (
      <QuotationPreview
        onBack={() => setView("form")}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {view === "list" ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Quotations
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and generate professional price estimates and
                quotations.
              </p>
            </div>

            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Quotation
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quotation History</CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading saved quotations...
                </div>
              ) : quotations.length === 0 ? (
                <div className="py-12 text-center border border-dashed rounded-xl">
                  <p className="mb-4 text-muted-foreground">
                    No quotations found in database.
                  </p>

                  <Button
                    variant="outline"
                    onClick={handleCreateNew}
                  >
                    Create your first quotation
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 font-semibold">
                          Quotation ID
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          Client
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          Total Amount
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {quotations.map((q) => (
                        <tr
                          key={q.quotationNumber}
                          className="border-t transition-colors hover:bg-muted/30"
                        >
                          <td className="px-4 py-3 font-semibold">
                            {q.quotationNumber}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-medium">
                              {q.toName || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {q.toEmail}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {q.date ? formatDate(q.date) : "N/A"}
                          </td>

                          <td className="px-4 py-3 font-semibold">
                            KES {Number(q.total).toFixed(2)}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                q.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {q.status || "DRAFT"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleLoadQuotation(q)
                                }
                              >
                                <Edit className="w-3.5 h-3.5 mr-1" />
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteQuotation(
                                    q.quotationNumber
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
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              disabled={isSaving}
              onClick={handleBackToList}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div>
              <h1 className="text-xl font-bold">
                {quotation.id
                  ? "Edit Quotation"
                  : "Create New Quotation"}
              </h1>

              <p className="text-xs text-muted-foreground">
                Document ID: {quotation.quotationNumber}
              </p>
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}

                {isSaving ? "Saving..." : "Save"}
              </Button>

              <Button
                onClick={() => setView("preview")}
                disabled={isSaving}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Quotation
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <QuotationForm />
          </div>
        </>
      )}
    </div>
  );
}