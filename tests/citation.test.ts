import { describe, expect, it } from "vitest";

import {
    formatIncomingText,
    normalizeCitationLabel,
    parseZoteroClipboard,
} from "../src/citation";

describe("Zotero citation parsing", () => {
    it("formats an annotation as excerpt plus author-year link", () => {
        const input =
            "“Quoted text” ([Smith et al., 2024, p. 17](zotero://open-pdf/library/items/ABC?page=17))";

        expect(formatIncomingText(input)).toBe(
            "Quoted text [Smith et al., 2024](zotero://open-pdf/library/items/ABC?page=17)",
        );
    });

    it("keeps internal quotation marks in the excerpt", () => {
        const input =
            "“Text with “internal” quotation marks” ([Lee, 2020](zotero://select/library/items/ABC))";

        expect(parseZoteroClipboard(input)?.content).toBe(
            "Text with “internal” quotation marks",
        );
    });

    it("normalizes different author-year locator labels", () => {
        expect(normalizeCitationLabel("Smith, 2024, p. 17")).toBe(
            "Smith, 2024",
        );
        expect(normalizeCitationLabel("张三，2023，第 9 页")).toBe(
            "张三, 2023",
        );
    });

    it("leaves ordinary clipboard text unchanged", () => {
        expect(formatIncomingText("ordinary text")).toBe("ordinary text");
    });
});
