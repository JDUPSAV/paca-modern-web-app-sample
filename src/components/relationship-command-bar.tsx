import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  IconFileDownload,
  IconPlus,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react"

type ActionCommandBarProps = {
  hasSelection: boolean
  selectionCount: number
  onAdd: () => void
  onExportAll: () => void
  onExportSelected: () => void
  onAssignSelected: () => void
  onDeleteSelected: () => void
  onClearSelection: () => void
}

export function ActionCommandBar({
  hasSelection,
  selectionCount,
  onAdd,
  onExportAll,
  onExportSelected,
  onAssignSelected,
  onDeleteSelected,
  onClearSelection,
}: ActionCommandBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {hasSelection ? (
          <>
            <Button size="sm" onClick={onAssignSelected} className="gap-2">
              <IconUser className="size-4" /> Assign owner
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportSelected}
              className="gap-2"
            >
              <IconFileDownload className="size-4" /> Export selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
              className="gap-2"
            >
              <IconTrash className="size-4" /> Delete selected
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={onAdd} className="gap-2">
              <IconPlus className="size-4" /> Add new
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportAll}
              className="gap-2"
            >
              <IconFileDownload className="size-4" /> Export to PDF
            </Button>
          </>
        )}
      </div>
      {hasSelection ? (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectionCount} selected</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="gap-1"
          >
            <IconX className="size-4" /> Clear selection
          </Button>
        </div>
      ) : null}
    </div>
  )
}
