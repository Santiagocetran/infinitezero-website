import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Production invariants: bounded local JS, no remote page resources, working local paths,
// branch-correct onboarding links, and a small total transfer budget.
const output = new URL("../dist/", import.meta.url);
const html = await readFile(new URL("index.html", output), "utf8");
const base = (process.env.SITE_BASE || "/").replace(/\/$/, "");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, "duplicate IDs");
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
  assert(ids.includes(id), `missing fragment #${id}`);
}
assert(!/\bon\w+=|<iframe\b/i.test(html), "inline handlers or embeds");
for (const [, resource] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^https?:/.test(resource) || resource.startsWith("#")) continue;
  assert(resource.startsWith(`${base}/`), `asset outside base: ${resource}`);
  const file = resolve(fileURLToPath(output), resource.slice(base.length + 1));
  assert(file.startsWith(fileURLToPath(output)), "asset outside output");
  assert((await stat(file)).isFile(), `missing local asset: ${resource}`);
}
assert(
  !/<(?:img|link|script)[^>]+(?:src|href)="https?:/i.test(
    html.replace(/<link\b(?=[^>]*\brel="canonical")[^>]*>/gi, ""),
  ),
  "remote subresource",
);
for (const path of [
  "blob/main/Documentation/GettingStarted.md",
  "blob/develop/Documentation/public/what-can-be-trained.md",
  "blob/develop/Documentation/public/guides/client-onboarding.md",
  "blob/develop/Documentation/public/services.md",
  "blob/develop/Developer/CONTRIBUTING.md",
])
  assert(
    html.includes(`https://github.com/InfiniteZeroFoundation/DevNet/${path}`),
    `missing official path ${path}`,
  );
assert.equal(
  (html.match(/<h1\b/g) || []).length,
  1,
  "exactly one page heading",
);
assert(
  html.includes('lang="en"') && html.includes("Skip to content"),
  "language/skip link",
);
let bytes = 0;
let scriptBytes = [
  ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g),
].reduce((total, match) => total + Buffer.byteLength(match[1]), 0);
async function inspect(dir) {
  for (const file of await readdir(dir, { withFileTypes: true })) {
    const url = new URL(file.name + (file.isDirectory() ? "/" : ""), dir);
    if (file.isDirectory()) await inspect(url);
    else {
      if (file.name.endsWith(".js")) scriptBytes += (await stat(url)).size;
      bytes += (await stat(url)).size;
      if (file.name.endsWith(".css")) {
        const css = await readFile(url, "utf8");
        assert(
          !/@import|url\(\s*["']?(?:https?:|\/\/)/i.test(css),
          "remote CSS dependency",
        );
      }
    }
  }
}
await inspect(output);
assert(scriptBytes < 8_000, `client JavaScript exceeds 8 kB: ${scriptBytes}`);
assert(bytes < 750_000, `static output exceeds 750 kB: ${bytes}`);
assert(
  (await stat(new URL("preview.png", output))).isFile(),
  "social preview missing",
);
assert((await stat(new URL("404.html", output))).isFile(), "404 missing");
console.log(
  `PASS: fragments, local assets (base ${base || "/"}), official onboarding paths, ${scriptBytes} bytes local JS, no remote resources; ${bytes} bytes total output.`,
);
