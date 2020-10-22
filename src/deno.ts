export interface Module {
  size: number;
  deps: string[];
}

interface DenoInfoOutput {
  module: string;
  local: string;
  fileType: string;
  compiled: string | null;
  map: string | null;
  depCount: number;
  totalSize: number;
  files: { [moduleSpecifier: string]: Module };
}

export class DenoError extends Error {
  name = "DenoError";
  constructor(message: string) {
    super(message);
  }
}

const decoder = new TextDecoder();

export async function runDenoInfo(specifier: string): Promise<DenoInfoOutput> {
  const cmd = ["deno", "info", "--json", "--unstable", specifier];
  const proc = Deno.run({
    cmd,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });
  const stdout = decoder.decode(await proc.output());
  const stderr = decoder.decode(await proc.stderrOutput());
  const status = await proc.status();
  proc.close();
  if (!status.success) {
    throw new DenoError(
      `Failed to run '${
        cmd.join(" ")
      }' (error code ${status.code}): ${stderr.trim()}`,
    );
  }
  return JSON.parse(stdout);
}
