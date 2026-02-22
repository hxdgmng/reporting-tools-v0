"use client"

import { FileText, CheckCircle2, Clock, LayoutTemplate } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  total: number
  completed: number
  pending: number
  templates: number
}

const stats = [
  { key: "total" as const, label: "Total Reports", icon: FileText, color: "text-foreground" },
  { key: "completed" as const, label: "Completed", icon: CheckCircle2, color: "text-emerald-600" },
  { key: "pending" as const, label: "Pending", icon: Clock, color: "text-amber-600" },
  { key: "templates" as const, label: "Templates", icon: LayoutTemplate, color: "text-foreground" },
]

export function StatsCards({ total, completed, pending, templates }: StatsCardsProps) {
  const values = { total, completed, pending, templates }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.key}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold tabular-nums">{values[stat.key]}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
