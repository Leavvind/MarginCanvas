export const PLUGIN_ID = "margin-canvas";

export const MODES = {
    EDITOR: "editor",
    SELECTED: "selected",
    OFF: "off",
} as const;

export type CaptureMode = (typeof MODES)[keyof typeof MODES];

export const POLL_INTERVAL = 800;
export const EDITOR_INSERT_PREFIX = "\n";
export const EDITOR_INSERT_SUFFIX = "\n";

export function isCaptureMode(value: unknown): value is CaptureMode {
    return Object.values(MODES).includes(value as CaptureMode);
}

export function modeNoticeText(mode: CaptureMode): string {
    if (mode === MODES.EDITOR) {
        return "🟢 模式：正在编辑的 Canvas Card 自动捕捉";
    }

    if (mode === MODES.SELECTED) {
        return "🟠 模式：所选 Canvas Card 粘贴/拖拽追加";
    }

    return "🛑 MarginCanvas 已关闭";
}

export function modeStatusText(mode: CaptureMode): string {
    const labels: Record<CaptureMode, string> = {
        [MODES.EDITOR]: "MNS Canvas: Editing Card",
        [MODES.SELECTED]: "MNS Canvas: Selected Card",
        [MODES.OFF]: "MNS Canvas: Off",
    };

    return labels[mode];
}

export function modeMenuLabel(mode: CaptureMode): string {
    const labels: Record<CaptureMode, string> = {
        [MODES.EDITOR]: "Editing Card auto capture",
        [MODES.SELECTED]: "Selected Card paste and drop",
        [MODES.OFF]: "Off",
    };

    return labels[mode];
}

export function modeRibbonIcon(mode: CaptureMode): string {
    const icons: Record<CaptureMode, string> = {
        [MODES.EDITOR]: "square-pen",
        [MODES.SELECTED]: "mouse-pointer-click",
        [MODES.OFF]: "circle-off",
    };

    return icons[mode];
}

export function modeRibbonTooltip(mode: CaptureMode): string {
    return `MarginCanvas: ${modeMenuLabel(mode)}（点击切换）`;
}
