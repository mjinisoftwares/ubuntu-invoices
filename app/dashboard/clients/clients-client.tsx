"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getClients, saveClient, deleteClientRecord, ClientData } from "@/utils/clients";
import { useInvoice } from "@/context/invoice-context";
import { useQuotation } from "@/context/quotation-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  SlidersHorizontal,
  Users,
  Building2,
  Receipt,
  FileText,
  DollarSign,
  Phone,
  Mail,
  MapPin,
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/formatters";
import { toast } from "sonner";

interface ClientsClientProps {
  initialClients: ClientData[];
}

export default function ClientsClient({ initialClients }: ClientsClientProps) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientData[]>(initialClients || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "Kenya",
    notes: "",
  });

  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { updateInvoice } = useInvoice();
  const { updateQuotation } = useQuotation();

  const refreshClients = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await getClients();
      setClients(data || []);
    } catch (err) {
      console.error("Failed to refresh clients:", err);
      toast.error("Failed to sync clients from database.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      mobile: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "Kenya",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditModal = (client: ClientData) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      email: client.email || "",
      mobile: client.mobile || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      pincode: client.pincode || "",
      country: client.country || "Kenya",
      notes: client.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.warning("Client name and email are required.");
      return;
    }

    try {
      setIsSaving(true);
      await saveClient({
        id: editingClient?.id,
        ...formData,
      });

      toast.success(
        editingClient
          ? `Client "${formData.name}" updated successfully!`
          : `Client "${formData.name}" added successfully!`
      );
      setIsDialogOpen(false);
      await refreshClients();
    } catch (err: any) {
      console.error("Failed to save client:", err);
      toast.error(err.message || "Failed to save client.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClient = async (client: ClientData) => {
    if (!client.id) return;

    if (
      (client._count?.invoices && client._count.invoices > 0) ||
      (client._count?.quotations && client._count.quotations > 0)
    ) {
      toast.error(
        `Cannot delete ${client.name} because they have ${client._count?.invoices || 0} invoice(s) and ${client._count?.quotations || 0} quotation(s).`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete client "${client.name}" (${client.email})?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(client.id);
      setClients((prev) => prev.filter((c) => c.id !== client.id));

      await deleteClientRecord(client.id);
      toast.success(`Client "${client.name}" deleted.`);
      await refreshClients();
    } catch (err: any) {
      console.error("Failed to delete client:", err);
      toast.error(err.message || "Failed to delete client.");
      await refreshClients();
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateInvoiceForClient = (client: ClientData) => {
    const today = new Date().toISOString().split("T")[0];
    updateInvoice({
      id: undefined,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: today,
      dueDate: "",
      fromName: "Ubuntu Logistics",
      fromEmail: "info@ubuntulogistics.co.ke",
      toName: client.name,
      toEmail: client.email,
      items: [
        {
          id: crypto.randomUUID(),
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
    router.push("/dashboard/invoices");
    toast.info(`Creating invoice for ${client.name}`);
  };

  const handleCreateQuotationForClient = (client: ClientData) => {
    const today = new Date().toISOString().split("T")[0];
    updateQuotation({
      id: undefined,
      quotationNumber: `QTN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: today,
      dueDate: "",
      fromName: "Ubuntu Logistics",
      fromEmail: "info@ubuntulogistics.co.ke",
      toName: client.name,
      toEmail: client.email,
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
    router.push("/dashboard/quotations");
    toast.info(`Creating quotation for ${client.name}`);
  };

  // Metrics
  const totalClientsCount = clients.length;
  const totalBilledRevenue = useMemo(
    () => clients.reduce((sum, c) => sum + (c.totalBilled || 0), 0),
    [clients]
  );
  const activeClientsCount = useMemo(
    () =>
      clients.filter(
        (c) =>
          (c._count?.invoices && c._count.invoices > 0) ||
          (c._count?.quotations && c._count.quotations > 0)
      ).length,
    [clients]
  );

  // Table Columns
  const columns = useMemo<ColumnDef<ClientData>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Client Name</span>
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
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
              {row.original.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">
                {row.original.name}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {row.original.city && <span>{row.original.city}, </span>}
                <span>{row.original.country || "Kenya"}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Contact Info</span>
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
          <div className="space-y-0.5">
            <div className="text-xs font-medium flex items-center gap-1.5 text-foreground">
              <Mail className="size-3 text-muted-foreground" />
              <span>{row.original.email}</span>
            </div>
            {row.original.mobile && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3 text-muted-foreground" />
                <span>{row.original.mobile}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "address",
        header: "Location",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground flex items-start gap-1 max-w-[180px] truncate">
            <MapPin className="size-3 shrink-0 mt-0.5" />
            <span className="truncate">
              {row.original.address
                ? `${row.original.address}${row.original.city ? `, ${row.original.city}` : ""}`
                : row.original.city || "Not specified"}
            </span>
          </div>
        ),
      },
      {
        id: "documents",
        header: "Linked Docs",
        cell: ({ row }) => {
          const invCount = row.original._count?.invoices || 0;
          const qtnCount = row.original._count?.quotations || 0;

          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[11px] font-medium bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                <Receipt className="size-3 mr-1" />
                {invCount} {invCount === 1 ? "Invoice" : "Invoices"}
              </Badge>
              <Badge variant="outline" className="text-[11px] font-medium bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                <FileText className="size-3 mr-1" />
                {qtnCount} {qtnCount === 1 ? "Quote" : "Quotes"}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "totalBilled",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              className="-mr-3 h-8 font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Total Billed</span>
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
            KES {Number(row.original.totalBilled || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => handleOpenEditModal(row.original)}
            >
              <Edit className="size-3.5" />
              <span>Edit</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  <Plus className="size-3.5 mr-1" />
                  <span>Create</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleCreateInvoiceForClient(row.original)}>
                  <Receipt className="size-4 mr-2 text-primary" />
                  <span>Create Invoice</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateQuotationForClient(row.original)}>
                  <FileText className="size-4 mr-2 text-primary" />
                  <span>Create Quotation</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={deletingId === row.original.id}
                  onClick={() => handleDeleteClient(row.original)}
                >
                  <Trash2 className="size-4 mr-2" />
                  <span>Delete Client</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [deletingId]
  );

  const table = useReactTable({
    data: clients,
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

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients Directory</h1>
          <p className="text-muted-foreground text-sm">
            Manage your client directory and link clients directly into invoices and quotations.
          </p>
        </div>

        <Button onClick={handleOpenCreateModal} className="gap-1.5">
          <Plus className="size-4" />
          <span>Add Client</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Clients</p>
              <h3 className="text-2xl font-bold mt-1">{totalClientsCount}</h3>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Clients</p>
              <h3 className="text-2xl font-bold mt-1">{activeClientsCount}</h3>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Revenue Invoiced</p>
              <h3 className="text-xl font-bold mt-1">
                KES {totalBilledRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">Clients List</CardTitle>
            <CardDescription className="text-xs">
              All registered clients linked to Ubuntu Logistics documents.
            </CardDescription>
          </div>
          {isRefreshing && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-full border">
              <Loader2 className="size-3.5 animate-spin text-primary" /> Syncing clients...
            </span>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {clients.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl">
              <Users className="size-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No clients found in database.</p>
              <Button onClick={handleOpenCreateModal} variant="outline">
                Register your first client
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
                      value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                      onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                      }
                      className="pl-8 h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Input
                      placeholder="Filter by email..."
                      value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                      onChange={(event) =>
                        table.getColumn("email")?.setFilterValue(event.target.value)
                      }
                      className="h-8 text-xs bg-background"
                    />
                  </div>

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
                          No matching clients found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between flex-wrap gap-4 py-2 px-1">
                <div className="text-xs text-muted-foreground">
                  Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} client(s)
                </div>

                <div className="flex items-center gap-6 ml-auto">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rows-per-page-clients" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Rows per page
                    </Label>
                    <Select
                      value={`${table.getState().pagination.pageSize}`}
                      onValueChange={(value) => {
                        table.setPageSize(Number(value));
                      }}
                    >
                      <SelectTrigger size="sm" className="w-[70px] h-8 text-xs bg-background" id="rows-per-page-clients">
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

      {/* Add / Edit Client Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveClient}>
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Edit Client Profile" : "Add New Client"}
              </DialogTitle>
              <DialogDescription>
                {editingClient
                  ? "Update client information and contact details."
                  : "Register a new client to quickly use them in invoices and quotations."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="clientName">Client / Company Name *</Label>
                  <Input
                    id="clientName"
                    placeholder="e.g. Acme Corp / John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail">Email Address *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="e.g. client@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="clientMobile">Mobile / Phone Number</Label>
                  <Input
                    id="clientMobile"
                    placeholder="+254 700 000 000"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="clientCity">City</Label>
                  <Input
                    id="clientCity"
                    placeholder="Nairobi"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="clientAddress">Physical Address</Label>
                  <Input
                    id="clientAddress"
                    placeholder="Street, Building, Floor"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="clientCountry">Country</Label>
                  <Input
                    id="clientCountry"
                    placeholder="Kenya"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, country: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientNotes">Notes / Special Instructions</Label>
                <Input
                  id="clientNotes"
                  placeholder="Optional notes regarding billing or terms"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingClient ? (
                  "Update Client"
                ) : (
                  "Save Client"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
