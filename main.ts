// A single loading-screen tip for stressed developers and AI coding agents.
// Writes the tip to $MAKEFUN_OUTPUT_DIR/entry.txt with no trailing newline
// and prints the same line (plus a newline) to stdout. Node 22, stdlib only.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TIP =
  "Tip: your AI agent just rewrote this file three times and still believes in the plan. Borrow its confidence — the build will pass.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), TIP, "utf8");
process.stdout.write(TIP + "\n");
