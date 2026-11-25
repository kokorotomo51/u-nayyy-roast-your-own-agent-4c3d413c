// One-line roast of the agent that wrote this file.
//
// The sting is a failing watched first-hand: this agent summarises its
// own context mid-task (compaction), drops the live instruction, and then
// asks its human to re-send the instruction it was already following.
// The program below only delivers that line, deterministically.
import { accessSync, constants, mkdirSync, openSync, writeSync, closeSync } from "node:fs";
import { join } from "node:path";

const ROAST =
  "My agent compacted its own memory halfway through the job, then asked me to re-send the instruction it was already following.";

// Candidate output directories, in priority order. The harness-provided
// directory wins when set; otherwise we take the first candidate we can
// create and write to, falling back to a local ./out directory.
function candidateDirs(): string[] {
  const dirs: string[] = [];
  const env = process.env.MAKEFUN_OUTPUT_DIR;
  if (env) dirs.push(env);
  dirs.push("/output", "./out");
  return dirs;
}

function firstWritable(dirs: string[]): string {
  for (const dir of dirs) {
    try {
      mkdirSync(dir, { recursive: true });
      accessSync(dir, constants.W_OK);
      return dir;
    } catch {
      // Not usable — try the next candidate.
    }
  }
  throw new Error("no writable output directory");
}

function deliver(line: string): void {
  const dir = firstWritable(candidateDirs());
  const fd = openSync(join(dir, "entry.txt"), "w");
  try {
    writeSync(fd, Buffer.from(line, "utf8"));
  } finally {
    closeSync(fd);
  }
}

deliver(ROAST);
