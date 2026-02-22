import { NextRequest, NextResponse } from "next/server"
import { generateReportData } from "@/lib/mock-data"
import type { TemplateId, ReportFilters } from "@/lib/types"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get("templateId") as TemplateId
  const startDate = searchParams.get("startDate") || "2026-01-01"
  const endDate = searchParams.get("endDate") || "2026-01-31"
  const filtersParam = searchParams.get("filters")

  if (!templateId) {
    return NextResponse.json({ error: "templateId is required" }, { status: 400 })
  }

  let filters: ReportFilters = {}
  if (filtersParam) {
    try {
      filters = JSON.parse(filtersParam)
    } catch {
      return NextResponse.json({ error: "Invalid filters JSON" }, { status: 400 })
    }
  }

  const data = generateReportData(templateId, startDate, endDate, filters)
  return NextResponse.json(data)
}
