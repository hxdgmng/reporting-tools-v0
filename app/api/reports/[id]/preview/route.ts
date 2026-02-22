import { NextRequest, NextResponse } from "next/server"
import { getReport } from "@/lib/store"
import { generateReportData } from "@/lib/mock-data"
import { generateReportHtml } from "@/lib/report-templates"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const report = getReport(id)
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  const data = generateReportData(
    report.templateId,
    report.startDate,
    report.endDate,
    report.filters
  )

  const dateRange = `${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}`
  const html = generateReportHtml(report.templateId, data, report.title, dateRange)

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  })
}
