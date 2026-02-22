import { NextRequest, NextResponse } from "next/server"
import { getReports, createReport } from "@/lib/store"
import type { TemplateId, ReportFilters } from "@/lib/types"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || undefined
  const reports = getReports(status)
  return NextResponse.json(reports)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, templateId, startDate, endDate, filters } = body

    if (!title || !templateId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "title, templateId, startDate, and endDate are required" },
        { status: 400 }
      )
    }

    const report = createReport({
      title,
      templateId: templateId as TemplateId,
      startDate,
      endDate,
      filters: (filters || {}) as ReportFilters,
    })

    return NextResponse.json(report, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
