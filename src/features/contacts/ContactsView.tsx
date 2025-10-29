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

export type StrategicActionRecord = z.infer<typeof tableSchema> & {
  company: string
  role: string
  email: string
  phone: string
  stage: string
  lastActivity: string
  nextStep: string
  interestLevel: string
  notes: string
  timezone?: string
  linkedinProfile?: string
  preferredContactMethod?: string
  meetingCadence?: string
  lifecycleStage?: string
}

type ContactsViewProps = {
  records: StrategicActionRecord[]
  onCreate: (record: StrategicActionRecord) => void
  onUpdate: (record: StrategicActionRecord) => void
  onDelete: (recordId: number) => void
}

const sources = ["Municipal", "Provincial", "Federal", "Community", "Internal"]
const contactStatuses = ["New", "Contacted", "Qualified", "Nurture"]
const contactStages = ["Discovery", "Evaluation", "Proposal", "Decision"]
const interestLevels = ["High", "Medium", "Low"]
const contactMethods = ["Email", "Phone", "Teams", "In-person"]
const lifecycleStages = ["Proposed", "Planning", "Implementation", "Complete", "Review"]

type ContactFormState = {
  header: string
  type: string
  status: string
  target: string
  limit: string
  reviewer: string
  company: string
  role: string
  email: string
  phone: string
  stage: string
  lastActivity: string
  nextStep: string
  interestLevel: string
  notes: string
  timezone: string
  linkedinProfile: string
  preferredContactMethod: string
  meetingCadence: string
  lifecycleStage: string
}

function createContactFormState(): ContactFormState {
  return {
    header: "",
    type: sources[0],
    status: contactStatuses[0],
    target: "0",
    limit: "0",
    reviewer: "Unassigned",
    company: "",
    role: "",
    email: "",
    phone: "",
    stage: contactStages[0],
    lastActivity: "",
    nextStep: "",
    interestLevel: interestLevels[0],
    notes: "",
    timezone: "",
    linkedinProfile: "",
    preferredContactMethod: contactMethods[0],
    meetingCadence: "Weekly",
    lifecycleStage: lifecycleStages[0],
  }
}

export function ContactsView({ records, onCreate, onUpdate, onDelete }: ContactsViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formState, setFormState] = useState<ContactFormState>(createContactFormState)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([])
  const [selectionResetKey, setSelectionResetKey] = useState(0)

  const activeContacts = useMemo(
    () => records.filter((contact) => contact.status !== "Nurture"),
    [records]
  )

  const inactiveContacts = useMemo(
    () => records.filter((contact) => contact.status === "Nurture"),
    [records]
  )

  const viewConfigs = useMemo<DataTableView[]>(
    () => [
      {
        id: "contacts-active",
        label: "Active Actions",
        badge: activeContacts.length,
        filter: ((record: StrategicActionRecord) => record.status !== "Nurture") as DataTableView["filter"],
      },
      {
        id: "contacts-inactive",
        label: "Completed Actions",
        badge: inactiveContacts.length,
        filter: ((record: StrategicActionRecord) => record.status === "Nurture") as DataTableView["filter"],
      },
    ],
    [activeContacts.length, inactiveContacts.length]
  )

  function resetFormState() {
    setFormState(createContactFormState())
    setDialogMode("create")
    setEditingRecordId(null)
  }

  function openCreateDialog() {
    resetFormState()
    setIsDialogOpen(true)
  }

  function openEditDialog(record: StrategicActionRecord) {
    setDialogMode("edit")
    setEditingRecordId(record.id)
    setFormState({
      header: record.header,
      type: record.type,
      status: record.status,
      target: record.target,
      limit: record.limit,
      reviewer: record.reviewer,
      company: record.company,
      role: record.role,
      email: record.email,
      phone: record.phone,
      stage: record.stage,
      lastActivity: record.lastActivity,
      nextStep: record.nextStep,
      interestLevel: record.interestLevel,
      notes: record.notes,
      timezone: record.timezone ?? "",
      linkedinProfile: record.linkedinProfile ?? "",
      preferredContactMethod: record.preferredContactMethod ?? contactMethods[0],
      meetingCadence: record.meetingCadence ?? "Weekly",
      lifecycleStage: record.lifecycleStage ?? lifecycleStages[0],
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

    const nextRecord: StrategicActionRecord = {
      id: recordId,
      header: formState.header,
      type: formState.type,
      status: formState.status,
      target: formState.target,
      limit: formState.limit,
      reviewer: formState.reviewer,
      company: formState.company,
      role: formState.role,
      email: formState.email,
      phone: formState.phone,
      stage: formState.stage,
      lastActivity: formState.lastActivity,
      nextStep: formState.nextStep,
      interestLevel: formState.interestLevel,
      notes: formState.notes,
      timezone: formState.timezone,
      linkedinProfile: formState.linkedinProfile,
      preferredContactMethod: formState.preferredContactMethod,
      meetingCadence: formState.meetingCadence,
      lifecycleStage: formState.lifecycleStage,
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
  const submitLabel = isEditing ? "Save Changes" : "Save Contact"
  const modalTitle = isEditing ? "Edit contact" : "Create contact"
  const modalDescription = isEditing
    ? "Update the relationship record for this contact."
    : "Add a new relationship record to the workspace."

  const selectedContacts = useMemo(
    () =>
      selectedContactIds
        .map((id) => records.find((record) => record.id === id) || null)
        .filter((record): record is StrategicActionRecord => record !== null),
    [selectedContactIds, records]
  )

  const hasSelection = selectedContacts.length > 0
  const primarySelection = selectedContacts[0]

  function handleSelectionChange(selectedIds: number[]) {
    setSelectedContactIds(selectedIds)
  }

  function clearSelection() {
    setSelectionResetKey((key) => key + 1)
    setSelectedContactIds([])
  }

  function handleAssignSelected() {
    if (primarySelection) {
      openEditDialog(primarySelection)
    }
  }

  function handleBulkDelete() {
    if (!selectedContacts.length) return
    const ids = selectedContacts.map((record) => record.id)
    const removedEditing = dialogMode === "edit" && editingRecordId !== null && ids.includes(editingRecordId)

    ids.forEach((id) => onDelete(id))

    if (removedEditing) {
      setIsDialogOpen(false)
      resetFormState()
    }

    clearSelection()
    toast.success("Selected contacts deleted")
  }

  function handleExportAllContacts() {
    toast.success(`Exported ${records.length} contact${records.length === 1 ? "" : "s"} to PDF`)
  }

  function handleExportSelectedContacts() {
    if (!selectedContacts.length) {
      toast.error("Select at least one contact to export")
      return
    }
    toast.success(`Exported ${selectedContacts.length} contact${selectedContacts.length === 1 ? "" : "s"} to PDF`)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <ActionCommandBar
          hasSelection={hasSelection}
          selectionCount={selectedContacts.length}
          onAdd={openCreateDialog}
          onExportAll={handleExportAllContacts}
          onExportSelected={handleExportSelectedContacts}
          onAssignSelected={handleAssignSelected}
          onDeleteSelected={handleBulkDelete}
          onClearSelection={clearSelection}
        />
      </div>
      <div className="px-4 lg:px-6">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Contact insights</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Track pipeline momentum, follow-ups, and ownership for active
            contacts.
          </CardContent>
        </Card>
      </div>
      <DataTable
        data={records}
        addLabel="Add Contact"
        outlineLabel="All Contacts"
        views={viewConfigs}
        detailTitle={(item) => item.header}
        detailDescription={(item) =>
          `Interest level ${records.find((record) => record.id === item.id)?.interestLevel ?? "—"}`
        }
        renderDetail={(item) => {
          const record = records.find((entry) => entry.id === item.id)
          if (!record) return null
          return <ContactDetail record={record} />
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
            <Button type="submit" form="create-contact-form">
              {submitLabel}
            </Button>
          </>
        }
      >
        <form
          id="create-contact-form"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label htmlFor="contact-name">Contact name</Label>
            <Input
              id="contact-name"
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
            <Label htmlFor="contact-company">Company</Label>
            <Input
              id="contact-company"
              value={formState.company}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  company: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-role">Role</Label>
            <Input
              id="contact-role"
              value={formState.role}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  role: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-owner">Owner</Label>
            <Input
              id="contact-owner"
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
            <Label htmlFor="contact-source">Source</Label>
            <Select
              value={formState.type}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, type: value }))
              }
            >
              <SelectTrigger id="contact-source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-status">Status</Label>
            <Select
              value={formState.status}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, status: value }))
              }
            >
              <SelectTrigger id="contact-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {contactStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-stage">Stage</Label>
            <Select
              value={formState.stage}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, stage: value }))
              }
            >
              <SelectTrigger id="contact-stage">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {contactStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-interest">Interest level</Label>
            <Select
              value={formState.interestLevel}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, interestLevel: value }))
              }
            >
              <SelectTrigger id="contact-interest">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {interestLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-target">Target value</Label>
            <Input
              id="contact-target"
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
            <Label htmlFor="contact-limit">Confidence</Label>
            <Input
              id="contact-limit"
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
            <Label htmlFor="contact-cadence">Meeting cadence</Label>
            <Input
              id="contact-cadence"
              value={formState.meetingCadence}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  meetingCadence: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-timezone">Time zone</Label>
            <Input
              id="contact-timezone"
              value={formState.timezone}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  timezone: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  email: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={formState.phone}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  phone: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-last-activity">Last activity</Label>
            <Input
              id="contact-last-activity"
              type="date"
              value={formState.lastActivity}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  lastActivity: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-lifecycle">Lifecycle stage</Label>
            <Select
              value={formState.lifecycleStage}
              onValueChange={(value) =>
                setFormState((state) => ({ ...state, lifecycleStage: value }))
              }
            >
              <SelectTrigger id="contact-lifecycle">
                <SelectValue placeholder="Select lifecycle stage" />
              </SelectTrigger>
              <SelectContent>
                {lifecycleStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-method">Preferred contact</Label>
            <Select
              value={formState.preferredContactMethod}
              onValueChange={(value) =>
                setFormState((state) => ({
                  ...state,
                  preferredContactMethod: value,
                }))
              }
            >
              <SelectTrigger id="contact-method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {contactMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-2">
            <Label htmlFor="contact-next-step">Next step</Label>
            <Input
              id="contact-next-step"
              value={formState.nextStep}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  nextStep: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label htmlFor="contact-linkedin">LinkedIn profile</Label>
            <Input
              id="contact-linkedin"
              value={formState.linkedinProfile}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  linkedinProfile: event.target.value,
                }))
              }
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label htmlFor="contact-notes">Notes</Label>
            <textarea
              id="contact-notes"
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

type ContactDetailProps = {
  record: StrategicActionRecord
}

function ContactDetail({ record }: ContactDetailProps) {
  return (
    <div className="grid gap-4 text-sm">
      <div className="grid gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Contact information
        </span>
        <div className="grid gap-2 @lg/main:grid-cols-2">
          <DetailField label="Company" value={record.company} />
          <DetailField label="Role" value={record.role} />
          <DetailField label="Email" value={record.email} />
          <DetailField label="Phone" value={record.phone} />
          <DetailField label="Time zone" value={record.timezone || "—"} />
          <DetailField
            label="Preferred contact"
            value={record.preferredContactMethod || "—"}
          />
        </div>
      </div>
      <div className="grid gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Engagement
        </span>
        <div className="grid gap-2 @lg/main:grid-cols-2">
          <DetailField label="Stage" value={record.stage} />
          <DetailField label="Status" value={record.status} />
          <DetailField label="Interest" value={record.interestLevel} />
          <DetailField label="Owner" value={record.reviewer} />
          <DetailField
            label="Lifecycle stage"
            value={record.lifecycleStage || "—"}
          />
          <DetailField
            label="Meeting cadence"
            value={record.meetingCadence || "—"}
          />
        </div>
      </div>
      <div className="grid gap-2 @lg/main:grid-cols-2">
        <DetailField label="Last activity" value={record.lastActivity || "—"} />
        <DetailField label="Next step" value={record.nextStep || "—"} />
      </div>
      {record.linkedinProfile ? (
        <DetailField label="LinkedIn" value={record.linkedinProfile} />
      ) : null}
      <DetailField label="Notes" value={record.notes || "No notes captured."} multiline />
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
