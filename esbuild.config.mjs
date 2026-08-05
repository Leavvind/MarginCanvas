import esbuild from "esbuild";

const production = process.argv[2] === "production";

const context = await esbuild.context({
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: [
        "obsidian",
        "electron",
        "@codemirror/state",
        "@codemirror/view",
        "@codemirror/language",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
    ],
    format: "cjs",
    platform: "browser",
    target: "es2018",
    logLevel: "info",
    sourcemap: production ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
});

if (production) {
    await context.rebuild();
    await context.dispose();
} else {
    await context.watch();
}
