import { z } from "zod";
import {
  readJsonFile,
  resolvePath,
  writeJsonFile,
  writeTextFile
} from "../io.js";

export class LocalZeroClawAdapter {
  constructor(private readonly baseDir = process.cwd()) {}

  path(filePath: string) {
    return resolvePath(this.baseDir, filePath);
  }

  readJson<TSchema extends z.ZodTypeAny>(filePath: string, schema: TSchema) {
    return readJsonFile(this.path(filePath), schema);
  }

  writeJson(filePath: string, value: unknown) {
    return writeJsonFile(this.path(filePath), value);
  }

  writeText(filePath: string, value: string) {
    return writeTextFile(this.path(filePath), value);
  }
}
