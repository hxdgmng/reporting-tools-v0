"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ReportTemplate, ReportFilters } from "@/lib/types"

interface ReportFiltersProps {
  template: ReportTemplate | null
  filters: ReportFilters
  onChange: (filters: ReportFilters) => void
}

export function ReportFilterControls({ template, filters, onChange }: ReportFiltersProps) {
  if (!template || template.fields.length === 0) return null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {template.fields.map((field) => {
        if (field.type === "select" && field.options) {
          const key = field.name as keyof ReportFilters
          return (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{field.label}</label>
              <Select
                value={(filters[key] as string) || field.options[0]}
                onValueChange={(value) =>
                  onChange({ ...filters, [field.name]: value })
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={field.label} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}
