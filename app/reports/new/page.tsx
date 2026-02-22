import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { NewReportContent } from "./new-report-content"

export default function NewReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewReportContent />
    </Suspense>
  )
}
