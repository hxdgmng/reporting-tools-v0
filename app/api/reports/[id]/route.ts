import { NextRequest, NextResponse } from "next/server"
import { getReport, deleteReport, updateReport } from "@/lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const report = getReport(id)
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }
  return NextResponse.json(report)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const report = updateReport(id, body)
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }
    return NextResponse.json(report)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = deleteReport(id)
  if (!deleted) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
