import { execFileSync } from "node:child_process";
import {
    copyFileSync,
    mkdirSync,
    readFileSync,
    rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
    readFileSync(join(projectRoot, "manifest.json"), "utf8"),
);
const releaseDirectory = join(projectRoot, "releases");
const stagingRoot = join(projectRoot, ".release-tmp");
const stagingPlugin = join(stagingRoot, manifest.id);
const archive = join(
    releaseDirectory,
    `${manifest.id}-${manifest.version}.zip`,
);

rmSync(stagingRoot, { recursive: true, force: true });
mkdirSync(stagingPlugin, { recursive: true });
mkdirSync(releaseDirectory, { recursive: true });

for (const filename of [
    "main.js",
    "manifest.json",
    "versions.json",
    "README.md",
    "LICENSE",
]) {
    copyFileSync(
        join(projectRoot, filename),
        join(stagingPlugin, filename),
    );
}

rmSync(archive, { force: true });
execFileSync("zip", ["-r", "-q", archive, manifest.id], {
    cwd: stagingRoot,
});
rmSync(stagingRoot, { recursive: true, force: true });

console.log(`Created ${archive}`);
