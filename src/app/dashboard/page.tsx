import { useMemo, useState, type CSSProperties } from "react"
import { z } from "zod"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { schema as tableSchema } from "@/components/data-table"
import { AccountsView } from "@/features/accounts"
import type { ActionPlanRecord } from "@/features/accounts/AccountsView"
import { ContactsView } from "@/features/contacts"
import type { StrategicActionRecord } from "@/features/contacts/ContactsView"
import { DashboardView } from "@/features/dashboard"
import { ReportsView } from "@/features/reports"
import dashboardRecordsJson from "@/features/dashboard/records.json"
import accountRecordsJson from "@/features/accounts/records.json"
import contactRecordsJson from "@/features/contacts/records.json"
import reportsRecordsJson from "@/features/reports/records.json"

const providerStyle = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as CSSProperties

type SectionKey = "dashboard" | "accounts" | "contacts" | "reports"
type TableRecord = z.infer<typeof tableSchema>

const dashboardRecords = dashboardRecordsJson as TableRecord[]
const reportsRecords = reportsRecordsJson as {
  id: string
  title: string
  owner: string
  lastUpdated: string
  status: string
  summary: string
}[]

const SECTION_META: Record<SectionKey, { title: string; description: string }> = {
  dashboard: {
    title: "Workspace Overview",
    description: "Track demand, performance, and current work at a glance.",
  },
  accounts: {
    title: "Accounts",
    description: "Manage key customer relationships and review owner assignments.",
  },
  contacts: {
    title: "Contacts",
    description: "Keep an eye on inbound and outbound opportunities ready for follow-up.",
  },
  reports: {
    title: "Knowledge Base",
    description: "Browse curated articles, playbooks, and insight reports for your team.",
  },
}

const SEARCH_SUGGESTIONS: {
  label: string
  description: string
  query: string
}[] = [
  {
    label: "Accounts: Upcoming renewals",
    description: "Find accounts with renewal plans or executive sponsors",
    query: "renewal",
  },
  {
    label: "Contacts: High interest",
    description: "Locate contacts marked as high interest or active",
    query: "high",
  },
  {
    label: "Accounts: Escalation owners",
    description: "Jump to accounts with escalation contacts assigned",
    query: "escalation",
  },
  {
    label: "Contacts: LinkedIn profiles",
    description: "Surface contacts that include a LinkedIn link",
    query: "linkedin",
  },
]

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard")
  const [accountRecords, setAccountRecords] = useState<ActionPlanRecord[]>(
    () => accountRecordsJson as ActionPlanRecord[]
  )
  const [contactRecords, setContactRecords] = useState<StrategicActionRecord[]>(
    () => contactRecordsJson as StrategicActionRecord[]
  )
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const sidebarActiveItem: "dashboard" | "accounts" | "contacts" =
    activeSection === "reports" ? "dashboard" : activeSection

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return []
    }

    const dashboardHits = dashboardRecords
      .filter(
        (record) =>
          record.header.toLowerCase().includes(query) ||
          record.reviewer.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map((record) => ({
        section: "Dashboard",
        sectionKey: "dashboard" as SectionKey,
        title: record.header,
        subtitle: `Owner: ${record.reviewer}`,
      }))

    const accountHits = accountRecords
      .filter((record) => {
        const fields = [
          record.header,
          record.reviewer,
          record.industry,
          record.region,
          record.executiveSponsor,
          record.escalationContact,
          record.ownerEmail,
          record.annualContractValue,
        ]
          .filter(Boolean)
          .map((value) => value!.toLowerCase())

        return fields.some((field) => field.includes(query))
      })
      .slice(0, 5)
      .map((record) => ({
        section: "Accounts",
        sectionKey: "accounts" as SectionKey,
        title: record.header,
        subtitle: [record.industry, record.reviewer].filter(Boolean).join(" • "),
      }))

    const contactHits = contactRecords
      .filter((record) => {
        const fields = [
          record.header,
          record.company,
          record.role,
          record.reviewer,
          record.email,
          record.phone,
          record.interestLevel,
          record.preferredContactMethod,
          record.lifecycleStage,
        ]
          .filter(Boolean)
          .map((value) => value!.toLowerCase())

        return fields.some((field) => field.includes(query))
      })
      .slice(0, 5)
      .map((record) => ({
        section: "Contacts",
        sectionKey: "contacts" as SectionKey,
        title: record.header,
        subtitle: [record.company, record.reviewer].filter(Boolean).join(" • "),
      }))

    const reportHits = reportsRecords
      .filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.owner.toLowerCase().includes(query)
      )
      .map((report) => ({
        section: "Reports",
        sectionKey: "reports" as SectionKey,
        title: report.title,
        subtitle: `Owner: ${report.owner}`,
      }))

    return [...dashboardHits, ...accountHits, ...contactHits, ...reportHits]
  }, [searchQuery, accountRecords, contactRecords])

  const handleAccountCreate = (record: ActionPlanRecord) => {
    setAccountRecords((prev) => [record, ...prev])
  }

  const handleAccountUpdate = (record: ActionPlanRecord) => {
    setAccountRecords((prev) =>
      prev.map((entry) => (entry.id === record.id ? record : entry))
    )
  }

  const handleAccountDelete = (recordId: number) => {
    setAccountRecords((prev) => prev.filter((entry) => entry.id !== recordId))
  }

  const handleContactCreate = (record: StrategicActionRecord) => {
    setContactRecords((prev) => [record, ...prev])
  }

  const handleContactUpdate = (record: StrategicActionRecord) => {
    setContactRecords((prev) =>
      prev.map((entry) => (entry.id === record.id ? record : entry))
    )
  }

  const handleContactDelete = (recordId: number) => {
    setContactRecords((prev) => prev.filter((entry) => entry.id !== recordId))
  }

  let content: JSX.Element
  switch (activeSection) {
    case "accounts":
      content = (
        <AccountsView
          records={accountRecords}
          onCreate={handleAccountCreate}
          onUpdate={handleAccountUpdate}
          onDelete={handleAccountDelete}
        />
      )
      break
    case "contacts":
      content = (
        <ContactsView
          records={contactRecords}
          onCreate={handleContactCreate}
          onUpdate={handleContactUpdate}
          onDelete={handleContactDelete}
        />
      )
      break
    case "reports":
      content = <ReportsView />
      break
    case "dashboard":
    default:
      content = (
        <DashboardView accounts={accountRecords} contacts={contactRecords} />
      )
      break
  }

  return (
    <SidebarProvider style={providerStyle}>
      <AppSidebar
        variant="inset"
        activeItem={sidebarActiveItem}
        activeDocument={activeSection === "reports" ? "reports" : undefined}
        onSectionSelect={(key) => setActiveSection(key as SectionKey)}
        onDocumentSelect={(key) => setActiveSection(key as SectionKey)}
        onSearch={() => setIsSearchOpen(true)}
      />
      <SidebarInset>
        <SiteHeader
          title={SECTION_META[activeSection].title}
          description={SECTION_META[activeSection].description}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {content}
          </div>
        </div>
      </SidebarInset>
      <Modal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Search workspace"
        description="Search across dashboard entries, accounts, and contacts."
        className="max-w-4xl"
        footer={
          <Button variant="outline" onClick={() => setIsSearchOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="grid gap-4">
          <Input
            autoFocus
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by title, owner, company, or status"
          />
          {searchQuery.trim().length === 0 ? (
            <div className="grid gap-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Quick suggestions
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {SEARCH_SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion.query}
                    variant="outline"
                    className="h-auto items-start justify-start gap-2 text-left whitespace-normal break-words"
                    onClick={() => setSearchQuery(suggestion.query)}
                  >
                    <span className="text-sm font-medium">
                      {suggestion.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-2">
            {searchResults.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No results found. Try a different keyword or use a suggestion above.
              </p>
            ) : (
              searchResults.map((result) => (
                <Button
                  key={`${result.sectionKey}-${result.title}`}
                  variant="ghost"
                  className="h-auto items-start justify-start gap-1 text-left whitespace-normal break-words"
                  onClick={() => {
                    setActiveSection(result.sectionKey)
                    setIsSearchOpen(false)
                  }}
                >
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {result.section}
                  </span>
                  <span className="block text-sm font-semibold">
                    {result.title}
                  </span>
                  {result.subtitle ? (
                    <span className="block text-xs text-muted-foreground">
                      {result.subtitle}
                    </span>
                  ) : null}
                </Button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </SidebarProvider>
  )
}
