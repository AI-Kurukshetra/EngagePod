import { describe, expect, it } from "vitest";
import { clamp, cn, initials, percentLabel } from "@/lib/utils";
import { createTestId } from "@/lib/test-id";
import { formatDateLabel, formatNumber, formatTimeLabel } from "@/lib/format";

describe("utility helpers", () => {
  it("merges class names safely", () => {
    expect(cn("px-2", "px-4", "font-semibold")).toContain("px-4");
  });

  it("clamps values and formats percentages", () => {
    expect(clamp(140, 0, 100)).toBe(100);
    expect(percentLabel(84.3)).toBe("84%");
  });

  it("creates initials and stable test ids", () => {
    expect(initials("Jordan Lee")).toBe("JL");
    expect(initials("")).toBe("");
    expect(createTestId("Lesson Card", "Act 1")).toBe("lesson-card__act-1");
  });

  it("formats numbers and dates", () => {
    expect(formatNumber(1200)).toBe("1,200");
    expect(formatDateLabel("2026-03-16")).toContain("2026");
    expect(formatTimeLabel("2026-03-14T11:30:00+05:30")).toMatch(/AM|PM/);
  });
});
