import { useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { IconFileDescription, IconPlus } from "@tabler/icons-react"

type KnowledgeArticle = {
  id: string
  title: string
  owner: string
  status: "Published" | "Draft" | "In Review"
  updated: string
  summary: string
  highlights: string[]
}

type KnowledgeCategory = {
  id: string
  title: string
  description: string
  articles: KnowledgeArticle[]
}

const initialKnowledgeBase: KnowledgeCategory[] = [
  {
    id: "foundations",
    title: "Foundations",
    description: "Orientation guides and rollout checklists to align new teams.",
    articles: [
      {
        id: "executive-briefing",
        title: "Executive briefing overview",
        owner: "Jordan Carter",
        status: "Published",
        updated: "2024-07-06",
        summary:
          "Quarterly alignment briefing outlining roadmap priorities, success metrics, and next checkpoints.",
        highlights: [
          "Objectives: align roadmap, budgets, and shared KPIs for H2",
          "Strategic actions completion rate up 12% QoQ; spotlight projects: Urban Planning & Infrastructure",
          "Action items: finalize rollout plan and executive Q&A by July 15",
        ],
      },
      {
        id: "workspace-orientation",
        title: "Workspace orientation guide",
        owner: "Priya Patel",
        status: "Draft",
        updated: "2024-07-08",
        summary:
          "Step-by-step walkthrough covering workspace personas, permissions, and navigation best practices.",
        highlights: [
          "Persona matrix for sellers, success managers, and admins",
          "Configuration checklist before first go-live",
          "Recorded tour and quick reference sheet links embedded",
        ],
      },
    ],
  },
  {
    id: "playbooks",
    title: "Playbooks",
    description: "Execution guides that capture best practices for repeatable motions.",
    articles: [
      {
        id: "implementation-playbook",
        title: "Implementation playbook",
        owner: "Priya Patel",
        status: "Draft",
        updated: "2024-07-05",
        summary:
          "Structured deployment plan with change-management checkpoints and stakeholder briefings.",
        highlights: [
          "Discovery workshops complete for three pilot teams",
          "Phase 2 checklist ready for executive sign-off",
          "Enablement assets queued for localization before go-live",
        ],
      },
      {
        id: "support-readiness",
        title: "Support readiness checklist",
        owner: "Emily Whalen",
        status: "In Review",
        updated: "2024-07-04",
        summary:
          "Operational readiness checklist to stand up 24/7 coverage the week after launch.",
        highlights: [
          "Follow-the-sun roster drafted with named owners",
          "Runbook library mapped to refreshed escalation paths",
          "SLA & CSAT targets: ≤30 min response, ≥4.6 CSAT",
        ],
      },
    ],
  },
  {
    id: "insights",
    title: "Insights & analytics",
    description: "Research, dashboards, and readouts to inform roadmap decisions.",
    articles: [
      {
        id: "strategic-insights",
        title: "Strategic Planning Insights",
        owner: "Dakota Garcia",
        status: "Published",
        updated: "2024-07-02",
        summary:
          "Monthly telemetry snapshot covering adoption trends, sentiment, and focus opportunities.",
        highlights: [
          "Adoption climbing: +18% weekly active makers",
          "Top feedback themes: dashboard personalization, export tooling",
          "Next pulse survey scheduled for July 18",
        ],
      },
      {
        id: "renewal-dashboard",
        title: "Renewal health dashboard",
        owner: "Jordan Carter",
        status: "Published",
        updated: "2024-07-01",
        summary: "Snapshot of renewal risk categories with linked mitigation playbooks.",
        highlights: [
          "Overall renewal confidence at 86% (+4% month-over-month)",
          "Risk drivers: data migration blockers, executive sponsorship gaps",
          "Mitigation playbooks assigned for Wingtip, Northwind, A. Datum",
        ],
      },
    ],
  },
]

export function ReportsView() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialKnowledgeBase[0]?.id ?? null
  )
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    initialKnowledgeBase[0]?.articles[0]?.id ?? null
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [draftArticle, setDraftArticle] = useState({
    title: "",
    owner: "",
    status: "Draft" as KnowledgeArticle["status"],
    summary: "",
    highlights: "",
  })
  const [draftCategoryId, setDraftCategoryId] = useState<string>(
    initialKnowledgeBase[0]?.id ?? ""
  )
  const [knowledgeCategories, setKnowledgeCategories] = useState<KnowledgeCategory[]>(initialKnowledgeBase)

  const selectedCategory = useMemo(() => {
    const found = knowledgeCategories.find((category) => category.id === selectedCategoryId)
    return found ?? knowledgeCategories[0]
  }, [knowledgeCategories, selectedCategoryId])
  const selectedArticle = useMemo(() => {
    if (!selectedCategory) return undefined
    return (
      selectedCategory.articles.find((article) => article.id === selectedArticleId) ??
      selectedCategory.articles[0]
    )
  }, [selectedCategory, selectedArticleId])

  const filteredKnowledgeBase = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      return knowledgeCategories
    }

    return knowledgeCategories
      .map((category) => {
        const matchingArticles = category.articles.filter((article) => {
          const haystack = [
            article.title,
            article.owner,
            article.summary,
            ...article.highlights,
          ]
            .join(" ")
            .toLowerCase()
          return haystack.includes(term)
        })
        return matchingArticles.length
          ? { ...category, articles: matchingArticles }
          : null
      })
      .filter((category): category is KnowledgeCategory => category !== null)
  }, [searchTerm, knowledgeCategories])

  const hasCategories = knowledgeCategories.length > 0

  const handleOpenCreate = () => {
    if (!hasCategories) return
    setDraftCategoryId(knowledgeCategories[0].id)
    setDraftArticle({
      title: "",
      owner: "",
      status: "Draft",
      summary: "",
      highlights: "",
    })
    setIsCreateDialogOpen(true)
  }

  const handleCloseCreate = () => {
    setIsCreateDialogOpen(false)
  }

  const handleCreateArticle = () => {
    if (!draftArticle.title.trim() || !draftCategoryId) {
      setIsCreateDialogOpen(false)
      return
    }

    const newArticle: KnowledgeArticle = {
      id: `${draftCategoryId}-${Date.now()}`,
      title: draftArticle.title.trim(),
      owner: draftArticle.owner.trim() || "Unassigned",
      status: draftArticle.status,
      updated: new Date().toISOString().slice(0, 10),
      summary: draftArticle.summary.trim() || "Summary forthcoming.",
      highlights: draftArticle.highlights
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    }

    setKnowledgeCategories((prev) =>
      prev.map((category) =>
        category.id === draftCategoryId
          ? { ...category, articles: [newArticle, ...category.articles] }
          : category
      )
    )

    setSelectedCategoryId(draftCategoryId)
    setSelectedArticleId(newArticle.id)
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base">Knowledge base overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Centralize launch playbooks, ready-made checklists, and insight reports for your team.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search knowledge articles"
                className="h-9 w-64"
              />
              <Button
                size="sm"
                className="gap-2"
                onClick={handleOpenCreate}
                disabled={!hasCategories}
              >
                <IconPlus className="size-4" /> Add article
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
      <div className="px-4 lg:px-6">
        <Card className="shadow-xs lg:min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-base">Knowledge library</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,420px)_minmax(0,2fr)]">
              <div className="flex flex-col gap-4">
                {filteredKnowledgeBase.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                    No articles match your search.
                  </div>
                ) : null}
                {filteredKnowledgeBase.map((category) => {
                  const isActiveCategory = category.id === selectedCategory?.id

                  return (
                    <div
                      key={category.id}
                      className="rounded-xl border border-border/70 bg-muted/10"
                    >
                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {category.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                        <Badge variant="outline">{category.articles.length}</Badge>
                      </div>
                      <div className="grid divide-y border-t border-border/60">
                        {category.articles.map((article) => {
                          const isActiveArticle =
                            isActiveCategory && article.id === selectedArticle?.id

                          return (
                            <button
                              key={article.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategoryId(category.id)
                                setSelectedArticleId(article.id)
                              }}
                              className={cn(
                                "flex flex-col gap-1 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                isActiveArticle
                                  ? "bg-primary/10 text-foreground"
                                  : "hover:bg-muted/40"
                              )}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                  <IconFileDescription className="size-4 text-muted-foreground" />
                                  {article.title}
                                </span>
                                <Badge
                                  variant={isActiveArticle ? "secondary" : "outline"}
                                >
                                  {article.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {article.updated} • {article.owner}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex min-h-[480px] flex-col gap-4 rounded-lg border bg-background p-4 shadow-sm">
                {selectedCategory && selectedArticle ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="grid gap-1">
                        <h3 className="text-base font-semibold">
                          {selectedArticle.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Last updated {selectedArticle.updated} • Owner {selectedArticle.owner}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedArticle.summary}
                    </p>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Key takeaways
                      </p>
                      <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-foreground/90">
                        {selectedArticle.highlights.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid gap-1 text-sm text-muted-foreground">
                      <span>
                        <strong>Status:</strong> {selectedArticle.status}
                      </span>
                      <span>Category: {selectedCategory.title}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                    Select an article to view the knowledge summary
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Modal
        open={isCreateDialogOpen}
        onClose={handleCloseCreate}
        title="Add knowledge article"
        description="Capture the essentials for a new knowledge entry."
        className="max-w-lg"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseCreate}>
              Cancel
            </Button>
            <Button onClick={handleCreateArticle} disabled={!draftArticle.title.trim()}>
              Save article
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="article-title">Title</Label>
            <Input
              id="article-title"
              value={draftArticle.title}
              onChange={(event) =>
                setDraftArticle((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Ex: Strategic initiative implementation checklist"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="article-owner">Owner</Label>
            <Input
              id="article-owner"
              value={draftArticle.owner}
              onChange={(event) =>
                setDraftArticle((prev) => ({ ...prev, owner: event.target.value }))
              }
              placeholder="Who maintains this article?"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="article-status">Status</Label>
            <Select
              value={draftArticle.status}
              onValueChange={(value: KnowledgeArticle["status"]) =>
                setDraftArticle((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger id="article-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="article-category">Category</Label>
            <Select
              value={draftCategoryId}
              onValueChange={(value) => setDraftCategoryId(value)}
              disabled={!hasCategories}
            >
              <SelectTrigger id="article-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {knowledgeCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="article-summary">Summary</Label>
            <textarea
              id="article-summary"
              value={draftArticle.summary}
              onChange={(event) =>
                setDraftArticle((prev) => ({ ...prev, summary: event.target.value }))
              }
              className="min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Provide a short description"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="article-highlights">Key highlights</Label>
            <textarea
              id="article-highlights"
              value={draftArticle.highlights}
              onChange={(event) =>
                setDraftArticle((prev) => ({ ...prev, highlights: event.target.value }))
              }
              className="min-h-[110px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Add one highlight per line"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
