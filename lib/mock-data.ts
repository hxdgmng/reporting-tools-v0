import type { SalesData, InvoiceData, AnalyticsData, TemplateId, ReportFilters } from "./types"

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getMonthsBetween(start: string, end: string): string[] {
  const months: string[] = []
  const s = new Date(start)
  const e = new Date(end)
  const current = new Date(s.getFullYear(), s.getMonth(), 1)
  while (current <= e) {
    months.push(
      current.toLocaleString("default", { month: "short", year: "numeric" })
    )
    current.setMonth(current.getMonth() + 1)
  }
  return months.length > 0 ? months : ["Jan 2026"]
}

function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = []
  const s = new Date(start)
  const e = new Date(end)
  const current = new Date(s)
  while (current <= e && days.length < 31) {
    days.push(
      current.toLocaleDateString("default", { month: "short", day: "numeric" })
    )
    current.setDate(current.getDate() + 1)
  }
  return days.length > 0 ? days : ["Feb 1"]
}

export function generateSalesData(
  startDate: string,
  endDate: string,
  _filters: ReportFilters
): SalesData {
  const months = getMonthsBetween(startDate, endDate)
  const monthlyRevenue = months.map((month) => ({
    month,
    revenue: randomBetween(45000, 180000),
    orders: randomBetween(200, 800),
  }))

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)
  const totalOrders = monthlyRevenue.reduce((sum, m) => sum + m.orders, 0)

  return {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue: Math.round(totalRevenue / totalOrders),
      growthRate: randomBetween(-5, 25),
    },
    monthlyRevenue,
    topProducts: [
      { name: "Wireless Headphones Pro", revenue: randomBetween(20000, 50000), units: randomBetween(400, 1200) },
      { name: "Smart Watch Ultra", revenue: randomBetween(15000, 40000), units: randomBetween(300, 900) },
      { name: "Laptop Stand Deluxe", revenue: randomBetween(10000, 30000), units: randomBetween(500, 1500) },
      { name: "USB-C Hub 7-in-1", revenue: randomBetween(8000, 25000), units: randomBetween(600, 2000) },
      { name: "Mechanical Keyboard RGB", revenue: randomBetween(7000, 20000), units: randomBetween(200, 800) },
    ],
    salesByRegion: [
      { region: "North America", revenue: Math.round(totalRevenue * 0.38), percentage: 38 },
      { region: "Europe", revenue: Math.round(totalRevenue * 0.28), percentage: 28 },
      { region: "Asia Pacific", revenue: Math.round(totalRevenue * 0.22), percentage: 22 },
      { region: "Latin America", revenue: Math.round(totalRevenue * 0.12), percentage: 12 },
    ],
  }
}

export function generateInvoiceData(
  _startDate: string,
  _endDate: string,
  filters: ReportFilters
): InvoiceData {
  const customerName = filters.customerId || "Acme Corp"
  const customers: Record<string, { address: string; email: string }> = {
    "Acme Corp": { address: "123 Business Ave, Suite 400, New York, NY 10001", email: "billing@acmecorp.com" },
    "Globex Inc": { address: "456 Enterprise Blvd, San Francisco, CA 94105", email: "accounts@globex.com" },
    "Initech LLC": { address: "789 Innovation Dr, Austin, TX 73301", email: "finance@initech.io" },
    "Umbrella Co": { address: "321 Corporate Way, Chicago, IL 60601", email: "billing@umbrella.co" },
    "Wayne Enterprises": { address: "1007 Mountain Dr, Gotham, NJ 07001", email: "procurement@wayne.com" },
  }

  const customer = customers[customerName] || customers["Acme Corp"]

  const items = [
    { description: "Enterprise Software License (Annual)", quantity: 1, unitPrice: 24000, total: 24000 },
    { description: "Cloud Hosting - Premium Tier", quantity: 12, unitPrice: 450, total: 5400 },
    { description: "Technical Support Package", quantity: 1, unitPrice: 3600, total: 3600 },
    { description: "Data Migration Service", quantity: 1, unitPrice: 2500, total: 2500 },
    { description: "Custom Integration Development", quantity: 40, unitPrice: 150, total: 6000 },
  ]

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const taxRate = 0.085
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100

  return {
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(randomBetween(1000, 9999))}`,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    company: {
      name: "ReportHub Inc.",
      address: "100 Report Street, Suite 200, San Francisco, CA 94102",
      email: "billing@reporthub.com",
      phone: "+1 (555) 123-4567",
    },
    customer: {
      name: customerName,
      address: customer.address,
      email: customer.email,
    },
    items,
    subtotal,
    taxRate: taxRate * 100,
    taxAmount,
    total: subtotal + taxAmount,
    notes: "Payment is due within 30 days. Please include the invoice number in your payment reference.",
  }
}

export function generateAnalyticsData(
  startDate: string,
  endDate: string,
  _filters: ReportFilters
): AnalyticsData {
  const days = getDaysBetween(startDate, endDate)
  const trafficOverTime = days.map((date) => ({
    date,
    pageViews: randomBetween(1200, 8500),
    visitors: randomBetween(400, 3500),
  }))

  const totalPageViews = trafficOverTime.reduce((sum, d) => sum + d.pageViews, 0)
  const uniqueVisitors = trafficOverTime.reduce((sum, d) => sum + d.visitors, 0)

  return {
    summary: {
      totalPageViews,
      uniqueVisitors,
      bounceRate: randomBetween(25, 55),
      avgSessionDuration: `${randomBetween(2, 8)}m ${randomBetween(10, 59)}s`,
      conversionRate: randomBetween(15, 65) / 10,
    },
    trafficOverTime,
    topPages: [
      { page: "/", views: randomBetween(5000, 15000), avgTime: `${randomBetween(1, 4)}m ${randomBetween(10, 59)}s` },
      { page: "/products", views: randomBetween(3000, 10000), avgTime: `${randomBetween(2, 6)}m ${randomBetween(10, 59)}s` },
      { page: "/pricing", views: randomBetween(2000, 8000), avgTime: `${randomBetween(1, 3)}m ${randomBetween(10, 59)}s` },
      { page: "/blog", views: randomBetween(1500, 6000), avgTime: `${randomBetween(3, 8)}m ${randomBetween(10, 59)}s` },
      { page: "/contact", views: randomBetween(800, 3000), avgTime: `${randomBetween(1, 2)}m ${randomBetween(10, 59)}s` },
    ],
    deviceBreakdown: [
      { device: "Desktop", percentage: 52, sessions: randomBetween(10000, 30000) },
      { device: "Mobile", percentage: 38, sessions: randomBetween(7000, 22000) },
      { device: "Tablet", percentage: 10, sessions: randomBetween(2000, 6000) },
    ],
    conversionFunnel: [
      { step: "Page Visit", count: totalPageViews, rate: 100 },
      { step: "Product View", count: Math.round(totalPageViews * 0.45), rate: 45 },
      { step: "Add to Cart", count: Math.round(totalPageViews * 0.18), rate: 18 },
      { step: "Checkout", count: Math.round(totalPageViews * 0.08), rate: 8 },
      { step: "Purchase", count: Math.round(totalPageViews * 0.04), rate: 4 },
    ],
  }
}

export function generateReportData(
  templateId: TemplateId,
  startDate: string,
  endDate: string,
  filters: ReportFilters
): SalesData | InvoiceData | AnalyticsData {
  switch (templateId) {
    case "sales-report":
      return generateSalesData(startDate, endDate, filters)
    case "invoice":
      return generateInvoiceData(startDate, endDate, filters)
    case "analytics-dashboard":
      return generateAnalyticsData(startDate, endDate, filters)
    default:
      return generateSalesData(startDate, endDate, filters)
  }
}
