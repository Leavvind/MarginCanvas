# Changelog

All notable changes to MarginCanvas are documented here.

## 0.5.0 - 2026-10-09

### Changed

- Renamed the plugin to **MarginCanvas** (id `margin-canvas`).
  Obsidian treats this as a new plugin: disable and remove the old
  `marginnote-style-canvas` folder, then re-select your capture mode.
- Installable through BRAT from GitHub Releases.

## 0.4.0 - 2026-08-05

### Added

- Formal project identity: `marginnote-style-canvas` / MarginNote Style Canvas.
- TypeScript source split into plugin, citation, and Canvas modules.
- Discoverable settings dropdown for the three capture modes.
- Clickable status-bar mode cycling.
- Type checking, unit tests, production build, CI, and release packaging.
- Migration documentation for the prototype plugin ID.

### Preserved

- Editing-Card Zotero clipboard capture.
- Selected-Card paste and text-drop append mode.
- Off mode and persisted mode selection.
- Citation output in `excerpt [Author, Year](zotero://...)` form.

## 0.3.0 - 2026-08-04

- Replaced the placeholder citation label with the Zotero author-year label.
- Removed page locators from displayed citation labels.

## 0.2.0 - 2026-08-04

- Added editor, selected-Card, and off modes.
- Added paste and text-drop handling for one selected text Card.

## 0.1.0 - 2026-08-04

- Initial working editor-mode Zotero capture prototype.
