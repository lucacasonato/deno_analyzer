import * as fs from "https://deno.land/std@0.74.0/fs/mod.ts";
import { analyze, ModuleGraph } from "./mod.ts";

const walker = fs.walk(
  ".",
  {
    includeFiles: true,
    includeDirs: false,
    exts: ["js", "mjs", "ts", "jsx", "tsx"],
  },
);

const moduleGraph = new ModuleGraph();

for await (const entry of walker) {
  await moduleGraph.addModule(entry.path);
}

const metrics = await analyze(
  { moduleGraph, base: new URL(`file:///${Deno.cwd()}`).toString() },
);

console.log(metrics);
