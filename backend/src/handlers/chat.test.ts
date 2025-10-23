import { describe, expect, it } from "vitest"
import { cosineSimilarity } from "./chat.js"

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const value = cosineSimilarity([1, 2, 3], [1, 2, 3])
    expect(value).toBeCloseTo(1)
  })

  it("returns 0 for orthogonal vectors", () => {
    const value = cosineSimilarity([1, 0], [0, 5])
    expect(value).toBeCloseTo(0)
  })

  it("handles zero vectors", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0)
    expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0)
  })
})
