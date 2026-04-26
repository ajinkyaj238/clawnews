import { z } from "zod";
import { access } from "node:fs/promises";
import { buildBrief } from "../brief.js";
import { generateEventFromArticles } from "../eventGeneration.js";
import { readJsonFile, writeJsonFile, writeTextFile } from "../io.js";
import {
  ArticleSchema,
  SourceProfileSchema,
  TopicSchema
} from "../schemas.js";
import { parseCliArgs } from "./args.js";

const DEFAULT_TOPIC_PATH = "../../data/sample-topic.json";
const DEFAULT_ARTICLES_PATHS = [
  "../../artifacts/articles.latest.json",
  "../../data/sample_articles.json",
  "../../data/articles.json"
];
const DEFAULT_SOURCES_PATHS = [
  "../../data/source_profiles.seed.json",
  "../../data/source-profiles.json"
];
const DEFAULT_OUT_PATH = "../../artifacts/sample-event.json";
const DEFAULT_BRIEF_OUT_PATH = "../../artifacts/sample-brief.md";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const topicPath = args.get("topic") ?? DEFAULT_TOPIC_PATH;
  const articlesPath =
    args.get("articles") ?? (await firstExisting(DEFAULT_ARTICLES_PATHS));
  const sourcesPath =
    args.get("sources") ?? (await firstExisting(DEFAULT_SOURCES_PATHS));
  const outPath = args.get("out") ?? DEFAULT_OUT_PATH;
  const briefOutPath = args.get("brief-out") ?? DEFAULT_BRIEF_OUT_PATH;
  const generatedAt = args.get("generated-at");

  const topic = await readJsonFile(topicPath, TopicSchema);
  const articles = await readJsonFile(articlesPath, z.array(ArticleSchema));
  const sourceProfiles = await readJsonFile(
    sourcesPath,
    z.array(SourceProfileSchema)
  );
  const event = generateEventFromArticles({
    topic,
    articles,
    sourceProfiles,
    generatedAt
  });

  await writeJsonFile(outPath, event);

  if (briefOutPath) {
    await writeTextFile(briefOutPath, buildBrief(event));
  }

  console.log(
    `Generated ${outPath} with ${event.articles.length} article(s), ${event.sourceComparisons.length} comparison(s), and ${event.auditFindings.length} audit finding(s).`
  );
}

async function firstExisting(paths: string[]) {
  for (const candidate of paths) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return paths.at(-1) ?? "";
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
