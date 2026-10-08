import { formatIncomingText } from "./citation";
import type {
    AppendResult,
    CanvasTextCard,
    CanvasTextCardData,
    SelectedCardContext,
} from "./types";

export function appendToTextCard(
    context: SelectedCardContext,
    incomingText: string,
): AppendResult {
    const { canvas, card, data } = context;
    const preparedText = formatIncomingText(incomingText);

    if (!preparedText) return { status: "ignored" };

    const nextText = appendWithLineBreak(data.text, preparedText);

    try {
        if (typeof card.setData === "function") {
            card.setData({ ...data, text: nextText }, true);
        } else if (typeof card.setText === "function") {
            card.setText(nextText);
        } else {
            return { status: "unsupported" };
        }

        canvas.requestSave?.();
        return { status: "inserted" };
    } catch (error) {
        console.error("MarginCanvas: append to selected Card", error);
        return { status: "error" };
    }
}

export function appendWithLineBreak(current: string, incoming: string): string {
    const separator =
        current.length === 0 || current.endsWith("\n") ? "" : "\n";

    return current + separator + incoming;
}

export function isTextCardData(
    data: Record<string, unknown> | null,
): data is CanvasTextCardData {
    return data?.type === "text" && typeof data.text === "string";
}

export function getCardElement(
    card: CanvasTextCard,
    document: Document,
): HTMLElement | null {
    for (const key of ["nodeEl", "containerEl", "contentEl"] as const) {
        const candidate = card[key];

        if (!candidate?.closest) continue;
        if (candidate.matches(".canvas-node")) return candidate;

        const cardElement = candidate.closest<HTMLElement>(".canvas-node");
        if (cardElement) return cardElement;
    }

    if (!card.id) return null;

    return document.querySelector<HTMLElement>(
        `.canvas-node[data-node-id="${escapeCssValue(card.id)}"]`,
    );
}

function escapeCssValue(value: string): string {
    return CSS.escape(value);
}
