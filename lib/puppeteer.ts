import type { Browser } from "puppeteer-core"

let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance
  }

  const puppeteer = await import("puppeteer-core")

  let executablePath: string | undefined

  // Try @sparticuz/chromium-min for serverless
  try {
    const chromium = await import("@sparticuz/chromium-min")
    const chromiumMod = chromium.default || chromium

    executablePath = await chromiumMod.executablePath(
      "https://github.com/nicholasgriffintn/chromium-binaries/releases/download/v133.0.0/chromium-v133.0.0-pack.tar"
    )

    browserInstance = await puppeteer.default.launch({
      args: chromiumMod.args,
      defaultViewport: chromiumMod.defaultViewport,
      executablePath,
      headless: true,
    })
  } catch {
    // Dev fallback: try local chrome installations
    const possiblePaths = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/opt/google/chrome/google-chrome",
    ]

    for (const p of possiblePaths) {
      try {
        const { existsSync } = await import("fs")
        if (existsSync(p)) {
          executablePath = p
          break
        }
      } catch {
        continue
      }
    }

    if (!executablePath) {
      throw new Error(
        "No Chrome/Chromium executable found. Install @sparticuz/chromium-min or a local Chrome installation."
      )
    }

    browserInstance = await puppeteer.default.launch({
      executablePath,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
    })
  }

  return browserInstance!
}

export async function generatePdf(html: string): Promise<Buffer> {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await page.close()
  }
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}
