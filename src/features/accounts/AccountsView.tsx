import { useMemo, useState } from "react"
import { z } from "zod"

import { DataTable, schema as tableSchema, type DataTableView } from "@/components/data-table"
import { ActionCommandBar } from "@/components/relationship-command-bar"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export type ActionPlanRecord = z.infer<typeof tableSchema> & {
  industry: string
  region: string
  stage: string
  priority: string
  ownerEmail: string
  nextMeeting: string
  lastInteraction: string
  summary: string
  notes: string
  annualContractValue?: string
  renewalDate?: string
  executiveSponsor?: string
  escalationContact?: string
  successPlanLink?: string
  riskLevel?: string
}

type AccountsViewProps = {
  records: ActionPlanRecord[]
  onCreate: (record: ActionPlanRecord) => void
  onUpdate: (record: ActionPlanRecord) => void
  onDelete: (recordId: number) => void
}

const accountTypes = ["Enterprise", "Mid-Market", "SMB", "Education", "Financial", "Logistics", "Insurance"]
const accountStatuses = ["Active", "In Process", "Pending", "Closed"]
const accountStages = ["Qualification", "Solutioning", "Proposal", "Adoption", "Expansion", "Optimization"]
const accountPriorities = ["High", "Medium", "Low"]
const riskLevels = ["Low", "Medium", "High", "Critical"]

type AccountFormState = {
  header: string
  type: string
  status: string
  target: string
  limit: string
  reviewer: string
  industry: string
  region: string
  stage: string
  priority: string
  ownerEmail: string
  nextMeeting: string
  lastInteraction: string
  summary: string
  notes: string
  annualContractValue: string
  renewalDate: string
  executiveSponsor: string
  escalationContact: string
  successPlanLink: string
  riskLevel: string
}

function createAccountFormState(): AccountFormState {
  return {
    header: "",
    type: accountTypes[0],
    status: accountStatuses[0],
    target: "0",
    limit: "0",
    reviewer: "Unassigned",
    industry: "",
    region: "",
    stage: accountStages[0],
    priority: accountPriorities[0],
    ownerEmail: "",
    nextMeeting: "",
    lastInteraction: "",
    summary: "",
    notes: "",
    annualContractValue: "",
    renewalDate: "",
    executiveSponsor: "",
    escalationContact: "",
    successPlanLink: "",
    riskLevel: riskLevels[0],
  }
}

export function AccountsView({ records, onCreate, onUpdate, onDelete }: AccountsViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formState, setFormState] = useState<AccountFormState>(createAccountFormState)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([])
  const [selectionResetKey, setSelectionResetKey] = useState(0)

  const activeAccounts = useMemo(
    () =>
      records.filter(
        (account) => account.status === "Active" || account.status === "In Process"
      ),
    [records]
  )

  const inactiveAccounts = useMemo(
    () =>
      records.filter(
        (account) => account.status === "Pending" || account.status === "Closed"
      ),
    [records]
  )

  const viewConfigs = useMemo<DataTableView[]>(
    () => [
      {
        id: "accounts-active",
        label: "Active Accounts",
        badge: activeAccounts.length,
        filter: ((record: ActionPlanRecord) =>
          record.status === "Active" || record.status === "In Process") as DataTableView["filter"],
      },
      {
        id: "accounts-inactive",
        label: "Inactive Accounts",
        badge: inactiveAccounts.length,
        filter: ((record: ActionPlanRecord) =>
          record.status === "Pending" || record.status === "Closed") as DataTableView["filter"],
      },
    ],
    [activeAccounts.length, inactiveAccounts.length]
  )

  function resetFormState() {
    setFormState(createAccountFormState())
    setDialogMode("create")
    setEditingRecordId(null)
  }

  function openCreateDialog() {
    resetFormState()
    setIsDialogOpen(true)
  }

  function openEditDialog(record: ActionPlanRecord) {
    setDialogMode("edit")
    setEditingRecordId(record.id)
    setFormState({
      header: record.header,
      type: record.type,
      status: record.status,
      target: record.target,
      limit: record.limit,
      reviewer: record.reviewer,
      industry: record.industry,
      region: record.region,
      stage: record.stage,
      priority: record.priority,
      ownerEmail: record.ownerEmail,
      nextMeeting: record.nextMeeting,
      lastInteraction: record.lastInteraction,
      summary: record.summary,
      notes: record.notes,
      annualContractValue: record.annualContractValue ?? "",
      renewalDate: record.renewalDate ?? "",
      executiveSponsor: record.executiveSponsor ?? "",
      escalationContact: record.escalationContact ?? "",
      successPlanLink: record.successPlanLink ?? "",
      riskLevel: record.riskLevel ?? riskLevels[0],
    })
    setIsDialogOpen(true)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const isEditing = dialogMode === "edit" && editingRecordId !== null

    const recordId = isEditing
      ? editingRecordId
      : records.length
          ? Math.max(...records.map((record) => record.id)) + 1
          : 1

    const nextRecord: ActionPlanRecord = {
      id: recordId,
      header: formState.header,
      type: formState.type,
      status: formState.status,
      target: formState.target,
      limit: formState.limit,
      reviewer: formState.reviewer,
      industry: formState.industry,
      region: formState.region,
      stage: formState.stage,
      priority: formState.priority,
      ownerEmail: formState.ownerEmail,
      nextMeeting: formState.nextMeeting,
      lastInteraction: formState.lastInteraction,
      summary: formState.summary,
      notes: formState.notes,
      annualContractValue: formState.annualContractValue,
      renewalDate: formState.renewalDate,
      executiveSponsor: formState.executiveSponsor,
      escalationContact: formState.escalationContact,
      successPlanLink: formState.successPlanLink,
      riskLevel: formState.riskLevel,
    }

    if (isEditing) {
      onUpdate(nextRecord)
    } else {
      onCreate(nextRecord)
    }

    setIsDialogOpen(false)
    resetFormState()
  }

  const isEditing = dialogMode === "edit"
  const submitLabel = isEditing ? "Save Changes" : "Save Account"
  const modalTitle = isEditing ? "Edit account" : "Create account"
  const modalDescription = isEditing
    ? "Update the core details for this strategic action plan."
    : "Create a new strategic action plan."

  const selectedAccounts = useMemo(
    () =>
      selectedAccountIds
        .map((id) => records.find((record) => record.id === id) || null)
        .filter((record): record is ActionPlanRecord => record !== null),
    [selectedAccountIds, records]
  )

  const hasSelection = selectedAccounts.length > 0
  const primarySelection = selectedAccounts[0]

  function handleSelectionChange(selectedIds: number[]) {
    setSelectedAccountIds(selectedIds)
  }

  function clearSelection() {
    setSelectionResetKey((key) => key + 1)
    setSelectedAccountIds([])
  }

  function handleAssignSelected() {
    if (primarySelection) {
      openEditDialog(primarySelection)
    }
  }

  function handleBulkDelete() {
    if (!selectedAccounts.length) return
    const ids = selectedAccounts.map((record) => record.id)
    const removedEditing = dialogMode === "edit" && editingRecordId !== null && ids.includes(editingRecordId)

    ids.forEach((id) => onDelete(id))

    if (removedEditing) {
      setIsDialogOpen(false)
      resetFormState()
    }

    clearSelection()
    toast.success("Selected accounts deleted")
  }

  function handleExportAllAccounts() {
    toast.success(`Exported ${records.length} account${records.length === 1 ? "" : "s"} to PDF`)
  }

  function handleExportSelectedAccounts() {
    if (!selectedAccounts.length) {
      toast.error("Select at least one account to export")
      return
    }
    toast.success(`Exported ${selectedAccounts.length} account${selectedAccounts.length === 1 ? "" : "s"} to PDF`)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <ActionCommandBar
          hasSelection={hasSelection}
          selectionCount={selectedAccounts.length}
          onAdd={openCreateDialog}
          onExportAll={handleExportAllAccounts}
          onExportSelected={handleExportSelectedAccounts}
          onAssignSelected={handleAssignSelected}
          onDeleteSelected={handleBulkDelete}
          onClearSelection={clearSelection}
        />
      </div>
      <div className="px-4 lg:px-6">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Account health</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Monitor key accounts, review owners, and track progress toward
            current targets.
          </CardContent>
        </Card>
      </div>
      <DataTable
        data={records}
        addLabel="Add Account"
        outlineLabel="All Accounts"
        views={viewConfigs}
        detailTitle={(item) => item.header}
        detailDescription={(item) =>
          `Priority ${records.find((record) => record.id === item.id)?.priority ?? "--"}`
        }
        renderDetail={(item) => {
          const record = records.find((entry) => entry.id === item.id)
          if (!record) return null
          return <AccountDetail record={record} />
        }}
        onRowOpen={(item) => {
          const record = records.find((entry) => entry.id === item.id)
          if (record) openEditDialog(record)
        }}
        onSelectionChange={handleSelectionChange}
        clearSelectionSignal={selectionResetKey}
      />
      <Modal
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          resetFormState()
        }}
        title={modalTitle}
        description={modalDescription}
        className="max-w-7xl"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                resetFormState()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-account-form">
              {submitLabel}
            </Button>
          </>
        }
      >
        <form
          id="create-account-form"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label htmlFor="account-name">Account name</Label>
            <Input
              id="account-name"
              required
              value={formState.header}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  header: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-industry">Industry</Label>
            <Input
              id="account-industry"
              value={formState.industry}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  industry: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-region">Region</Label>
            <Input
              id="account-region"
              value={formState.region}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  region: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-executive-sponsor">Executive sponsor</Label>
            <Input
              id="account-executive-sponsor"
              value={formState.executiveSponsor}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  executiveSponsor: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-escalation">Escalation contact</Label>
            <Input
              id="account-escalation"
              value={formState.escalationContact}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  escalationContact: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-type">Type</Label>
            <Select
              value={formState.type}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, type: value }))
              }
            >
              <SelectTrigger id="account-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-stage">Stage</Label>
            <Select
              value={formState.stage}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, stage: value }))
              }
            >
              <SelectTrigger id="account-stage">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {accountStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-priority">Priority</Label>
            <Select
              value={formState.priority}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, priority: value }))
              }
            >
              <SelectTrigger id="account-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {accountPriorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-status">Status</Label>
            <Select
              value={formState.status}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, status: value }))
              }
            >
              <SelectTrigger id="account-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {accountStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-target">Target</Label>
            <Input
              id="account-target"
              type="number"
              min={0}
              value={formState.target}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  target: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-limit">Limit</Label>
            <Input
              id="account-limit"
              type="number"
              min={0}
              value={formState.limit}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  limit: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-acv">Annual contract value</Label>
            <Input
              id="account-acv"
              value={formState.annualContractValue}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  annualContractValue: event.target.value,
                }))
              }
              placeholder="$250,000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-renewal">Renewal date</Label>
            <Input
              id="account-renewal"
              type="date"
              value={formState.renewalDate}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  renewalDate: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-owner">Owner</Label>
            <Input
              id="account-owner"
              value={formState.reviewer}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  reviewer: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-owner-email">Owner email</Label>
            <Input
              id="account-owner-email"
              type="email"
              value={formState.ownerEmail}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  ownerEmail: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-next-meeting">Next meeting</Label>
            <Input
              id="account-next-meeting"
              type="date"
              value={formState.nextMeeting}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  nextMeeting: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-last-interaction">Last interaction</Label>
            <Input
              id="account-last-interaction"
              type="date"
              value={formState.lastInteraction}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  lastInteraction: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-risk">Risk level</Label>
            <Select
              value={formState.riskLevel}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, riskLevel: value }))
              }
            >
              <SelectTrigger id="account-risk">
                <SelectValue placeholder="Select risk" />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.map((risk) => (
                  <SelectItem key={risk} value={risk}>
                    {risk}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="account-success-plan">Success plan link</Label>
            <Input
              id="account-success-plan"
              value={formState.successPlanLink}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  successPlanLink: event.target.value,
                }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-2">
            <Label htmlFor="account-summary">Action Plan Summary</Label>
            <textarea
              id="account-summary"
              className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formState.summary}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  summary: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label htmlFor="account-notes">Notes</Label>
            <textarea
              id="account-notes"
              className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formState.notes}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  notes: event.target.value,
                }))
              }
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

type AccountDetailProps = {
  record: ActionPlanRecord
}

function AccountDetail({ record }: AccountDetailProps) {
  return (
    <div className="grid gap-4 text-sm">
      <div className="grid gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Company overview
        </span>
        <div className="grid gap-2 @lg/main:grid-cols-2">
          <DetailField label="Industry" value={record.industry} />
          <DetailField label="Region" value={record.region} />
          <DetailField label="Stage" value={record.stage} />
          <DetailField label="Priority" value={record.priority} />
          <DetailField label="Target" value={record.target} />
          <DetailField label="Limit" value={record.limit} />
          <DetailField
            label="Annual contract value"
            value={record.annualContractValue || "—"}
          />
          <DetailField
            label="Renewal date"
            value={record.renewalDate || "—"}
          />
        </div>
      </div>
      <div className="grid gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ownership
        </span>
        <div className="grid gap-2 @lg/main:grid-cols-2">
          <DetailField label="Owner" value={record.reviewer} />
          <DetailField label="Owner email" value={record.ownerEmail || "—"} />
          <DetailField label="Next meeting" value={record.nextMeeting || "—"} />
          <DetailField label="Last interaction" value={record.lastInteraction || "—"} />
          <DetailField
            label="Executive sponsor"
            value={record.executiveSponsor || "—"}
          />
          <DetailField
            label="Escalation contact"
            value={record.escalationContact || "—"}
          />
          <DetailField label="Risk level" value={record.riskLevel || "—"} />
          <DetailField
            label="Success plan"
            value={record.successPlanLink || "—"}
          />
        </div>
      </div>
      <DetailField label="Action Plan Summary" value={record.summary || "No summary captured yet."} multiline />
      <DetailField label="Notes" value={record.notes || "No additional notes."} multiline />
    </div>
  )
}

type DetailFieldProps = {
  label: string
  value: string
  multiline?: boolean
}

function DetailField({ label, value, multiline }: DetailFieldProps) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {multiline ? (
        <p className="whitespace-pre-line rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
          {value}
        </p>
      ) : (
        <span className="text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  )
}
