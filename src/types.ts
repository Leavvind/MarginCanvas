import type { EditorView } from "@codemirror/view";
import type { ItemView } from "obsidian";

import type { CaptureMode } from "./constants";

export interface PluginData {
    mode?: CaptureMode;
    monitorEnabled?: boolean;
}

export interface CanvasTextCardData {
    id?: string;
    type: "text";
    text: string;
    [key: string]: unknown;
}

export interface CanvasTextCard {
    id?: string;
    nodeEl?: HTMLElement;
    containerEl?: HTMLElement;
    contentEl?: HTMLElement;
    getData?: () => CanvasTextCardData | Record<string, unknown>;
    setData?: (data: CanvasTextCardData, addHistory?: boolean) => void;
    setText?: (text: string) => void;
}

export interface CanvasRuntime {
    selection?: Set<unknown>;
    requestSave?: () => void;
}

export interface CanvasView extends ItemView {
    canvas?: CanvasRuntime;
}

export interface SelectedCardContext {
    canvas: CanvasRuntime;
    card: CanvasTextCard;
    data: CanvasTextCardData;
    document: Document;
}

export interface CanvasEditorInfo {
    node?: CanvasTextCard;
}

export interface ActiveCanvasEditor {
    editor: EditorView;
    card: CanvasTextCard;
}

export type AppendStatus = "inserted" | "ignored" | "unsupported" | "error";

export interface AppendResult {
    status: AppendStatus;
}

export interface ClipboardReader {
    readText(): string;
}
