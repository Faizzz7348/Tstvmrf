/**
 * QR Code Scanner Utility — Advanced Multi-Strategy Engine
 * 
 * Scanning strategies (tried in order):
 * 1. Native BarcodeDetector API (Chrome/Edge — fastest, most accurate)
 * 2. jsQR at original resolution
 * 3. jsQR with grayscale preprocessing
 * 4. jsQR with high-contrast binarization
 * 5. jsQR with inverted colors
 * 6. jsQR at multiple scales (50%, 150%, 200%, 300%)
 * 7. jsQR with sharpening filter
 */

let jsQRLoaded: ((data: Uint8ClampedArray, width: number, height: number) => { data: string } | null) | null = null

// ─── Load jsQR from CDN ──────────────────────────────────────────

async function loadJsQR(): Promise<typeof jsQRLoaded> {
  if (jsQRLoaded) return jsQRLoaded

  return new Promise((resolve) => {
    if ((window as any).jsQR) {
      jsQRLoaded = (window as any).jsQR
      resolve(jsQRLoaded)
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"
    script.async = true
    script.onload = () => {
      jsQRLoaded = (window as any).jsQR
      resolve(jsQRLoaded)
    }
    script.onerror = () => {
      console.error("Failed to load jsQR from CDN")
      resolve(null)
    }
    document.head.appendChild(script)
  })
}

// ─── Image helpers ───────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawToCanvas(img: HTMLImageElement, width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, width, height)
  return { canvas, ctx }
}

// ─── Image preprocessing strategies ─────────────────────────────

/** Convert to grayscale for cleaner detection */
function toGrayscale(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = data[i + 1] = data[i + 2] = gray
  }
}

/** High-contrast binarization (Otsu-like threshold) */
function toBinary(data: Uint8ClampedArray): void {
  // Calculate histogram
  const histogram = new Array(256).fill(0)
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
    histogram[gray]++
  }

  // Otsu's threshold
  const total = data.length / 4
  let sum = 0
  for (let i = 0; i < 256; i++) sum += i * histogram[i]

  let sumB = 0, wB = 0, maxVariance = 0, threshold = 128
  for (let t = 0; t < 256; t++) {
    wB += histogram[t]
    if (wB === 0) continue
    const wF = total - wB
    if (wF === 0) break

    sumB += t * histogram[t]
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    const variance = wB * wF * (mB - mF) * (mB - mF)
    if (variance > maxVariance) {
      maxVariance = variance
      threshold = t
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    const val = gray > threshold ? 255 : 0
    data[i] = data[i + 1] = data[i + 2] = val
  }
}

/** Invert colors — helps with white-on-dark QR codes */
function toInverted(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]
    data[i + 1] = 255 - data[i + 1]
    data[i + 2] = 255 - data[i + 2]
  }
}

/** Sharpen image to enhance edges */
function sharpen(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h)
  const d = imageData.data
  const copy = new Uint8ClampedArray(d)
  // 3x3 sharpen kernel: [0,-1,0,-1,5,-1,0,-1,0]
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const idx = (y * w + x) * 4 + c
        const val =
          -copy[((y - 1) * w + x) * 4 + c] +
          -copy[(y * w + (x - 1)) * 4 + c] +
          5 * copy[idx] +
          -copy[(y * w + (x + 1)) * 4 + c] +
          -copy[((y + 1) * w + x) * 4 + c]
        d[idx] = Math.max(0, Math.min(255, val))
      }
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

/** Add white padding around image (helps QR detection near edges) */
function addPadding(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, pad: number): { pw: number; ph: number } {
  const pw = w + pad * 2
  const ph = h + pad * 2
  ctx.canvas.width = pw
  ctx.canvas.height = ph
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, pw, ph)
  ctx.drawImage(img, pad, pad, w, h)
  return { pw, ph }
}

// ─── Strategy 1: Native BarcodeDetector API ─────────────────────

async function scanWithBarcodeDetector(img: HTMLImageElement): Promise<string | null> {
  try {
    if (!("BarcodeDetector" in window)) return null
    const BarcodeDetector = (window as any).BarcodeDetector
    const formats = await BarcodeDetector.getSupportedFormats()
    if (!formats.includes("qr_code")) return null

    const detector = new BarcodeDetector({ formats: ["qr_code"] })
    const results = await detector.detect(img)
    if (results.length > 0 && results[0].rawValue) {
      return results[0].rawValue
    }
    return null
  } catch {
    return null
  }
}

// ─── Strategy 2-7: jsQR with preprocessing ──────────────────────

type PreprocessFn = (ctx: CanvasRenderingContext2D, data: ImageData, img: HTMLImageElement) => ImageData

function createScanStrategy(
  name: string,
  scaleFactor: number,
  preprocess?: PreprocessFn
): { name: string; scan: (jsQR: NonNullable<typeof jsQRLoaded>, img: HTMLImageElement) => string | null } {
  return {
    name,
    scan: (jsQR, img) => {
      const w = Math.round(img.width * scaleFactor)
      const h = Math.round(img.height * scaleFactor)
      if (w < 10 || h < 10 || w > 4000 || h > 4000) return null

      const result = drawToCanvas(img, w, h)
      if (!result) return null
      const { ctx } = result

      let imageData = ctx.getImageData(0, 0, w, h)
      if (preprocess) {
        imageData = preprocess(ctx, imageData, img)
      }

      const code = jsQR(imageData.data, imageData.width, imageData.height)
      return code ? code.data : null
    },
  }
}

// Build all scanning strategies
const strategies = [
  // Original size
  createScanStrategy("original", 1.0),

  // Grayscale
  createScanStrategy("grayscale", 1.0, (_ctx, imageData) => {
    toGrayscale(imageData.data)
    return imageData
  }),

  // Binary (Otsu threshold)
  createScanStrategy("binary", 1.0, (_ctx, imageData) => {
    toBinary(imageData.data)
    return imageData
  }),

  // Inverted 
  createScanStrategy("inverted", 1.0, (_ctx, imageData) => {
    toInverted(imageData.data)
    return imageData
  }),

  // Sharpened
  createScanStrategy("sharpened", 1.0, (ctx, _imageData) => {
    sharpen(ctx, ctx.canvas.width, ctx.canvas.height)
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  }),

  // With padding (white border helps edge detection)
  createScanStrategy("padded", 1.0, (ctx, _imageData, img) => {
    const { pw, ph } = addPadding(ctx, img, img.width, img.height, 40)
    return ctx.getImageData(0, 0, pw, ph)
  }),

  // Scaled variants
  createScanStrategy("scale-50%", 0.5),
  createScanStrategy("scale-150%", 1.5),
  createScanStrategy("scale-200%", 2.0),
  createScanStrategy("scale-300%", 3.0),

  // Binary at different scales
  createScanStrategy("binary-150%", 1.5, (_ctx, imageData) => {
    toBinary(imageData.data)
    return imageData
  }),
  createScanStrategy("binary-200%", 2.0, (_ctx, imageData) => {
    toBinary(imageData.data)
    return imageData
  }),
]

// ─── Main scan function ─────────────────────────────────────────

/**
 * Advanced QR Code scanner — tries multiple strategies to extract data.
 * @param imageDataUrl - Base64 data URL of the QR code image
 * @returns The decoded QR code data (URL/text) or null if not found
 */
export async function scanQrFromImage(imageDataUrl: string): Promise<string | null> {
  try {
    const img = await loadImage(imageDataUrl)

    // Strategy 1: Native BarcodeDetector (fastest, most reliable in supported browsers)
    const nativeResult = await scanWithBarcodeDetector(img)
    if (nativeResult) {
      console.log("[QR Scanner] Detected via BarcodeDetector API")
      return nativeResult
    }

    // Strategy 2-12: jsQR with various preprocessing
    const jsQR = await loadJsQR()
    if (!jsQR) return null

    for (const strategy of strategies) {
      try {
        const result = strategy.scan(jsQR, img)
        if (result) {
          console.log(`[QR Scanner] Detected via jsQR strategy: ${strategy.name}`)
          return result
        }
      } catch {
        // Strategy failed, continue to next
      }
    }

    console.log("[QR Scanner] No QR code detected after all strategies")
    return null
  } catch (error) {
    console.error("[QR Scanner] Fatal error:", error)
    return null
  }
}
