import type { Report, ReportTemplate, TemplateId } from "./types"

// --- Templates ---
const templates: ReportTemplate[] = [
  {
    id: "sales-report",
    name: "Sales & Revenue Report",
    description:
      "Comprehensive sales analytics including revenue trends, top products, and regional performance breakdowns.",
    category: "Sales",
    icon: "TrendingUp",
    fields: [
      { name: "region", label: "Region", type: "select", options: ["All Regions", "North America", "Europe", "Asia Pacific", "Latin America"], required: false },
      { name: "category", label: "Product Category", type: "select", options: ["All Categories", "Electronics", "Clothing", "Home & Garden", "Sports"], required: false },
    ],
  },
  {
    id: "invoice",
    name: "Invoice Report",
    description:
      "Professional invoice generation with itemized billing, tax calculations, and payment terms.",
    category: "Finance",
    icon: "Receipt",
    fields: [
      { name: "customerId", label: "Customer", type: "select", options: ["Acme Corp", "Globex Inc", "Initech LLC", "Umbrella Co", "Wayne Enterprises"], required: true },
    ],
  },
  {
    id: "analytics-dashboard",
    name: "Analytics Dashboard Report",
    description:
      "Web analytics overview with page views, user sessions, conversion funnels, and device breakdowns.",
    category: "Analytics",
    icon: "BarChart3",
    fields: [
      { name: "category", label: "Channel", type: "select", options: ["All Channels", "Organic Search", "Direct", "Social Media", "Paid Ads", "Referral"], required: false },
    ],
  },
]

// --- In-Memory Reports Store ---
const reports: Report[] = [
  {
    id: "rpt-001",
    title: "Q4 2025 Sales Summary",
    templateId: "sales-report",
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    filters: { region: "All Regions", category: "All Categories" },
    status: "completed",
    createdAt: "2025-12-31T10:00:00Z",
    updatedAt: "2025-12-31T10:05:00Z",
  },
  {
    id: "rpt-002",
    title: "Invoice - Acme Corp December",
    templateId: "invoice",
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    filters: { customerId: "Acme Corp" },
    status: "completed",
    createdAt: "2025-12-28T14:30:00Z",
    updatedAt: "2025-12-28T14:32:00Z",
  },
  {
    id: "rpt-003",
    title: "Website Analytics - January 2026",
    templateId: "analytics-dashboard",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    filters: { category: "All Channels" },
    status: "completed",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-01T09:03:00Z",
  },
  {
    id: "rpt-004",
    title: "Q1 2026 Revenue Forecast",
    templateId: "sales-report",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    filters: { region: "North America" },
    status: "pending",
    createdAt: "2026-02-15T11:00:00Z",
    updatedAt: "2026-02-15T11:00:00Z",
  },
  {
    id: "rpt-005",
    title: "Invoice - Globex Inc Q1",
    templateId: "invoice",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    filters: { customerId: "Globex Inc" },
    status: "draft",
    createdAt: "2026-02-20T16:00:00Z",
    updatedAt: "2026-02-20T16:00:00Z",
  },
  {
    id: "rpt-006",
    title: "Paid Ads Performance - February",
    templateId: "analytics-dashboard",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    filters: { category: "Paid Ads" },
    status: "draft",
    createdAt: "2026-02-22T08:00:00Z",
    updatedAt: "2026-02-22T08:00:00Z",
  },
]

let reportCounter = 6

function generateId(): string {
  reportCounter++
  return `rpt-${String(reportCounter).padStart(3, "0")}`
}

// --- Store API ---
export function getTemplates(): ReportTemplate[] {
  return templates
}

export function getTemplate(id: TemplateId): ReportTemplate | undefined {
  return templates.find((t) => t.id === id)
}

export function getReports(status?: string): Report[] {
  let result = [...reports]
  if (status && status !== "all") {
    result = result.filter((r) => r.status === status)
  }
  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getReport(id: string): Report | undefined {
  return reports.find((r) => r.id === id)
}

export function createReport(
  data: Omit<Report, "id" | "createdAt" | "updatedAt" | "status">
): Report {
  const now = new Date().toISOString()
  const report: Report = {
    ...data,
    id: generateId(),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  }
  reports.push(report)
  return report
}

export function updateReport(
  id: string,
  data: Partial<Pick<Report, "status" | "title">>
): Report | undefined {
  const report = reports.find((r) => r.id === id)
  if (!report) return undefined
  if (data.status) report.status = data.status
  if (data.title) report.title = data.title
  report.updatedAt = new Date().toISOString()
  return report
}

export function deleteReport(id: string): boolean {
  const index = reports.findIndex((r) => r.id === id)
  if (index === -1) return false
  reports.splice(index, 1)
  return true
}
