import { EditorView, type ViewUpdate } from "@codemirror/view";
import {
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    editorInfoField,
} from "obsidian";

import {
    appendToTextCard,
    getCardElement,
    isTextCardData,
} from "./canvas";
import {
    formatParsedCitation,
    parseZoteroClipboard,
} from "./citation";
import {
    EDITOR_INSERT_PREFIX,
    EDITOR_INSERT_SUFFIX,
    MODES,
    POLL_INTERVAL,
    isCaptureMode,
    modeNoticeText,
    modeStatusText,
    type CaptureMode,
} from "./constants";
import type {
    AppendResult,
    CanvasEditorInfo,
    CanvasTextCard,
    CanvasView,
    ClipboardReader,
    PluginData,
    SelectedCardContext,
} from "./types";

const { clipboard } = require("electron") as {
    clipboard: ClipboardReader;
};

export default class MarginNoteStyleCanvasPlugin extends Plugin {
    mode: CaptureMode = MODES.EDITOR;

    private lastClipboardText = "";
    private activeCardEditor: EditorView | null = null;
    private activeCard: CanvasTextCard | null = null;
    private polling = false;
    private statusBarItem: HTMLElement | null = null;

    async onload(): Promise<void> {
        const saved = ((await this.loadData()) ?? {}) as PluginData;

        this.mode = isCaptureMode(saved.mode)
            ? saved.mode
            : saved.monitorEnabled === false
              ? MODES.OFF
              : MODES.EDITOR;

        this.lastClipboardText = clipboard.readText();

        this.registerEditorExtension([
            EditorView.updateListener.of((update) => {
                this.captureCanvasCardEditor(update);
            }),
        ]);

        this.addModeCommands();
        this.addSettingTab(new MarginNoteStyleCanvasSettingTab(this.app, this));

        this.registerDomEvent(
            document,
            "paste",
            (event) => this.handleSelectedCardPaste(event),
            true,
        );
        this.registerDomEvent(
            document,
            "drop",
            (event) => this.handleSelectedCardDrop(event),
            true,
        );

        this.statusBarItem = this.addStatusBarItem();
        this.statusBarItem.addEventListener("click", () => {
            void this.cycleMode();
        });
        this.updateStatusBar();

        this.registerInterval(
            window.setInterval(() => {
                void this.pollClipboardForEditorMode();
            }, POLL_INTERVAL),
        );
    }

    async setMode(mode: CaptureMode): Promise<void> {
        this.mode = mode;
        this.lastClipboardText = clipboard.readText();

        await this.saveData({ mode } satisfies PluginData);
        this.updateStatusBar();
        new Notice(modeNoticeText(mode));
    }

    private addModeCommands(): void {
        this.addCommand({
            id: "set-mode-editor",
            name: "Set mode: Editing Card auto capture",
            callback: () => void this.setMode(MODES.EDITOR),
        });

        this.addCommand({
            id: "set-mode-selected",
            name: "Set mode: Selected Card paste and drop",
            callback: () => void this.setMode(MODES.SELECTED),
        });

        this.addCommand({
            id: "turn-off",
            name: "Turn off",
            callback: () => void this.setMode(MODES.OFF),
        });

        this.addCommand({
            id: "cycle-mode",
            name: "Cycle mode",
            callback: () => void this.cycleMode(),
        });

        this.addCommand({
            id: "show-status",
            name: "Show status",
            callback: () => {
                const editorStatus = this.getUsableCardEditor()
                    ? "已捕获正在编辑的 Card"
                    : "尚未捕获正在编辑的 Card";

                new Notice(
                    `${modeNoticeText(this.mode)}；${editorStatus}`,
                    6000,
                );
            },
        });
    }

    private async cycleMode(): Promise<void> {
        const nextMode =
            this.mode === MODES.EDITOR
                ? MODES.SELECTED
                : this.mode === MODES.SELECTED
                  ? MODES.OFF
                  : MODES.EDITOR;

        await this.setMode(nextMode);
    }

    private captureCanvasCardEditor(update: ViewUpdate): void {
        let editorInfo: CanvasEditorInfo;

        try {
            editorInfo = update.state.field(
                editorInfoField,
            ) as unknown as CanvasEditorInfo;
        } catch {
            return;
        }

        if (editorInfo.node && update.view.hasFocus) {
            this.activeCardEditor = update.view;
            this.activeCard = editorInfo.node;
        }
    }

    private async pollClipboardForEditorMode(): Promise<void> {
        if (this.mode !== MODES.EDITOR || this.polling) return;

        this.polling = true;

        try {
            const text = clipboard.readText();

            if (!text || text === this.lastClipboardText) return;

            this.lastClipboardText = text;

            const parsed = parseZoteroClipboard(text);
            if (!parsed) return;

            const editor = this.getUsableCardEditor();

            if (!editor) {
                new Notice(
                    "已检测到 Zotero 引用，但没有正在编辑的 Canvas Card",
                );
                return;
            }

            const formattedText =
                EDITOR_INSERT_PREFIX +
                formatParsedCitation(parsed) +
                EDITOR_INSERT_SUFFIX;
            const selection = editor.state.selection.main;
            const from = selection.from;
            const to = selection.to;

            editor.dispatch({
                changes: { from, to, insert: formattedText },
                selection: { anchor: from + formattedText.length },
                scrollIntoView: true,
            });

            new Notice("✨ 已粘贴到正在编辑的 Canvas Card");
        } catch (error) {
            console.error(
                "MarginNote Style Canvas: editor auto capture",
                error,
            );
            new Notice("Canvas Card 编辑器自动粘贴失败，请查看开发者控制台");
        } finally {
            this.polling = false;
        }
    }

    private handleSelectedCardPaste(event: ClipboardEvent): void {
        if (this.mode !== MODES.SELECTED) return;

        const target = asElement(event.target);

        // Card 已进入 CodeMirror 时保留 Obsidian 的标准粘贴行为。
        if (target?.closest(".cm-editor")) return;

        const text = event.clipboardData?.getData("text/plain");
        if (!text) return;

        const context = this.getSingleSelectedTextCard();
        if (!context) return;

        const result = appendToTextCard(context, text);
        if (result.status === "ignored") return;

        event.preventDefault();
        event.stopPropagation();
        this.showSelectedModeResult(result, "粘贴");
    }

    private handleSelectedCardDrop(event: DragEvent): void {
        if (this.mode !== MODES.SELECTED) return;
        if (event.dataTransfer?.files.length) return;

        const text = event.dataTransfer?.getData("text/plain");
        if (!text) return;

        const context = this.getSingleSelectedTextCard();
        if (!context) return;

        const target = asElement(event.target);
        const dropCardElement = target?.closest<HTMLElement>(".canvas-node");
        const selectedCardElement = getCardElement(
            context.card,
            context.document,
        );

        if (
            !dropCardElement ||
            !selectedCardElement ||
            dropCardElement !== selectedCardElement
        ) {
            return;
        }

        const result = appendToTextCard(context, text);
        if (result.status === "ignored") return;

        event.preventDefault();
        event.stopPropagation();
        this.showSelectedModeResult(result, "拖拽");
    }

    private getSingleSelectedTextCard(): SelectedCardContext | null {
        const activeView = this.app.workspace.activeLeaf?.view as
            | CanvasView
            | undefined;

        if (activeView?.getViewType() !== "canvas" || !activeView.canvas) {
            return null;
        }

        const selection = Array.from(activeView.canvas.selection ?? []);
        if (selection.length !== 1) return null;

        const card = selection[0] as CanvasTextCard;
        const rawData = card.getData?.() ?? null;
        const data = rawData as Record<string, unknown> | null;

        if (!isTextCardData(data)) return null;

        return {
            canvas: activeView.canvas,
            card,
            data,
            document: activeView.containerEl.ownerDocument,
        };
    }

    private showSelectedModeResult(
        result: AppendResult,
        action: "粘贴" | "拖拽",
    ): void {
        if (result.status === "inserted") {
            new Notice(`✨ 已${action}并追加到所选 Canvas Card`);
        } else if (result.status === "unsupported") {
            new Notice("所选文本 Card 不提供可用的文本写入接口");
        } else if (result.status === "error") {
            new Notice(`${action}到所选 Canvas Card 失败，请查看开发者控制台`);
        }
    }

    private getUsableCardEditor(): EditorView | null {
        const editor = this.activeCardEditor;

        if (!editor || !this.activeCard) return null;

        if (!editor.dom.isConnected) {
            this.activeCardEditor = null;
            this.activeCard = null;
            return null;
        }

        const activeView = this.app.workspace.activeLeaf?.view;

        return activeView?.getViewType() === "canvas" ? editor : null;
    }

    private updateStatusBar(): void {
        if (!this.statusBarItem) return;

        this.statusBarItem.setText(modeStatusText(this.mode));
        this.statusBarItem.setAttribute(
            "aria-label",
            "MarginNote Style Canvas：点击切换模式",
        );
    }
}

class MarginNoteStyleCanvasSettingTab extends PluginSettingTab {
    constructor(
        app: MarginNoteStyleCanvasPlugin["app"],
        private readonly plugin: MarginNoteStyleCanvasPlugin,
    ) {
        super(app, plugin);
    }

    display(): void {
        this.containerEl.empty();

        new Setting(this.containerEl)
            .setName("Capture mode")
            .setDesc(
                "Choose editor auto-capture, selected Card paste/drop, or disable all interception.",
            )
            .addDropdown((dropdown) => {
                dropdown
                    .addOption(MODES.EDITOR, "Editing Card auto capture")
                    .addOption(MODES.SELECTED, "Selected Card paste and drop")
                    .addOption(MODES.OFF, "Off")
                    .setValue(this.plugin.mode)
                    .onChange(async (value) => {
                        if (!isCaptureMode(value)) return;
                        await this.plugin.setMode(value);
                    });
            });

        new Setting(this.containerEl)
            .setName("Citation output")
            .setDesc(
                "Zotero annotations are normalized to: excerpt [Author, Year](zotero://…).",
            );
    }
}

function asElement(target: EventTarget | null): Element | null {
    return target && typeof (target as Element).closest === "function"
        ? (target as Element)
        : null;
}
