import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "node:test";
import { activate, deactivate } from "./index.mjs";

const manifest = JSON.parse(
  await readFile(new URL("./plugin.json", import.meta.url), "utf8"),
);
const archive = fileURLToPath(
  new URL(
    `../../packages/${manifest.id}-${manifest.version}.tep`,
    import.meta.url,
  ),
);
const tar =
  process.platform === "win32" ? "C:/Windows/System32/tar.exe" : "tar";
const run = promisify(execFile);

test("migration preserves the plugin entry, identity and Matsuki attribution", () => {
  assert.equal(manifest.id, "com.twilightecho.tool.wallpaper-engine");
  assert.equal(manifest.version, "2.1.0");
  assert.equal(manifest.author, "Matsuki");
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.main, "index.mjs");
  assert.equal(manifest.apiVersion, 3);
  assert.equal(typeof activate, "function");
  assert.equal(typeof deactivate, "function");
});

test("TEP includes the full runtime and reference bridge, but no app installer", async () => {
  const { stdout: json } = await run(tar, ["-xOf", archive, "plugin.json"]);
  assert.deepEqual(JSON.parse(json), manifest);
  const { stdout } = await run(tar, ["-tf", archive]);
  const files = new Set(
    stdout
      .trim()
      .split(/\r?\n/)
      .map((name) => name.replace(/^\.\//, "")),
  );
  for (const entry of [
    "plugin.json",
    "index.mjs",
    "package.json",
    "README.md",
    "THIRD_PARTY_NOTICES.md",
    "lib/we-props.js",
    "lib/scene-manifest.js",
    "lib/scene-player.js",
    "lib/vendor-jpeg-js/package.json",
    "lib/vendor-jpeg-js/index.js",
    "lib/vendor-jpeg-js/lib/decoder.js",
    "lib/vendor-jpeg-js/lib/encoder.js",
    "lib/vendor-jpeg-js/LICENSE",
    "lib/webwallgl/index.html",
    "lib/webwallgl/renderer.js",
    "lib/webwallgl/occlusion-bridge.js",
    "lib/webwallgl/engine/webwallgl.global.min.js",
    "lib/webwallgl/default-wallpaper/index.html",
    "bridge/we-background.js",
    "docs/TE-PATCH.md",
  ])
    assert.ok(files.has(entry), `missing packaged dependency: ${entry}`);
  for (const entry of [
    "bridge/install.mjs",
    "scripts/check-compat.mjs",
    "AGENTS.md",
    "index.test.mjs",
  ]) {
    assert.equal(
      files.has(entry),
      false,
      `development tool leaked into TEP: ${entry}`,
    );
  }
  const { stdout: moduleJson } = await run(tar, [
    "-xOf",
    archive,
    "package.json",
  ]);
  assert.equal(JSON.parse(moduleJson).type, "module");
});
