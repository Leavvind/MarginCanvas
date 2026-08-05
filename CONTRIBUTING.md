# Contributing

## Local checks

Before submitting a change, run:

```bash
npm run check
```

Changes to `manifest.json` must be mirrored in `package.json` and
`versions.json`. Add an entry to `CHANGELOG.md` for user-visible changes.

## Canvas runtime changes

Canvas runtime APIs are not fully public. Keep runtime type assertions isolated
in `src/types.ts` and add a regression test for any parsing or append behavior
that can be exercised without Obsidian.

## Release

1. Update the version in `manifest.json` and `package.json`.
2. Add the version and minimum Obsidian version to `versions.json`.
3. Update `CHANGELOG.md`.
4. Run `npm run package`.
5. Test the generated archive in a clean Obsidian vault.
