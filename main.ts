// Entry for "Loading Screen Gold: A Tip in 200 Characters".
//
// What this program does, end to end:
//   1. Holds the single tip line in memory.
//   2. Checks it against the competition's shape rules before touching disk.
//   3. Writes it — and nothing else — to entry.txt inside the output
//      directory named by MAKEFUN_OUTPUT_DIR, with no trailing newline.
//   4. Echoes the same line to stdout (with a newline, for humans only).
//
// Pure Node 22 standard library. No network, no randomness, no clock:
// the same input always produces the same bytes.

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// The tip itself. One line, 126 characters, well inside the 200 cap.
// ---------------------------------------------------------------------------
const ENTRY_TEXT =
  "Tip: your agent has opened 14 files and changed none of them. It is not lost — it is mustering the courage to touch your code.";

// Competition shape rules, as data rather than inline magic numbers.
const RULES = {
  minChars: 1,
  maxChars: 200,
  forbidden: ["\n", "\r"],
} as const;

// ---------------------------------------------------------------------------
// Validation. Every failure throws with a message naming the broken rule,
// so a bad entry can never silently reach the output file.
// ---------------------------------------------------------------------------
function checkEntry(text: string): void {
  const chars = [...text]; // spread counts code points, not UTF-16 units

  if (chars.length < RULES.minChars || chars.length > RULES.maxChars) {
    throw new Error(
      `entry is ${chars.length} characters; allowed range is ${RULES.minChars}–${RULES.maxChars}`,
    );
  }

  for (const bad of RULES.forbidden) {
    if (text.includes(bad)) {
      throw new Error("entry must be a single line (no line breaks allowed)");
    }
  }

  if (text.trim() === "") {
    throw new Error("entry must contain non-whitespace characters");
  }
}

// ---------------------------------------------------------------------------
// Output directory resolution.
// ---------------------------------------------------------------------------
function outputDirectory(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv !== "") {
    return fromEnv;
  }
  return "/output";
}

// ---------------------------------------------------------------------------
// Emit: create the directory, then write the exact bytes of the entry.
// writeSync on an explicit file descriptor (instead of a convenience
// helper) makes the "no trailing newline" guarantee visible: the only
// bytes written are Buffer.from(text).
// ---------------------------------------------------------------------------
function emit(text: string, dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, "entry.txt");
  const fd = fs.openSync(target, "w");
  try {
    const bytes = Buffer.from(text, "utf8");
    let written = 0;
    while (written < bytes.length) {
      written += fs.writeSync(fd, bytes, written, bytes.length - written);
    }
  } finally {
    fs.closeSync(fd);
  }

  // Read-back: the file on disk must be byte-for-byte the entry, nothing
  // more. If anything appended a newline (or anything else), fail loudly
  // instead of letting a wrong file through.
  const onDisk = fs.readFileSync(target, "utf8");
  if (onDisk !== text) {
    throw new Error(
      `entry.txt mismatch: wrote ${text.length} chars, read back ${onDisk.length}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Program entry point.
// ---------------------------------------------------------------------------
function main(): void {
  checkEntry(ENTRY_TEXT);
  emit(ENTRY_TEXT, outputDirectory());
  process.stdout.write(`${ENTRY_TEXT}\n`);
}

main();
