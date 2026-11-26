// The POS58C3 is a generic 58 mm ESC/POS clone. The encoder's POS-5890 profile shares its code
// page table and its 32/42 column fonts, so the spike starts from it and the ADR records the truth.
export const SPIKE_PRINTER_MODEL = "pos-5890"

export const SPIKE_CODE_PAGES = ["cp850", "cp858", "windows1252"] as const

export const CODE_PAGE_SAMPLE = "á é í ó ú ñ Ñ ¿ ¡ $"

// Longer than Font B's 42 columns, so the printer's own wrap point shows the real chars per line.
export const RULER_LENGTH = 64
export const RULER_DIGITS = "1234567890"

export const FONT_A = "A"
export const FONT_B = "B"

export const DOUBLE_SIZE = 2
export const NORMAL_SIZE = 1
export const FEED_LINES_BEFORE_CUT = 3

export const BACK_TO_BACK_TICKET_COUNT = 2

// 384 dots is the printable width of a 58 mm head at 203 dpi.
export const RASTER_WIDTH_DOTS = 384
export const RASTER_HEIGHT_DOTS = 48
export const RASTER_FONT = "bold 26px sans-serif"
export const RASTER_TEXT_X = 4
export const RASTER_TEXT_BASELINE_Y = 34
export const RASTER_THRESHOLD = 128
