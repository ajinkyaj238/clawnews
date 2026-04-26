import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

export async function readJsonFile<TSchema extends z.ZodTypeAny>(
  filePath: string,
  schema: TSchema
): Promise<z.output<TSchema>> {
  const raw = await readFile(filePath, "utf8");
  return schema.parse(JSON.parse(raw));
}

export async function writeJsonFile(filePath: string, value: unknown) {
  await ensureParentDirectory(filePath);
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function writeTextFile(filePath: string, value: string) {
  await ensureParentDirectory(filePath);
  await writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}

export function resolvePath(baseDir: string, filePath: string) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(baseDir, filePath);
}

async function ensureParentDirectory(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}
