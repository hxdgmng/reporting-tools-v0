"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface ReportPreviewProps {
  reportId: string
}

export function ReportPreview({ reportId }: ReportPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPreview() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/reports/${reportId}/preview`)
        if (!res.ok) throw new Error("Failed to load preview")
        const html = await res.text()
        const iframe = iframeRef.current
        if (iframe) {
          const doc = iframe.contentDocument || iframe.contentWindow?.document
          if (doc) {
            doc.open()
            doc.write(html)
            doc.close()
          }
        }
      } catch {
        setError("Failed to load report preview")
      } finally {
        setIsLoading(false)
      }
    }
    loadPreview()
  }, [reportId])

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
        {error}
      </div>
    )
  }

  return (
    <div className="relative rounded-lg border bg-background">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="h-[600px] w-full rounded-lg"
        title="Report Preview"
        sandbox="allow-same-origin"
      />
    </div>
  )
}
