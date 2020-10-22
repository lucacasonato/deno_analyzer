import { assertEquals, assertThrowsAsync } from "../test_deps.ts";
import { DenoError, runDenoInfo } from "./deno.ts";

Deno.test("run deno info", async () => {
  const response = await runDenoInfo(
    "https://deno.land/std@0.74.0/async/mod.ts",
  );
  assertEquals({ ...response, compiled: undefined, local: undefined }, {
    compiled: undefined,
    depCount: 4,
    fileType: "TypeScript",
    files: {
      "https://deno.land/std@0.74.0/async/deferred.ts": {
        deps: [],
        size: 1058,
      },
      "https://deno.land/std@0.74.0/async/delay.ts": {
        deps: [],
        size: 279,
      },
      "https://deno.land/std@0.74.0/async/mod.ts": {
        deps: [
          "https://deno.land/std@0.74.0/async/deferred.ts",
          "https://deno.land/std@0.74.0/async/delay.ts",
          "https://deno.land/std@0.74.0/async/mux_async_iterator.ts",
          "https://deno.land/std@0.74.0/async/pool.ts",
        ],
        size: 202,
      },
      "https://deno.land/std@0.74.0/async/mux_async_iterator.ts": {
        deps: ["https://deno.land/std@0.74.0/async/deferred.ts"],
        size: 2032,
      },
      "https://deno.land/std@0.74.0/async/pool.ts": {
        deps: [],
        size: 1614,
      },
    },
    local: undefined,
    map: null,
    module: "https://deno.land/std@0.74.0/async/mod.ts",
    totalSize: 5185,
  });
});

Deno.test("run deno info failure", async () => {
  await assertThrowsAsync(
    () => runDenoInfo("does://not.exist"),
    DenoError,
    `Failed to run 'deno info --json --unstable does://not.exist' (error code 1)`,
  );
});
