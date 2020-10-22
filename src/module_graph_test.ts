import { assert } from "https://deno.land/std@0.74.0/testing/asserts.ts";
import { assertEquals } from "../test_deps.ts";
import { isTestModule, ModuleGraph } from "./module_graph.ts";

Deno.test("module graph", async () => {
  const graph = new ModuleGraph();
  await graph.addModule("https://deno.land/std@0.74.0/io/ioutil.ts");
  await graph.addModule("https://deno.land/std@0.74.0/io/writers_test.ts");
  await graph.addModule("https://deno.land/std@0.74.0/io/writers.ts");

  assertEquals(graph.get("https://deno.land/std@0.74.0/io/readers.ts"), {
    deps: ["https://deno.land/std@0.74.0/encoding/utf8.ts"],
    size: 1756,
  });

  const publicGraph = graph.withoutPrivateAndTestEntrypoints(
    "https://deno.land/std@0.74.0/io/",
  );

  assertEquals(
    publicGraph.importDepth("https://deno.land/std@0.74.0/io/writers_test.ts"),
    undefined,
  );
  assertEquals(
    publicGraph.importDepth("https://deno.land/std@0.74.0/io/writers.ts"),
    0,
  );
  assertEquals(
    publicGraph.importDepth("https://deno.land/std@0.74.0/encoding/utf8.ts"),
    1,
  );

  const subgraph = graph.subgraph(
    ["https://deno.land/std@0.74.0/io/readers.ts"],
  );
  assert(subgraph);
  assertEquals(
    subgraph.get("https://deno.land/std@0.74.0/encoding/utf8.ts"),
    { deps: [], size: 509 },
  );

  assertEquals(graph.modules(), [
    "https://deno.land/std@0.74.0/_util/assert.ts",
    "https://deno.land/std@0.74.0/bytes/mod.ts",
    "https://deno.land/std@0.74.0/io/bufio.ts",
    "https://deno.land/std@0.74.0/io/ioutil.ts",
    "https://deno.land/std@0.74.0/encoding/utf8.ts",
    "https://deno.land/std@0.74.0/fmt/colors.ts",
    "https://deno.land/std@0.74.0/io/readers.ts",
    "https://deno.land/std@0.74.0/io/writers.ts",
    "https://deno.land/std@0.74.0/testing/_diff.ts",
    "https://deno.land/std@0.74.0/testing/asserts.ts",
  ]);
});

Deno.test("is test module", () => {
  assertEquals(
    isTestModule("https://deno.land/std@0.74.0/io/writers_test.ts"),
    true,
  );
  assertEquals(
    isTestModule("https://deno.land/std@0.74.0/io/readers.ts"),
    false,
  );
});
