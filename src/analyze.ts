import { path } from "../deps.ts";
import { filterBase, filterPublic, ModuleGraph } from "./module_graph.ts";

export interface AnalyzeData {
  moduleGraph: ModuleGraph;
  base: string;
}

export interface Metrics {
  suspectedEntrypoints: string[];
}

const ENTRYPOINT_NAMES = ["mod", "main", "index"];

export async function analyze(data: AnalyzeData): Promise<Metrics> {
  const publicGraph = data.moduleGraph
    .withoutPrivateAndTestEntrypoints(data.base);

  const localModules = filterPublic(
    filterBase(publicGraph.modules(), data.base),
  );

  const suspectedEntrypoints = localModules
    .filter((specifier) => {
      const depth = publicGraph.importDepth(specifier)!;
      if (specifier.endsWith("asserts.ts")) console.log(specifier, depth);
      return depth === 0 ||
        (depth <= 1 && ENTRYPOINT_NAMES.includes(filename(specifier)));
    });

  return {
    suspectedEntrypoints,
  };
}

function filename(p: string): string {
  return path.basename(p, path.extname(p));
}
