import { describe, expect, it, vi } from "vitest";

import { appendToTextCard, appendWithLineBreak } from "../src/canvas";
import type { SelectedCardContext } from "../src/types";

describe("selected Card append behavior", () => {
    it("adds one line break before plain text", () => {
        expect(appendWithLineBreak("existing", "incoming")).toBe(
            "existing\nincoming",
        );
        expect(appendWithLineBreak("existing\n", "incoming")).toBe(
            "existing\nincoming",
        );
        expect(appendWithLineBreak("", "incoming")).toBe("incoming");
    });

    it("writes formatted Zotero content through the runtime Card", () => {
        const setData = vi.fn();
        const requestSave = vi.fn();
        const context = {
            canvas: { requestSave },
            card: { setData },
            data: { type: "text", text: "existing" },
            document: {} as Document,
        } satisfies SelectedCardContext;

        const result = appendToTextCard(
            context,
            "“Quote” ([Author, 2026, p. 2](zotero://open-pdf/item/1))",
        );

        expect(result).toEqual({ status: "inserted" });
        expect(setData).toHaveBeenCalledWith(
            {
                type: "text",
                text: "existing\nQuote [Author, 2026](zotero://open-pdf/item/1)",
            },
            true,
        );
        expect(requestSave).toHaveBeenCalledOnce();
    });

    it("reports unsupported runtime Cards without mutating", () => {
        const context = {
            canvas: {},
            card: {},
            data: { type: "text", text: "existing" },
            document: {} as Document,
        } satisfies SelectedCardContext;

        expect(appendToTextCard(context, "incoming")).toEqual({
            status: "unsupported",
        });
    });
});
