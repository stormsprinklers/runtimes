import fs from "fs";

const t = fs.readFileSync("src/data/wateringRestrictions.ts", "utf8");
const urlRe = /sourceUrl:\s*(?:"([^"]+)"|\n\s*"([^"]+)")/g;
const urls = new Set();
let m;
while ((m = urlRe.exec(t)) !== null) {
  urls.add(m[1] || m[2]);
}

const results = [];
for (const url of urls) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    results.push({
      url,
      status: res.status,
      ok: res.ok,
      final: res.url,
    });
  } catch (e) {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
      });
      results.push({
        url,
        status: res.status,
        ok: res.ok,
        final: res.url,
        via: "GET",
      });
    } catch (e2) {
      results.push({ url, status: "ERR", ok: false, error: String(e2.message) });
    }
  }
}

const broken = results.filter((r) => !r.ok);
const ok = results.filter((r) => r.ok);
console.log("OK:", ok.length, "BROKEN:", broken.length);
for (const b of broken) console.log(JSON.stringify(b));
console.log("\n--- OK ---");
for (const o of ok) console.log(o.status, o.url);
