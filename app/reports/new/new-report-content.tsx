"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Loader2, ArrowLeft, FileDown, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TemplatePicker } from "@/components/template-picker"
import { DateRangePicker } from "@/components/date-range-picker"
import { ReportFilterControls } from "@/components/report-filters"
import type { TemplateId, ReportTemplate, ReportFilters } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const templateNames: Record<TemplateId, string> = {
  "sales-report": "Sales & Revenue Report",
  invoice: "Invoice Report",
  "analytics-dashboard": "Analytics Dashboard Report",
}

export function NewReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTemplate = searchParams.get("template") as TemplateId | null

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(
    preselectedTemplate
  )
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(2026, 0, 1)
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(2026, 1, 28)
  )
  const [filters, setFilters] = useState<ReportFilters>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  const { data: templates } = useSWR<ReportTemplate[]>(
    "/api/templates",
    fetcher
  )

  const currentTemplate =
    templates?.find((t) => t.id === selectedTemplate) || null

  useEffect(() => {
    if (selectedTemplate && !title) {
      const base = templateNames[selectedTemplate] || "Report"
      const dateStr = startDate
        ? startDate.toLocaleDateString("default", {
            month: "short",
            year: "numeric",
          })
        : ""
      setTitle(`${base} - ${dateStr}`)
    }
  }, [selectedTemplate, startDate, title])

  const fetchPreview = useCallback(async () => {
    if (!selectedTemplate || !startDate || !endDate) return

    const params = new URLSearchParams({
      templateId: selectedTemplate,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      filters: JSON.stringify(filters),
    })

    const res = await fetch(`/api/data?${params}`)
    if (res.ok) {
      setPreviewHtml("loaded")
    }
  }, [selectedTemplate, startDate, endDate, filters])

  useEffect(() => {
    if (selectedTemplate) {
      fetchPreview()
    }
  }, [selectedTemplate, fetchPreview])

  const handleSave = async () => {
    if (!selectedTemplate || !startDate || !endDate || !title.trim()) {
      toast.error("Please fill in all required fields")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          templateId: selectedTemplate,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          filters,
        }),
      })
      if (!res.ok) throw new Error("Failed to save report")
      const report = await res.json()
      toast.success("Report saved successfully")
      router.push(`/reports/${report.id}`)
    } catch {
      toast.error("Failed to save report")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAndGenerate = async () => {
    if (!selectedTemplate || !startDate || !endDate || !title.trim()) {
      toast.error("Please fill in all required fields")
      return
    }
    setIsGenerating(true)
    try {
      const saveRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          templateId: selectedTemplate,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          filters,
        }),
      })
      if (!saveRes.ok) throw new Error("Failed to save report")
      const report = await saveRes.json()

      const pdfRes = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id }),
      })

      if (!pdfRes.ok) {
        const err = await pdfRes.json()
        throw new Error(err.details || "Failed to generate PDF")
      }

      const blob = await pdfRes.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.trim().replace(/\s+/g, "-").toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("PDF generated and downloaded")
      router.push(`/reports/${report.id}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate PDF"
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const isValid =
    selectedTemplate && startDate && endDate && title.trim().length > 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Create New Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a template, configure options, and generate your report.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Choose a Template</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplatePicker
            selected={selectedTemplate}
            onSelect={(id) => {
              setSelectedTemplate(id)
              setTitle("")
              setFilters({})
              setPreviewHtml(null)
            }}
          />
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Configure Report</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-title" className="text-sm font-medium">
                Report Title
              </label>
              <Input
                id="report-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter report title..."
                className="max-w-md"
              />
            </div>
            <Separator />
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <Separator />
            <ReportFilterControls
              template={currentTemplate}
              filters={filters}
              onChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      {selectedTemplate && previewHtml && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Save & Generate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Your report is configured and ready. Save it as a draft or
              generate the PDF immediately.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={!isValid || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save as Draft
              </Button>
              <Button
                onClick={handleSaveAndGenerate}
                disabled={!isValid || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Save & Generate PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
