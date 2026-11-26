import {
  CODE_PAGE_SAMPLE,
  RASTER_FONT,
  RASTER_HEIGHT_DOTS,
  RASTER_TEXT_BASELINE_Y,
  RASTER_TEXT_X,
  RASTER_WIDTH_DOTS,
} from "../constants/printer"

const PAPER_COLOR = "#ffffff"
const INK_COLOR = "#000000"

// The raster fallback: if no code page prints the accents, the text goes out as an image.
export function drawRasterSample(canvas: HTMLCanvasElement): HTMLCanvasElement {
  canvas.width = RASTER_WIDTH_DOTS
  canvas.height = RASTER_HEIGHT_DOTS
  const context = canvas.getContext("2d")
  if (context === null) {
    return canvas
  }
  context.fillStyle = PAPER_COLOR
  context.fillRect(0, 0, RASTER_WIDTH_DOTS, RASTER_HEIGHT_DOTS)
  context.fillStyle = INK_COLOR
  context.font = RASTER_FONT
  context.fillText(CODE_PAGE_SAMPLE, RASTER_TEXT_X, RASTER_TEXT_BASELINE_Y)
  return canvas
}
