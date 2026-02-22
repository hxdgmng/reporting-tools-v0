export type ReportStatus = "draft" | "pending" | "completed" | "failed"

export type TemplateId = "sales-report" | "invoice" | "analytics-dashboard"

export interface ReportFilters {
  category?: string
  region?: string
  customerId?: string
}

export interface Report {
  id: string
  title: string
  templateId: TemplateId
  startDate: string
  endDate: string
  filters: ReportFilters
  status: ReportStatus
  createdAt: string
  updatedAt: string
}

export interface ReportTemplate {
  id: TemplateId
  name: string
  description: string
  category: string
  icon: string
  fields: TemplateField[]
}

export interface TemplateField {
  name: string
  label: string
  type: "text" | "select" | "date"
  options?: string[]
  required?: boolean
}

// Sales report data types
export interface SalesData {
  summary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    growthRate: number
  }
  monthlyRevenue: { month: string; revenue: number; orders: number }[]
  topProducts: { name: string; revenue: number; units: number }[]
  salesByRegion: { region: string; revenue: number; percentage: number }[]
}

// Invoice data types
export interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  company: {
    name: string
    address: string
    email: string
    phone: string
  }
  customer: {
    name: string
    address: string
    email: string
  }
  items: { description: string; quantity: number; unitPrice: number; total: number }[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string
}

// Analytics data types
export interface AnalyticsData {
  summary: {
    totalPageViews: number
    uniqueVisitors: number
    bounceRate: number
    avgSessionDuration: string
    conversionRate: number
  }
  trafficOverTime: { date: string; pageViews: number; visitors: number }[]
  topPages: { page: string; views: number; avgTime: string }[]
  deviceBreakdown: { device: string; percentage: number; sessions: number }[]
  conversionFunnel: { step: string; count: number; rate: number }[]
}
