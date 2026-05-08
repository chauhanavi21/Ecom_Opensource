const fs = require("fs");
const path = require("path");

/** Drop nested rxjs copies so TypeScript resolves a single Observable type from the repo root. */
const roots = [
  path.join(__dirname, "..", "user", "frontend"),
  path.join(__dirname, "..", "admin", "frontend"),
];

for (const root of roots) {
  const rxjs = path.join(root, "node_modules", "rxjs");
  if (fs.existsSync(rxjs)) {
    fs.rmSync(rxjs, { recursive: true, force: true });
    console.log("Pruned nested rxjs:", rxjs);
  }
}
