import type { SalesData, InvoiceData, AnalyticsData, TemplateId } from "./types"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #1a1a2e;
    background: #ffffff;
    line-height: 1.6;
    font-size: 13px;
  }
  .container { max-width: 800px; margin: 0 auto; padding: 32px; }
  .header {
    display: flex; justify-content: space-between; align-items: flex-start;
    border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 28px;
  }
  .header h1 { font-size: 22px; font-weight: 700; color: #0f172a; }
  .header .meta { text-align: right; font-size: 12px; color: #64748b; }
  .header .meta p { margin-bottom: 2px; }
  .section { margin-bottom: 28px; }
  .section-title {
    font-size: 15px; font-weight: 600; color: #0f172a;
    border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px;
  }
  .stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 24px;
  }
  .stat-card {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 14px; text-align: center;
  }
  .stat-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat-card .value { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px; }
  .stat-card .change { font-size: 11px; margin-top: 2px; }
  .change.positive { color: #16a34a; }
  .change.negative { color: #dc2626; }
  table { width: 100%; border-collapse: collapse; }
  th {
    background: #f1f5f9; padding: 10px 12px; text-align: left;
    font-size: 11px; font-weight: 600; color: #475569;
    text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0;
  }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  tr:last-child td { border-bottom: none; }
  .bar-chart { margin-top: 8px; }
  .bar-row { display: flex; align-items: center; margin-bottom: 8px; }
  .bar-label { width: 100px; font-size: 12px; color: #475569; flex-shrink: 0; }
  .bar-track { flex: 1; height: 24px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; padding-left: 8px; font-size: 11px; color: #fff; font-weight: 600; }
  .bar-value { margin-left: 10px; font-size: 12px; color: #475569; flex-shrink: 0; width: 80px; text-align: right; }
  .footer {
    margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;
    font-size: 11px; color: #94a3b8; text-align: center;
  }
`

export function generateSalesReportHtml(data: SalesData, title: string, dateRange: string): string {
  const maxRevenue = Math.max(...data.monthlyRevenue.map((m) => m.revenue))
  const barColors = ["#0f172a", "#334155", "#475569", "#64748b"]

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}</style></head><body>
    <div class="container">
      <div class="header">
        <div><h1>${title}</h1><p style="color:#64748b;font-size:13px;margin-top:4px;">Sales & Revenue Report</p></div>
        <div class="meta"><p><strong>Period:</strong> ${dateRange}</p><p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p></div>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">Total Revenue</div>
          <div class="value">${formatCurrency(data.summary.totalRevenue)}</div>
          <div class="change ${data.summary.growthRate >= 0 ? "positive" : "negative"}">${data.summary.growthRate >= 0 ? "+" : ""}${data.summary.growthRate}% vs prior</div>
        </div>
        <div class="stat-card">
          <div class="label">Total Orders</div>
          <div class="value">${formatNumber(data.summary.totalOrders)}</div>
        </div>
        <div class="stat-card">
          <div class="label">Avg. Order Value</div>
          <div class="value">${formatCurrency(data.summary.averageOrderValue)}</div>
        </div>
        <div class="stat-card">
          <div class="label">Growth Rate</div>
          <div class="value" style="color:${data.summary.growthRate >= 0 ? "#16a34a" : "#dc2626"}">${data.summary.growthRate >= 0 ? "+" : ""}${data.summary.growthRate}%</div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Monthly Revenue</div>
        <div class="bar-chart">
          ${data.monthlyRevenue
            .map(
              (m) => `<div class="bar-row">
              <div class="bar-label">${m.month}</div>
              <div class="bar-track"><div class="bar-fill" style="width:${Math.round((m.revenue / maxRevenue) * 100)}%;background:#0f172a;">${formatCurrency(m.revenue)}</div></div>
              <div class="bar-value">${formatNumber(m.orders)} orders</div>
            </div>`
            )
            .join("")}
        </div>
      </div>
      <div class="section">
        <div class="section-title">Top Products</div>
        <table>
          <thead><tr><th>Product</th><th style="text-align:right">Revenue</th><th style="text-align:right">Units Sold</th></tr></thead>
          <tbody>${data.topProducts
            .map(
              (p) => `<tr><td>${p.name}</td><td style="text-align:right">${formatCurrency(p.revenue)}</td><td style="text-align:right">${formatNumber(p.units)}</td></tr>`
            )
            .join("")}</tbody>
        </table>
      </div>
      <div class="section">
        <div class="section-title">Sales by Region</div>
        <div class="bar-chart">
          ${data.salesByRegion
            .map(
              (r, i) => `<div class="bar-row">
              <div class="bar-label">${r.region}</div>
              <div class="bar-track"><div class="bar-fill" style="width:${r.percentage}%;background:${barColors[i % barColors.length]};">${r.percentage}%</div></div>
              <div class="bar-value">${formatCurrency(r.revenue)}</div>
            </div>`
            )
            .join("")}
        </div>
      </div>
      <div class="footer">Generated by ReportHub -- Confidential</div>
    </div>
  </body></html>`
}

export function generateInvoiceHtml(data: InvoiceData, title: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .invoice-id { font-size: 28px; font-weight: 700; color: #0f172a; }
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 28px; }
    .address-block h3 { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; margin-bottom: 8px; }
    .address-block p { font-size: 13px; color: #334155; margin-bottom: 2px; }
    .totals { text-align: right; margin-top: 16px; }
    .totals .row { display: flex; justify-content: flex-end; gap: 40px; padding: 6px 0; font-size: 13px; }
    .totals .total-row { font-size: 16px; font-weight: 700; border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 6px; }
    .notes { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 28px; font-size: 12px; color: #475569; }
  </style></head><body>
    <div class="container">
      <div class="invoice-header">
        <div>
          <div class="invoice-id">${title}</div>
          <p style="color:#64748b;margin-top:4px;font-size:13px;">${data.invoiceNumber}</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:13px;color:#475569;">Issue Date: <strong>${data.issueDate}</strong></p>
          <p style="font-size:13px;color:#475569;">Due Date: <strong>${data.dueDate}</strong></p>
        </div>
      </div>
      <div class="addresses">
        <div class="address-block">
          <h3>From</h3>
          <p><strong>${data.company.name}</strong></p>
          <p>${data.company.address}</p>
          <p>${data.company.email}</p>
          <p>${data.company.phone}</p>
        </div>
        <div class="address-block">
          <h3>Bill To</h3>
          <p><strong>${data.customer.name}</strong></p>
          <p>${data.customer.address}</p>
          <p>${data.customer.email}</p>
        </div>
      </div>
      <div class="section">
        <table>
          <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead>
          <tbody>${data.items
            .map(
              (item) => `<tr><td>${item.description}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">${formatCurrency(item.unitPrice)}</td><td style="text-align:right">${formatCurrency(item.total)}</td></tr>`
            )
            .join("")}</tbody>
        </table>
        <div class="totals">
          <div class="row"><span>Subtotal</span><span>${formatCurrency(data.subtotal)}</span></div>
          <div class="row"><span>Tax (${data.taxRate}%)</span><span>${formatCurrency(data.taxAmount)}</span></div>
          <div class="row total-row"><span>Total Due</span><span>${formatCurrency(data.total)}</span></div>
        </div>
      </div>
      <div class="notes"><strong>Notes:</strong> ${data.notes}</div>
      <div class="footer">Generated by ReportHub -- Confidential</div>
    </div>
  </body></html>`
}

export function generateAnalyticsHtml(data: AnalyticsData, title: string, dateRange: string): string {
  const maxViews = Math.max(...data.trafficOverTime.map((d) => d.pageViews))
  const funnelMax = data.conversionFunnel[0]?.count || 1

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}
    .stats-grid { grid-template-columns: repeat(5, 1fr); }
    .funnel-step { display: flex; align-items: center; margin-bottom: 6px; }
    .funnel-label { width: 100px; font-size: 12px; color: #475569; flex-shrink: 0; }
    .funnel-track { flex: 1; height: 28px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .funnel-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; font-weight: 600; }
    .funnel-value { margin-left: 10px; font-size: 12px; color: #475569; flex-shrink: 0; width: 60px; text-align: right; }
    .mini-chart { display: flex; align-items: flex-end; gap: 2px; height: 60px; margin-top: 8px; }
    .mini-bar { flex: 1; background: #0f172a; border-radius: 2px 2px 0 0; min-width: 4px; }
  </style></head><body>
    <div class="container">
      <div class="header">
        <div><h1>${title}</h1><p style="color:#64748b;font-size:13px;margin-top:4px;">Analytics Dashboard Report</p></div>
        <div class="meta"><p><strong>Period:</strong> ${dateRange}</p><p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p></div>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="label">Page Views</div><div class="value">${formatNumber(data.summary.totalPageViews)}</div></div>
        <div class="stat-card"><div class="label">Visitors</div><div class="value">${formatNumber(data.summary.uniqueVisitors)}</div></div>
        <div class="stat-card"><div class="label">Bounce Rate</div><div class="value">${data.summary.bounceRate}%</div></div>
        <div class="stat-card"><div class="label">Avg. Session</div><div class="value">${data.summary.avgSessionDuration}</div></div>
        <div class="stat-card"><div class="label">Conversion</div><div class="value">${data.summary.conversionRate}%</div></div>
      </div>
      <div class="section">
        <div class="section-title">Traffic Over Time</div>
        <div class="mini-chart">
          ${data.trafficOverTime
            .map(
              (d) => `<div class="mini-bar" style="height:${Math.max(5, Math.round((d.pageViews / maxViews) * 100))}%;" title="${d.date}: ${formatNumber(d.pageViews)} views"></div>`
            )
            .join("")}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:4px;">
          <span>${data.trafficOverTime[0]?.date || ""}</span>
          <span>${data.trafficOverTime[data.trafficOverTime.length - 1]?.date || ""}</span>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Top Pages</div>
        <table>
          <thead><tr><th>Page</th><th style="text-align:right">Views</th><th style="text-align:right">Avg. Time</th></tr></thead>
          <tbody>${data.topPages
            .map(
              (p) => `<tr><td>${p.page}</td><td style="text-align:right">${formatNumber(p.views)}</td><td style="text-align:right">${p.avgTime}</td></tr>`
            )
            .join("")}</tbody>
        </table>
      </div>
      <div class="section">
        <div class="section-title">Conversion Funnel</div>
        ${data.conversionFunnel
          .map(
            (step, i) => `<div class="funnel-step">
            <div class="funnel-label">${step.step}</div>
            <div class="funnel-track"><div class="funnel-fill" style="width:${Math.max(8, Math.round((step.count / funnelMax) * 100))}%;background:${["#0f172a", "#1e293b", "#334155", "#475569", "#64748b"][i] || "#64748b"};">${formatNumber(step.count)}</div></div>
            <div class="funnel-value">${step.rate}%</div>
          </div>`
          )
          .join("")}
      </div>
      <div class="section">
        <div class="section-title">Device Breakdown</div>
        <table>
          <thead><tr><th>Device</th><th style="text-align:right">Sessions</th><th style="text-align:right">Share</th></tr></thead>
          <tbody>${data.deviceBreakdown
            .map(
              (d) => `<tr><td>${d.device}</td><td style="text-align:right">${formatNumber(d.sessions)}</td><td style="text-align:right">${d.percentage}%</td></tr>`
            )
            .join("")}</tbody>
        </table>
      </div>
      <div class="footer">Generated by ReportHub -- Confidential</div>
    </div>
  </body></html>`
}

export function generateReportHtml(
  templateId: TemplateId,
  data: SalesData | InvoiceData | AnalyticsData,
  title: string,
  dateRange: string
): string {
  switch (templateId) {
    case "sales-report":
      return generateSalesReportHtml(data as SalesData, title, dateRange)
    case "invoice":
      return generateInvoiceHtml(data as InvoiceData, title)
    case "analytics-dashboard":
      return generateAnalyticsHtml(data as AnalyticsData, title, dateRange)
    default:
      return generateSalesReportHtml(data as SalesData, title, dateRange)
  }
}
