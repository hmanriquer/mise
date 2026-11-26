import { describe, expect, it } from "vitest"
import { RULER_LENGTH } from "../constants/printer"
import {
  buildCodePageTest,
  buildDrawerKick,
  buildRuler,
  buildSpikeTestTicket,
} from "../helpers/spike-tickets"

const ESC = 0x1b
const GS = 0x1d
const INITIALIZE = [ESC, 0x40]
const SELECT_CODE_PAGE = [ESC, 0x74]
const CUT = [GS, 0x56]
const KICK_DRAWER = [ESC, 0x70]
const N_TILDE_IN_CP850 = 0xa4
const N_TILDE_IN_WINDOWS1252 = 0xf1
// ESC t table numbers from the POS-5890 profile: the ADR records whether the POS58C3 agrees.
const CP850_TABLE = 2
const WINDOWS1252_TABLE = 16
const CP858_TABLE = 19

function indexOfSequence(bytes: Uint8Array, sequence: number[], from = 0): number {
  for (let start = from; start <= bytes.length - sequence.length; start++) {
    if (sequence.every((value, offset) => bytes[start + offset] === value)) {
      return start
    }
  }
  return -1
}

function bytesOf(text: string): number[] {
  return [...new TextEncoder().encode(text)]
}

describe("buildRuler", () => {
  it("repeats the digits to the requested length", () => {
    expect(buildRuler(12)).toBe("123456789012")
  })
})

describe("buildSpikeTestTicket", () => {
  it("initializes the printer, prints the copy label and cuts", () => {
    const bytes = buildSpikeTestTicket(2)

    expect(indexOfSequence(bytes, INITIALIZE)).toBe(0)
    expect(indexOfSequence(bytes, bytesOf("Copia 2"))).toBeGreaterThan(0)
    expect(indexOfSequence(bytes, CUT)).toBeGreaterThan(0)
  })

  it("sends the ruler raw so the printer, not the encoder, decides where it wraps", () => {
    const bytes = buildSpikeTestTicket(1)

    expect(indexOfSequence(bytes, bytesOf(buildRuler(RULER_LENGTH)))).toBeGreaterThan(0)
  })
})

describe("buildCodePageTest", () => {
  it("selects CP850 before printing ñ as its CP850 byte", () => {
    const bytes = buildCodePageTest()
    const selection = indexOfSequence(bytes, [...SELECT_CODE_PAGE, CP850_TABLE])

    expect(selection).toBeGreaterThan(0)
    expect(bytes.indexOf(N_TILDE_IN_CP850, selection)).toBeGreaterThan(selection)
  })

  it("selects CP858 and Windows-1252 too", () => {
    const bytes = buildCodePageTest()
    const windows1252 = indexOfSequence(bytes, [...SELECT_CODE_PAGE, WINDOWS1252_TABLE])

    expect(indexOfSequence(bytes, [...SELECT_CODE_PAGE, CP858_TABLE])).toBeGreaterThan(0)
    expect(windows1252).toBeGreaterThan(0)
    expect(bytes.indexOf(N_TILDE_IN_WINDOWS1252, windows1252)).toBeGreaterThan(windows1252)
  })
})

describe("buildDrawerKick", () => {
  it("sends the drawer pulse command", () => {
    expect(indexOfSequence(buildDrawerKick(), KICK_DRAWER)).toBeGreaterThanOrEqual(0)
  })
})
