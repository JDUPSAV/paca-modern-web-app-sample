import * as React from "react";
import type { ReactNode } from "react";
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
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconFilter,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/ui/modal";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

type DetailContextValue = {
  getTitle?: (item: z.infer<typeof schema>) => string;
  getDescription?: (item: z.infer<typeof schema>) => string;
  renderDetail?: (item: z.infer<typeof schema>) => ReactNode;
  openDetail?: (item: z.infer<typeof schema>) => void;
};

const DetailContext = React.createContext<DetailContextValue>({});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
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
    header: "Header",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Section Type",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "Done" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconLoader />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right">Target</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right">Limit</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          Limit
        </Label>
        <Input
          className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== "Assign reviewer";

      if (isAssigned) {
        return row.original.reviewer;
      }

      return (
        <>
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            Reviewer
          </Label>
          <Select>
            <SelectTrigger
              className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              id={`${row.original.id}-reviewer`}
            >
              <SelectValue placeholder="Assign reviewer" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="J. Duplessis-Savard">J. Duplessis-Savard</SelectItem>
              <SelectItem value="Jamik Tashpulatov">
                Jamik Tashpulatov
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export type DataTableView = {
  id: string;
  label: string;
  badge?: string | number;
  content?: ReactNode;
  filter?: (item: z.infer<typeof schema>) => boolean;
};

type DataTableProps = {
  data: z.infer<typeof schema>[];
  addLabel?: string;
  onAdd?: () => void;
  views?: DataTableView[];
  outlineLabel?: string;
  detailTitle?: (item: z.infer<typeof schema>) => string;
  detailDescription?: (item: z.infer<typeof schema>) => string;
  renderDetail?: (item: z.infer<typeof schema>) => ReactNode;
  onRowOpen?: (item: z.infer<typeof schema>) => void;
  onSelectionChange?: (selectedIds: number[]) => void;
  clearSelectionSignal?: number;
};

export function DataTable({
  data: initialData,
  addLabel = "Add Section",
  onAdd,
  views = [],
  outlineLabel = "Outline",
  detailTitle,
  detailDescription,
  renderDetail,
  onRowOpen,
  onSelectionChange,
  clearSelectionSignal,
}: DataTableProps) {
  const [data, setData] = React.useState(() => initialData);
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const clearSelectionRef = React.useRef<number | undefined>(undefined);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = React.useState(false);

  const availableStatuses = React.useMemo(() => {
    const distinct = new Set<string>();
    initialData.forEach((item) => {
      if (item.status) {
        distinct.add(item.status);
      }
    });
    return Array.from(distinct).sort((a, b) => a.localeCompare(b));
  }, [initialData]);

  React.useEffect(() => {
    if (typeof onSelectionChange === "function") {
      const selectedIds = Object.entries(rowSelection)
        .filter(([, value]) => value)
        .map(([key]) => Number(key));
      onSelectionChange(selectedIds);
    }
  }, [rowSelection, onSelectionChange]);

  React.useEffect(() => {
    if (typeof clearSelectionSignal === "number") {
      if (clearSelectionRef.current !== clearSelectionSignal) {
        clearSelectionRef.current = clearSelectionSignal;
        setRowSelection({});
      }
    }
  }, [clearSelectionSignal]);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const secondaryViews = React.useMemo(() => views, [views]);
  const displayViews = React.useMemo(
    () => [
      { id: "outline", label: outlineLabel } as {
        id: string;
        label: string;
        badge?: string | number;
      },
      ...secondaryViews.map((view) => ({
        id: view.id,
        label: view.label,
        badge: view.badge,
      })),
    ],
    [outlineLabel, secondaryViews]
  );
  const [activeView, setActiveView] = React.useState(
    displayViews[0]?.id ?? "outline"
  );

  const activeViewConfig = React.useMemo(
    () => secondaryViews.find((view) => view.id === activeView),
    [secondaryViews, activeView]
  );

  const displayData = React.useMemo(() => {
    if (activeView === "outline") {
      return data;
    }

    if (activeViewConfig?.filter) {
      return data.filter(activeViewConfig.filter);
    }

    return data;
  }, [data, activeView, activeViewConfig]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => displayData?.map(({ id }) => id) || [],
    [displayData]
  );

  React.useEffect(() => {
    const ids = displayViews.map((view) => view.id);
    if (!ids.includes(activeView)) {
      setActiveView(displayViews[0]?.id ?? "outline");
    }
  }, [displayViews, activeView]);

  const table = useReactTable({
    data: displayData,
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
  });

  const statusColumn = table.getColumn("status");
  const statusFilterValue = (statusColumn?.getFilterValue() as string | undefined) ?? "";
  const [draftStatusFilter, setDraftStatusFilter] = React.useState<string>(statusFilterValue);
  React.useEffect(() => {
    if (isFilterDialogOpen) {
      setDraftStatusFilter(statusFilterValue);
    }
  }, [isFilterDialogOpen, statusFilterValue]);
  const hasActiveFilters = Boolean(statusFilterValue);
  const statusOptions = React.useMemo(
    () => [
      { label: "All statuses", value: "" },
      ...availableStatuses.map((status) => ({ label: status, value: status })),
    ],
    [availableStatuses]
  );

  const hideableColumns = React.useMemo(
    () =>
      table
        .getAllLeafColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide()
        ),
    [table]
  );
  const hasHiddenColumns = hideableColumns.some((column) => !column.getIsVisible());

  const handleApplyFilters = () => {
    if (!statusColumn) {
      setIsFilterDialogOpen(false);
      return;
    }
    statusColumn.setFilterValue(draftStatusFilter === "" ? undefined : draftStatusFilter);
    setIsFilterDialogOpen(false);
  };

  const handleClearFilters = () => {
    if (statusColumn) {
      statusColumn.setFilterValue(undefined);
    }
    setDraftStatusFilter("");
    setIsFilterDialogOpen(false);
  };

  const handleResetColumns = () => {
    hideableColumns.forEach((column) => {
      if (!column.getIsVisible()) {
        column.toggleVisibility(true);
      }
    });
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) {
      return;
    }

    setData((data) => {
      const activeId = Number(active.id);
      const overId = Number(over.id);
      const oldIndex = data.findIndex((item) => item.id === activeId);
      const newIndex = data.findIndex((item) => item.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return data;
      }

      return arrayMove(data, oldIndex, newIndex);
    });
  }

  const renderTablePane = () => (
    <>
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
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
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <DetailContext.Provider
      value={{
        getTitle: detailTitle,
        getDescription: detailDescription,
        renderDetail,
        openDetail: onRowOpen,
      }}
    >
      <Tabs
        value={activeView}
        onValueChange={setActiveView}
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <Select value={activeView} onValueChange={setActiveView}>
            <SelectTrigger
              className="flex w-fit @4xl/main:hidden"
              size="sm"
              id="view-selector"
            >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              {displayViews.map((view) => (
                <SelectItem key={view.id} value={view.id}>
                  {view.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            {displayViews.map((view) => (
              <TabsTrigger key={view.id} value={view.id}>
                {view.label}
                {view.badge ? (
                  <Badge variant="secondary">{view.badge}</Badge>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <IconFilter className="size-4" />
              Filters
              {hasActiveFilters ? (
                <Badge variant="secondary" className="ml-1">
                  1
                </Badge>
              ) : null}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsColumnDialogOpen(true)}
            >
              <IconLayoutColumns />
              <span className="hidden lg:inline">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
              <IconChevronDown />
            </Button>
            {onAdd ? (
              <Button variant="outline" size="sm" onClick={onAdd}>
                <IconPlus />
                <span className="hidden lg:inline">{addLabel}</span>
                <span className="lg:hidden">Add</span>
              </Button>
            ) : null}
          </div>
        </div>
        <TabsContent
          value="outline"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          {renderTablePane()}
        </TabsContent>
        {secondaryViews.map((view) => (
          <TabsContent
            key={view.id}
            value={view.id}
            className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
          >
            {view.content ?? renderTablePane()}
          </TabsContent>
        ))}
      </Tabs>
      <Modal
        open={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        title="Filters"
        description="Refine the current view by status."
        className="max-w-sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              Clear
            </Button>
            <Button onClick={handleApplyFilters}>Apply</Button>
          </>
        }
      >
        <div className="grid gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value || "all"}
              type="button"
              variant={draftStatusFilter === option.value ? "secondary" : "ghost"}
              className="justify-start"
              onClick={() => setDraftStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Modal>
      <Modal
        open={isColumnDialogOpen}
        onClose={() => setIsColumnDialogOpen(false)}
        title="Customize columns"
        description="Show or hide columns for this table."
        className="max-w-md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleResetColumns}
              disabled={!hasHiddenColumns}
            >
              Reset columns
            </Button>
            <Button onClick={() => setIsColumnDialogOpen(false)}>Done</Button>
          </>
        }
      >
        <div className="grid gap-3">
          {hideableColumns.map((column) => (
            <label
              key={column.id}
              className="flex items-center gap-3 text-sm capitalize"
            >
              <Checkbox
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              />
              <span>{column.id.replace(/_/g, " ")}</span>
            </label>
          ))}
        </div>
      </Modal>
    </DetailContext.Provider>
  );
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();
  const { getTitle, getDescription, renderDetail, openDetail } =
    React.useContext(DetailContext);

  const title = getTitle ? getTitle(item) : item.header;
  const description = getDescription
    ? getDescription(item)
    : "Review the latest status and owners for this entry.";

  if (openDetail) {
    return (
      <Button
        variant="link"
        className="text-foreground w-fit px-0 text-left"
        onClick={() => openDetail(item)}
      >
        {title}
      </Button>
    );
  }

  const defaultContent = (
    <div className="grid gap-4 text-sm">
      <div className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Section type
        </span>
        <span className="font-medium">{item.type}</span>
      </div>
      <div className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Status
        </span>
        <span>{item.status}</span>
      </div>
      <div className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Target / limit
        </span>
        <span>
          {item.target} / {item.limit}
        </span>
      </div>
      <div className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Reviewer
        </span>
        <span>{item.reviewer}</span>
      </div>
    </div>
  );

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm">
          {renderDetail ? renderDetail(item) : defaultContent}
        </div>
        {!renderDetail ? (
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
