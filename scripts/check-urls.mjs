import fs from "fs";

const t = fs.readFileSync("src/data/wateringRestrictions.ts", "utf8");
const cities = [];
const re =
  /id:\s*"([^"]+)"[\s\S]*?city:\s*"([^"]+)"[\s\S]*?sourceLabel:\s*"([^"]+)"[\s\S]*?sourceUrl:\s*(?:"([^"]+)"|(?:\n\s*"([^"]+)"))/g;
let m;
while ((m = re.exec(t)) !== null) {
  cities.push({
    id: m[1],
    city: m[2],
    label: m[3],
    url: m[4] || m[5],
  });
}

// Also stateFallback pattern
const sfRe =
  /stateFallback\(\s*"([^"]+)",\s*"([^"]+)",\s*"[^"]+",\s*"([^"]+)",\s*"([^"]+)"/g;
while ((m = sfRe.exec(t)) !== null) {
  if (!cities.find((c) => c.id === m[1])) {
    cities.push({ id: m[1], city: m[2], label: m[3], url: m[4] });
  }
}

const unique = [...new Map(cities.map((c) => [c.url, c])).entries()];
console.log(JSON.stringify(unique.map(([url, c]) => ({ url, sample: c.city })), null, 2));
