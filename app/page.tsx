"use client"

import { useCallback } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatsCards } from "@/components/stats-cards"
import { ReportCard } from "@/components/report-card"
import type { Report } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const { data: reports, mutate, isLoading } = useSWR<Report[]>("/api/reports", fetcher)

  const totalReports = reports?.length || 0
  const completed = reports?.filter((r) => r.status === "completed").length || 0
  const pending = reports?.filter((r) => r.status === "pending" || r.status === "draft").length || 0

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/reports/${id}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Failed to delete")
        mutate()
        toast.success("Report deleted successfully")
      } catch {
        toast.error("Failed to delete report")
      }
    },
    [mutate]
  )

  const handleDownload = useCallback(async (id: string) => {
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
      a.download = `report-${id}.pdf`
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
  }, [mutate])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and generate your reports
          </p>
        </div>
        <Button asChild>
          <Link href="/reports/new">
            <Plus className="size-4" />
            New Report
          </Link>
        </Button>
      </div>

      <StatsCards
        total={totalReports}
        completed={completed}
        pending={pending}
        templates={3}
      />

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Recent Reports</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="flex flex-col gap-2">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">No reports yet</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/reports/new">Create your first report</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
