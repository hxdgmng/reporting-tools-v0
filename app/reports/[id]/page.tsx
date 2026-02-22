"use client"

import { useCallback, use } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  ArrowLeft,
  Download,
  Trash2,
  Loader2,
  Calendar,
  FileText,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ReportPreview } from "@/components/report-preview"
import type { Report } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const templateLabels: Record<string, string> = {
  "sales-report": "Sales & Revenue",
  invoice: "Invoice",
  "analytics-dashboard": "Analytics Dashboard",
}

const statusVariants: Record<
  string,
  { variant: "default" | "secondary" | "outline" | "destructive"; label: string }
> = {
  completed: { variant: "default", label: "Completed" },
  pending: { variant: "secondary", label: "Pending" },
  draft: { variant: "outline", label: "Draft" },
  failed: { variant: "destructive", label: "Failed" },
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const {
    data: report,
    isLoading,
    mutate,
  } = useSWR<Report>(`/api/reports/${id}`, fetcher)

  const handleDownload = useCallback(async () => {
    const toastId = toast.loading("Generating PDF...")
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.details || err.error || "Failed to generate PDF")
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report?.title?.replace(/\s+/g, "-").toLowerCase() || "report"}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("PDF downloaded successfully", { id: toastId })
      mutate()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate PDF",
        { id: toastId }
      )
    }
  }, [id, report, mutate])

  const handleDelete = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Report deleted")
      router.push("/")
    } catch {
      toast.error("Failed to delete report")
    }
  }, [id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Report not found</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const statusInfo = statusVariants[report.status] || statusVariants.draft

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to dashboard</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-balance">
                {report.title}
              </h1>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {templateLabels[report.templateId] || report.templateId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload}>
            <Download className="size-4" />
            Download PDF
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Trash2 className="size-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The report and any associated
                  data will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date Range</p>
              <p className="text-sm font-medium">
                {new Date(report.startDate).toLocaleDateString()} -{" "}
                {new Date(report.endDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Template</p>
              <p className="text-sm font-medium">
                {templateLabels[report.templateId] || report.templateId}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {report.filters && Object.keys(report.filters).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Applied Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(report.filters).map(([key, value]) =>
                value ? (
                  <Badge key={key} variant="secondary">
                    {key}: {value}
                  </Badge>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Preview */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Report Preview</h2>
        <ReportPreview reportId={id} />
      </div>
    </div>
  )
}
