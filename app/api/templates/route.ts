import { NextResponse } from "next/server"
import { getTemplates } from "@/lib/store"

export async function GET() {
  const templates = getTemplates()
  return NextResponse.json(templates)
}
