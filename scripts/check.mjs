// Smoke check for the static site: file present, inline scripts parse.
import { readFileSync } from "node:fs";
import vm from "node:vm";
const html = readFileSync("site/index.html", "utf8");
if (!/<html[\s>]/i.test(html) || !/<\/html>\s*$/i.test(html)) throw new Error("index.html is not a complete HTML document");
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
if (!scripts.length) throw new Error("no inline scripts found");
scripts.forEach((code, i) => { new vm.Script(code, { filename: `inline-script-${i + 1}.js` }); });
console.log(`OK: ${(html.length / 1024).toFixed(0)} KB, ${scripts.length} inline script(s) parse`);
