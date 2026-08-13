"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Plus,
  TrendingUp,
  GripVertical,
} from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

// Drag handle component
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-muted cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="size-3.5 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Column definition with full sorting, filtering, and rich cells
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Header / Document</span>
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
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Section Type</span>
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
      <div className="w-32">
        <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold"
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
      const rawStatus = row.original.status || "DRAFT"
      const isDone = rawStatus === "Done" || rawStatus === "PAID" || rawStatus === "ACCEPTED"
      const isSent = rawStatus === "SENT" || rawStatus === "In Process"
      const isDraft = rawStatus === "DRAFT" || rawStatus === "Not Started"

      let badgeClasses = "bg-muted/60 text-muted-foreground border-border"
      let dotColor = "bg-muted-foreground"

      if (isDone) {
        badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
        dotColor = "bg-emerald-500"
      } else if (isSent) {
        badgeClasses = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50"
        dotColor = "bg-blue-500"
      } else if (isDraft) {
        badgeClasses = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50"
        dotColor = "bg-amber-500"
      }

      return (
        <Badge
          variant="outline"
          className={`px-2 py-0.5 text-xs font-medium gap-1.5 inline-flex items-center ${badgeClasses}`}
        >
          {isDone ? (
            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <span className={`size-1.5 rounded-full ${dotColor}`} />
          )}
          <span>{rawStatus}</span>
        </Badge>
      )
    },
  },
  {
    accessorKey: "target",
    header: ({ column }) => (
      <div className="w-full text-right">
        <Button
          variant="ghost"
          size="sm"
          className="-mr-3 h-8 data-[state=open]:bg-accent font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Target</span>
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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
            loading: `Saving ${row.original.header}`,
            success: "Saved target value successfully",
            error: "Error saving target",
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          className="h-8 w-24 border-transparent bg-transparent text-right font-medium shadow-none hover:bg-muted/50 focus-visible:border focus-visible:bg-background transition-colors"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  },
  {
    accessorKey: "limit",
    header: ({ column }) => (
      <div className="w-full text-right">
        <Button
          variant="ghost"
          size="sm"
          className="-mr-3 h-8 data-[state=open]:bg-accent font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Limit / Due Date</span>
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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
            loading: `Saving ${row.original.header}`,
            success: "Saved limit value successfully",
            error: "Error saving limit",
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          Limit
        </Label>
        <Input
          className="h-8 w-24 border-transparent bg-transparent text-right font-medium shadow-none hover:bg-muted/50 focus-visible:border focus-visible:bg-background transition-colors text-muted-foreground"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  },
  {
    accessorKey: "reviewer",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Reviewer / Client Email</span>
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
      const isAssigned = row.original.reviewer && row.original.reviewer !== "Assign reviewer"

      if (isAssigned) {
        return <span className="text-xs text-muted-foreground font-medium">{row.original.reviewer}</span>
      }

      return (
        <>
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            Reviewer
          </Label>
          <Select defaultValue="Eddie Lake">
            <SelectTrigger
              className="w-36 h-8 text-xs"
              id={`${row.original.id}-reviewer`}
            >
              <SelectValue placeholder="Assign reviewer" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
                <SelectItem value="info@ubuntulogistics.co.ke">Ubuntu Logistics</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => toast.info(`Viewing details for ${row.original.header}`)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.success(`Copied ${row.original.header}`)}>
            Make a copy
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => toast.info(`Action triggered for record #${row.original.id}`)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 transition-colors hover:bg-muted/40"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="py-2.5 px-3">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)

  // Sync state if initialData changes
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  // Get distinct types and statuses for faceted filters
  const uniqueTypes = React.useMemo(() => {
    const types = new Set<string>()
    data.forEach((item) => {
      if (item.type) types.add(item.type)
    })
    return Array.from(types)
  }, [data])

  const uniqueStatuses = React.useMemo(() => {
    const statuses = new Set<string>()
    data.forEach((item) => {
      if (item.status) statuses.add(item.status)
    })
    return Array.from(statuses)
  }, [data])

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        {/* Top bar with tabs & global actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 flex">
            <TabsTrigger value="outline">All Documents</TabsTrigger>
            <TabsTrigger value="past-performance">
              Performance <Badge variant="secondary">3</Badge>
            </TabsTrigger>
            <TabsTrigger value="key-personnel">
              Personnel <Badge variant="secondary">2</Badge>
            </TabsTrigger>
            <TabsTrigger value="focus-documents">Focus Records</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <SlidersHorizontal className="size-3.5" />
                  <span>View Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
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
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

           
          </div>
        </div>

        {/* Filtering and Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/20 p-3 rounded-xl border">
          <div className="flex flex-1 items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search header, client, reviewer..."
                value={(table.getColumn("header")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("header")?.setFilterValue(event.target.value)
                }
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>

            {/* Type Facet Filter */}
            {uniqueTypes.length > 0 && (
              <Select
                value={(table.getColumn("type")?.getFilterValue() as string) ?? "all"}
                onValueChange={(val) => {
                  table.getColumn("type")?.setFilterValue(val === "all" ? "" : val)
                }}
              >
                <SelectTrigger className="h-8 w-36 text-xs bg-background">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Facet Filter */}
            {uniqueStatuses.length > 0 && (
              <Select
                value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                onValueChange={(val) => {
                  table.getColumn("status")?.setFilterValue(val === "all" ? "" : val)
                }}
              >
                <SelectTrigger className="h-8 w-36 text-xs bg-background">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Reset Filters Button */}
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

          <div className="text-xs text-muted-foreground self-center">
            {table.getFilteredRowModel().rows.length} total item(s)
          </div>
        </div>
      </div>

      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 mt-0"
      >
        {/* Table Container */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted/60 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan} className="py-3 px-3">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm font-medium">No results found.</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Complete Shadcn Radix Pagination */}
        <div className="flex items-center justify-between flex-wrap gap-4 py-2 px-1">
          {/* Selected count info */}
          <div className="text-xs text-muted-foreground min-w-[180px]">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>

          <div className="flex items-center gap-6 lg:gap-8 ml-auto">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-[72px] h-8 text-xs bg-background" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[5, 10, 20, 30, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Page number info */}
            <div className="flex items-center justify-center text-xs font-medium whitespace-nowrap">
              Page {table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>

            {/* Navigation buttons: First, Prev, Next, Last */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                title="Go to first page"
              >
                <ChevronsLeft className="size-4" />
                <span className="sr-only">Go to first page</span>
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Go to previous page"
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Go to previous page</span>
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Go to next page"
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Go to next page</span>
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                title="Go to last page"
              >
                <ChevronsRight className="size-4" />
                <span className="sr-only">Go to last page</span>
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-xl border border-dashed flex items-center justify-center text-muted-foreground text-sm">
          Past Performance analytics and overview records
        </div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-xl border border-dashed flex items-center justify-center text-muted-foreground text-sm">
          Personnel profiles & management allocation
        </div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-xl border border-dashed flex items-center justify-center text-muted-foreground text-sm">
          Focus documents and pinned financial records
        </div>
      </TabsContent>
    </Tabs>
  )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Invoices",
    color: "var(--primary)",
  },
  mobile: {
    label: "Quotations",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground font-medium hover:text-primary transition-colors text-sm">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-md">
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>
            Document details and visual performance overview
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.4}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.3}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex items-center gap-2 leading-none font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Trending up by 5.2% this period</span>
                  <TrendingUp className="size-4" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Record history for {item.header}. All amounts and status verified.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="header" className="text-xs">Document Title</Label>
              <Input id="header" defaultValue={item.header} className="text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="type" className="text-xs">Type</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full text-sm">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Invoice">Invoice</SelectItem>
                      <SelectItem value="Quotation">Quotation</SelectItem>
                      <SelectItem value="Table of Contents">Table of Contents</SelectItem>
                      <SelectItem value="Executive Summary">Executive Summary</SelectItem>
                      <SelectItem value="Technical Approach">Technical Approach</SelectItem>
                      <SelectItem value="Capabilities">Capabilities</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full text-sm">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="In Process">In Process</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="PAID">PAID</SelectItem>
                      <SelectItem value="ACCEPTED">ACCEPTED</SelectItem>
                      <SelectItem value="DRAFT">DRAFT</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="target" className="text-xs">Target / Total</Label>
                <Input id="target" defaultValue={item.target} className="text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="limit" className="text-xs">Due Date</Label>
                <Input id="limit" defaultValue={item.limit} className="text-sm" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reviewer" className="text-xs">Client / Reviewer</Label>
              <Input id="reviewer" defaultValue={item.reviewer} className="text-sm" />
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={() => toast.success("Saved document metadata")}>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
