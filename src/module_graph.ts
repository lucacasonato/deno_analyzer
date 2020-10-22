import { Module, runDenoInfo } from "./deno.ts";

export class ModuleGraph {
  #inner: { [specifier: string]: Module };

  constructor(base: { [specifier: string]: Module } = {}) {
    this.#inner = base;
  }

  async addModule(specifier: string): Promise<void> {
    if (!this.get(specifier)) {
      const info = await runDenoInfo(specifier);
      Object.assign(this.#inner, info.files);
    }
  }

  get(specifier: string): Module | undefined {
    return this.#inner[specifier];
  }

  subgraph(specifiers: string[]): ModuleGraph {
    const subgraph: { [specifier: string]: Module } = {};
    function recursive(mg: ModuleGraph, specifier: string) {
      if (!subgraph[specifier]) {
        const entry = mg.get(specifier);
        if (!entry) {
          throw new Error(`Missing entry ${specifier} in module graph.`);
        }
        subgraph[specifier] = entry;
        for (const dep of entry.deps) {
          recursive(mg, dep);
        }
      }
    }
    for (const specifier of specifiers) {
      recursive(this, specifier);
    }
    return new ModuleGraph(subgraph);
  }

  export(): { [specifier: string]: Module } {
    return this.#inner;
  }

  modules(): string[] {
    return Object.keys(this.#inner);
  }

  private _entrypoints(): string[] {
    const specifiers = new Set(Object.keys(this.#inner));
    for (const specifier in this.#inner) {
      const module = this.#inner[specifier];
      for (const specifier of module.deps) {
        specifiers.delete(specifier);
      }
    }
    return [...specifiers];
  }

  importDepth(specifier: string): number | undefined {
    if (!this.get(specifier)) return undefined;
    let toVisit = [specifier];
    const visited: string[] = [];
    let depth = 0;
    let done = false;
    while (!done) {
      const newToVisit = [];
      for (const specifier of toVisit) {
        visited.push(specifier);
        const parents = this.modules().filter((m) => {
          if (visited.includes(m)) return false;
          const module = this.#inner[m];
          return module.deps.includes(specifier);
        });
        if (specifier.endsWith("asserts.ts")) console.log(specifier, parents);
        if (parents.length === 0) {
          done = true;
          break;
        }
        newToVisit.push(...parents);
      }
      toVisit = newToVisit;
      if (!done) depth++;
    }
    return depth;
  }

  withoutPrivateAndTestEntrypoints(base: string): ModuleGraph {
    let inner = this.#inner;
    let done = false;
    while (!done) {
      const entrypoints = new ModuleGraph(inner)._entrypoints();
      const testOrPrivateEntrypoints = entrypoints.filter((s) =>
        isTestModule(s) || isPrivate(s)
      );
      done = testOrPrivateEntrypoints.length === 0;
      for (const specifier of testOrPrivateEntrypoints) {
        delete inner[specifier];
      }
      const based = filterBase(Object.keys(inner), base);
      inner = new ModuleGraph(inner).subgraph(based).export();
    }
    return new ModuleGraph(inner);
  }
}

const TEST_MODULE_REGEXP = new RegExp(/(.*(_|\.))?test\.(js|mjs|ts|jsx|tsx)/);

export function isTestModule(specifier: string): boolean {
  return TEST_MODULE_REGEXP.test(specifier) ||
    specifier.includes("/tests/");
}

export function isPrivate(specifier: string): boolean {
  return specifier.includes("/_") || specifier.includes("/testdata/");
}

export function filterBase(modules: string[], base: string): string[] {
  return modules.filter((specifier) => specifier.startsWith(base));
}

export function filterPublic(modules: string[]): string[] {
  return modules.filter((specifier) => !isPrivate(specifier));
}
