"use client"

import { TrendingUp, Receipt, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TemplateId } from "@/lib/types"

const templates: {
  id: TemplateId
  name: string
  description: string
  category: string
  icon: typeof TrendingUp
}[] = [
  {
    id: "sales-report",
    name: "Sales & Revenue",
    description:
      "Revenue trends, top products, regional breakdowns, and growth metrics.",
    category: "Sales",
    icon: TrendingUp,
  },
  {
    id: "invoice",
    name: "Invoice",
    description:
      "Professional invoices with itemized billing, tax calculations, and payment terms.",
    category: "Finance",
    icon: Receipt,
  },
  {
    id: "analytics-dashboard",
    name: "Analytics Dashboard",
    description:
      "Page views, sessions, conversion funnels, device breakdowns, and top pages.",
    category: "Analytics",
    icon: BarChart3,
  },
]

interface TemplatePickerProps {
  selected: TemplateId | null
  onSelect: (id: TemplateId) => void
}

export function TemplatePicker({ selected, onSelect }: TemplatePickerProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {templates.map((t) => {
        const isSelected = selected === t.id
        return (
          <Card
            key={t.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            className={cn(
              "cursor-pointer transition-all hover:border-foreground/30",
              isSelected && "border-foreground ring-1 ring-foreground"
            )}
            onClick={() => onSelect(t.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect(t.id)
              }
            }}
          >
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md",
                    isSelected
                      ? "bg-foreground text-background"
                      : "bg-secondary text-foreground"
                  )}
                >
                  <t.icon className="size-4" />
                </div>
                <div>
                  <p className="font-medium leading-none">{t.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.category}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
