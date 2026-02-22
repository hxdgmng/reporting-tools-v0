"use client"

import Link from "next/link"
import { MoreHorizontal, Trash2, Eye, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import type { Report } from "@/lib/types"

const templateLabels: Record<string, string> = {
  "sales-report": "Sales & Revenue",
  invoice: "Invoice",
  "analytics-dashboard": "Analytics",
}

const statusVariants: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
  completed: { variant: "default", label: "Completed" },
  pending: { variant: "secondary", label: "Pending" },
  draft: { variant: "outline", label: "Draft" },
  failed: { variant: "destructive", label: "Failed" },
}

interface ReportCardProps {
  report: Report
  onDelete: (id: string) => void
  onDownload: (id: string) => void
}

export function ReportCard({ report, onDelete, onDownload }: ReportCardProps) {
  const statusInfo = statusVariants[report.status] || statusVariants.draft
  const templateLabel = templateLabels[report.templateId] || report.templateId

  return (
    <Card className="group transition-colors hover:border-foreground/20">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/reports/${report.id}`}
              className="font-medium truncate hover:underline"
            >
              {report.title}
            </Link>
            <Badge variant={statusInfo.variant} className="shrink-0">
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{templateLabel}</span>
            <span>{"/"}</span>
            <span>
              {new Date(report.startDate).toLocaleDateString()} -{" "}
              {new Date(report.endDate).toLocaleDateString()}
            </span>
            <span>{"/"}</span>
            <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Report actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/reports/${report.id}`}>
                <Eye className="size-4" />
                View Report
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(report.id)}>
              <Download className="size-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(report.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
