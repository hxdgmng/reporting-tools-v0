import { NextRequest, NextResponse } from "next/server"
import { getReport, updateReport } from "@/lib/store"
import { generateReportData } from "@/lib/mock-data"
import { generateReportHtml } from "@/lib/report-templates"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId, html: directHtml } = body

    let html: string

    if (directHtml) {
      html = directHtml
    } else if (reportId) {
      const report = getReport(reportId)
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
      html = generateReportHtml(report.templateId, data, report.title, dateRange)

      updateReport(reportId, { status: "completed" })
    } else {
      return NextResponse.json(
        { error: "Either reportId or html is required" },
        { status: 400 }
      )
    }

    // Dynamic import to avoid loading chromium during build
    const { generatePdf } = await import("@/lib/puppeteer")
    const pdfBuffer = await generatePdf(html)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${reportId || "custom"}-${Date.now()}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
