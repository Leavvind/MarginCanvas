export interface ParsedZoteroCitation {
    content: string;
    link: string;
    citationLabel: string;
}

export function formatIncomingText(text: string): string {
    const parsed = parseZoteroClipboard(text);

    return parsed ? formatParsedCitation(parsed) : text;
}

export function formatParsedCitation(parsed: ParsedZoteroCitation): string {
    return `${parsed.content} [${parsed.citationLabel}](${parsed.link})`;
}

export function parseZoteroClipboard(
    text: string,
): ParsedZoteroCitation | null {
    const linkMatch = text.match(/zotero:\/\/[^\s)\]}>"']+/i);
    if (!linkMatch || linkMatch.index === undefined) return null;

    const link = linkMatch[0];
    const beforeLink = text.slice(0, linkMatch.index);
    const citationLabelMatch = beforeLink.match(/\[([^\]]+)\]\(\s*$/);
    const citationLabel = normalizeCitationLabel(
        citationLabelMatch?.[1] ?? "Zotero",
    );
    const quoted = beforeLink.match(
        /^[\s]*["“]([\s\S]+)["”]\s*\(\s*\[[\s\S]*$/,
    );

    let content: string;

    if (quoted?.[1]) {
        content = quoted[1];
    } else {
        const citationStart = beforeLink.lastIndexOf("([");

        content = (
            citationStart > 0
                ? beforeLink.slice(0, citationStart)
                : beforeLink
        )
            .trim()
            .replace(/^["“]/, "")
            .replace(/["”]\s*$/, "");
    }

    if (!content) return null;

    return { content, link, citationLabel };
}

export function normalizeCitationLabel(label: string): string {
    const cleaned = label.trim().replace(/\s+/g, " ");
    const yearMatch = cleaned.match(/(?:19|20)\d{2}[a-z]?/i);

    if (!yearMatch || yearMatch.index === undefined) {
        return cleaned || "Zotero";
    }

    const author = cleaned
        .slice(0, yearMatch.index)
        .trim()
        .replace(/[,，、;；\s]+$/u, "");

    return author ? `${author}, ${yearMatch[0]}` : yearMatch[0];
}
