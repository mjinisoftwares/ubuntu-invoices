"use client";

import { useCallback, useMemo, useState } from "react";
import QuotationForm from "@/components/quotation-form";
import QuotationPreview from "@/components/quotation-preview";
import { useQuotation } from "@/context/quotation-context";
import {
  getQuotationHistory,
  deleteQuotationRecord,
  updateQuotationStatus,
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
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatters";
import { toast } from "sonner";

interface QuotationsClientProps {
  initialQuotations: QuotationData[];
}

export default function QuotationsClient({
  initialQuotations,
}: QuotationsClientProps) {
  const [view, setView] = useState<"list" | "form" | "preview">("list");
  const [quotations, setQuotations] = useState<QuotationData[]>(
    initialQuotations || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { quotation, updateQuotation, saveQuotation } = useQuotation();

  const refreshQuotations = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const history = await getQuotationHistory();
      setQuotations(history || []);
    } catch (error) {
      console.error("Failed to refresh quotations:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleSave = async () => {
    if (!quotation.toName || !quotation.toEmail) {
      toast.warning("Please provide client name and email before saving.");
      return;
    }

    try {
      setIsSaving(true);
      await saveQuotation();
      toast.success(
        `Quotation #${quotation.quotationNumber} saved successfully!`
      );
      await refreshQuotations();
    } catch (error) {
      console.error("Failed to save quotation:", error);
      toast.error("Failed to save quotation. Please check your data.");
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

    toast.info("Created new quotation draft.");
    setView("form");
  };

  const handleLoadQuotation = (quotationData: QuotationData) => {
    updateQuotation(quotationData);
    toast.info(
      `Loaded quotation #${quotationData.quotationNumber} for editing.`
    );
    setView("form");
  };

  const handleStatusChange = async (quotationNumber: string, newStatus: string) => {
    // Optimistic UI update
    setQuotations((prev) =>
      prev.map((q) =>
        q.quotationNumber === quotationNumber ? { ...q, status: newStatus } : q
      )
    );

    try {
      await updateQuotationStatus(quotationNumber, newStatus);
      toast.success(`Quotation #${quotationNumber} updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(`Failed to update status for #${quotationNumber}`);
      await refreshQuotations();
    }
  };

  const handleBackToList = () => {
    setView("list");
  };

  const handleDeleteQuotation = async (quotationNumber: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Quotation #${quotationNumber}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(quotationNumber);
      // Optimistic UI update
      setQuotations((prev) =>
        prev.filter((q) => q.quotationNumber !== quotationNumber)
      );

      await deleteQuotationRecord(quotationNumber);
      toast.success(`Quotation #${quotationNumber} deleted successfully.`);
      await refreshQuotations();
    } catch (error) {
      console.error("Failed to delete quotation:", error);
      toast.error(`Failed to delete Quotation #${quotationNumber}.`);
      await refreshQuotations();
    } finally {
      setDeletingId(null);
    }
  };

  // Table Columns
  const columns = useMemo<ColumnDef<QuotationData>[]>(
    () => [
      {
        accessorKey: "quotationNumber",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Quotation ID</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 size-3.5" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 size-3.5" />
            ) : (
              <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground/60" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-sm text-foreground">
            {row.original.quotationNumber}
          </span>
        ),
      },
      {
        accessorKey: "toName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Client</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 size-3.5" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 size-3.5" />
            ) : (
              <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground/60" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-sm">{row.original.toName || "N/A"}</div>
            <div className="text-xs text-muted-foreground">{row.original.toEmail}</div>
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Date</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 size-3.5" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 size-3.5" />
            ) : (
              <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground/60" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.date ? formatDate(row.original.date) : "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              className="-mr-3 h-8 font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Total Amount</span>
              {column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 size-3.5" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 size-3.5" />
              ) : (
                <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground/60" />
              )}
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-semibold text-sm">
            KES {Number(row.original.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Status</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 size-3.5" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 size-3.5" />
            ) : (
              <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground/60" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const rawStatus = row.original.status || "DRAFT";
          const isAccepted = rawStatus === "ACCEPTED";
          const isSent = rawStatus === "SENT" || rawStatus === "In Process";
          const isDraft = rawStatus === "DRAFT" || rawStatus === "Not Started";
          const isRejected = rawStatus === "REJECTED";
          const isExpired = rawStatus === "EXPIRED";

          let badgeClasses = "bg-muted/60 text-muted-foreground border-border";
          let dotColor = "bg-muted-foreground";

          if (isAccepted) {
            badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50";
            dotColor = "bg-emerald-500";
          } else if (isSent) {
            badgeClasses = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50";
            dotColor = "bg-blue-500";
          } else if (isDraft) {
            badgeClasses = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50";
            dotColor = "bg-amber-500";
          } else if (isRejected) {
            badgeClasses = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50";
            dotColor = "bg-rose-500";
          } else if (isExpired) {
            badgeClasses = "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
            dotColor = "bg-slate-500";
          }

          return (
            <Select
              value={rawStatus}
              onValueChange={(val) =>
                handleStatusChange(row.original.quotationNumber, val)
              }
            >
              <SelectTrigger className="h-7 w-auto border-0 p-0 shadow-none bg-transparent hover:opacity-80 focus:ring-0">
                <Badge
                  variant="outline"
                  className={`px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${badgeClasses}`}
                >
                  {isAccepted ? (
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <span className={`size-1.5 rounded-full ${dotColor}`} />
                  )}
                  <span>{rawStatus.replace("_", " ")}</span>
                </Badge>
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="SENT">SENT</SelectItem>
                <SelectItem value="ACCEPTED">ACCEPTED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
                <SelectItem value="EXPIRED">EXPIRED</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => handleLoadQuotation(row.original)}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="h-8 px-2"
              disabled={deletingId === row.original.quotationNumber}
              onClick={() => handleDeleteQuotation(row.original.quotationNumber)}
            >
              {deletingId === row.original.quotationNumber ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [deletingId]
  );

  const table = useReactTable({
    data: quotations,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isFiltered = table.getState().columnFilters.length > 0;

  if (view === "preview") {
    return (
      <QuotationPreview
        onBack={() => setView("form")}
        onDownloadComplete={() => {
          handleCreateNew();
          setView("list");
          refreshQuotations();
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {view === "list" ? (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Quotations
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and generate professional price estimates and quotations.
              </p>
            </div>

            <Button onClick={handleCreateNew} className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create Quotation</span>
            </Button>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Quotation History</CardTitle>
              {isRefreshing && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-full border">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Syncing database...
                </span>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {quotations.length === 0 ? (
                <div className="py-12 text-center border border-dashed rounded-xl">
                  <p className="mb-4 text-muted-foreground">
                    No quotations found in database.
                  </p>
                  <Button variant="outline" onClick={handleCreateNew}>
                    Create your first quotation
                  </Button>
                </div>
              ) : (
                <>
                  {/* Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/20 p-3 rounded-xl border">
                    <div className="flex flex-1 items-center gap-2 flex-wrap">
                      <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder="Search client name..."
                          value={(table.getColumn("toName")?.getFilterValue() as string) ?? ""}
                          onChange={(event) =>
                            table.getColumn("toName")?.setFilterValue(event.target.value)
                          }
                          className="pl-8 h-8 text-xs bg-background"
                        />
                      </div>

                      <Select
                        value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                        onValueChange={(val) => {
                          table.getColumn("status")?.setFilterValue(val === "all" ? "" : val);
                        }}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs bg-background">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="DRAFT">DRAFT</SelectItem>
                          <SelectItem value="SENT">SENT</SelectItem>
                          <SelectItem value="ACCEPTED">ACCEPTED</SelectItem>
                          <SelectItem value="REJECTED">REJECTED</SelectItem>
                          <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                        </SelectContent>
                      </Select>

                      {isFiltered && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => table.resetColumnFilters()}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="size-3.5 mr-1" />
                          Reset
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs ml-auto">
                            <SlidersHorizontal className="size-3.5" />
                            <span>Columns</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          {table
                            .getAllColumns()
                            .filter(
                              (column) =>
                                typeof column.accessorFn !== "undefined" &&
                                column.getCanHide()
                            )
                            .map((column) => (
                              <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize text-xs"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                  column.toggleVisibility(!!value)
                                }
                              >
                                {column.id}
                              </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Table Component */}
                  <div className="overflow-hidden rounded-xl border bg-card">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id} className="py-3 px-4">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>

                      <TableBody>
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-3 px-4">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-28 text-center text-muted-foreground"
                            >
                              No matching quotations found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Shadcn Radix Pagination Controls */}
                  <div className="flex items-center justify-between flex-wrap gap-4 py-2 px-1">
                    <div className="text-xs text-muted-foreground">
                      Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} quotation(s)
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="rows-per-page" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          Rows per page
                        </Label>
                        <Select
                          value={`${table.getState().pagination.pageSize}`}
                          onValueChange={(value) => {
                            table.setPageSize(Number(value));
                          }}
                        >
                          <SelectTrigger size="sm" className="w-[70px] h-8 text-xs bg-background" id="rows-per-page">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                          </SelectTrigger>
                          <SelectContent side="top">
                            <SelectGroup>
                              {[5, 10, 20, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                                  {pageSize}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="text-xs font-medium whitespace-nowrap">
                        Page {table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          className="size-8 p-0"
                          onClick={() => table.setPageIndex(0)}
                          disabled={!table.getCanPreviousPage()}
                          title="First page"
                        >
                          <ChevronsLeft className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="size-8 p-0"
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          title="Previous page"
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="size-8 p-0"
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          title="Next page"
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="size-8 p-0"
                          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                          disabled={!table.getCanNextPage()}
                          title="Last page"
                        >
                          <ChevronsRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
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

          <div className="rounded-2xl border bg-card text-card-foreground p-6 shadow-sm">
            <QuotationForm />
          </div>
        </>
      )}
    </div>
  );
}
