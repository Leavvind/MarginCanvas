# MarginNote Style Canvas

MarginNote Style Canvas brings a MarginNote-like research capture workflow to
Obsidian Canvas: By improving the experience of sending excerpts to Node(Cancvas text notes). 

## Modes

### Editing Card auto capture

1. Enter edit mode in a Canvas text Card and place the cursor.
2. Switch to Zotero and copy an annotation.
3. The excerpt is inserted at the remembered cursor position.

Zotero Markdown such as:

```text
“Quoted text” ([Smith et al., 2024, p. 17](zotero://open-pdf/...))
```

becomes:

```text
Quoted text [Smith et al., 2024](zotero://open-pdf/...)
```

### Selected Card paste and drop

Select exactly one Canvas text Card without entering its editor:

- `Cmd/Ctrl+V` appends plain text at the end of the Card.
- Dropping plain text onto that selected Card appends it at the end.
- Zotero annotations use the same normalized citation format shown above.
- Native paste remains unchanged when the Card is already being edited.

This mode intentionally ignores images, PDFs, operating-system files, file
Cards, link Cards, groups, edges, and multi-selection.

### Off

Clipboard monitoring and selected-Card paste/drop interception are disabled.

## Switching modes

Use any of these surfaces:

- Settings → **MarginNote Style Canvas** → **Capture mode**
- Click the status-bar mode label
- Command Palette:
  - `MarginNote Style Canvas: Set mode: Editing Card auto capture`
  - `MarginNote Style Canvas: Set mode: Selected Card paste and drop`
  - `MarginNote Style Canvas: Turn off`
  - `MarginNote Style Canvas: Cycle mode`
  - `MarginNote Style Canvas: Show status`

The selected mode persists across restarts.

## Development

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev       # watch and rebuild main.js
npm run check     # typecheck, tests, production build
npm run package   # verify and create releases/*.zip
```

Project layout:

```text
src/main.ts       Plugin lifecycle, commands, settings, event handling
src/citation.ts   Zotero parsing and citation normalization
src/canvas.ts     Selected-Card append behavior
tests/            Unit tests for parsing and append behavior
```

## Compatibility and API stability

Obsidian does not currently expose a stable public Canvas runtime API for all
operations used here. The plugin therefore relies on runtime Canvas objects and
`editorInfoField.node`. These interfaces can require adjustment after an
Obsidian update.

## License

MIT. See [LICENSE](LICENSE).
