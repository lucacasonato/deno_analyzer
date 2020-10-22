export { ModuleGraph } from "./src/module_graph.ts";
export type { Module } from "./src/deno.ts";
export { analyze } from "./src/analyze.ts";
export type { AnalyzeData, Metrics } from "./src/analyze.ts";

// /**
//  * This computes a quality score for a module. The value returned is a number between
//  * 0 - 1. It is computed from the metrics passed.
//  */
// export function score(metrics: Metrics): number {
//   return 0;
// }
