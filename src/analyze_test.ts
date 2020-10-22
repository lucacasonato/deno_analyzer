import { assertEquals } from "../test_deps.ts";
import { ModuleGraph } from "../mod.ts";
import { analyze } from "./analyze.ts";

Deno.test("analyze std", async () => {
  const moduleGraph = new ModuleGraph();
  await moduleGraph.addModule("https://deno.land/std@0.74.0/fs/mod.ts");
  await moduleGraph.addModule(
    "https://deno.land/std@0.74.0/io/mod.ts",
  );

  assertEquals(
    await analyze({ moduleGraph, base: "https://deno.land/std@0.74.0/" }),
    {
      suspectedEntrypoints: [
        "https://deno.land/std@0.74.0/path/mod.ts",
        "https://deno.land/std@0.74.0/fs/mod.ts",
        "https://deno.land/std@0.74.0/io/mod.ts",
      ],
    },
  );
});
