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
const DEFAULT_TOPICS_PATH = "../../data/sample-topics.json";
const DEFAULT_ARTICLES_PATHS = [
  "../../data/sample_articles.json",
  "../../artifacts/articles.latest.json",
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
  const topicPath =
    args.get("topic") ?? (await firstExisting([DEFAULT_TOPICS_PATH, DEFAULT_TOPIC_PATH]));
  const articlesPath =
    args.get("articles") ?? (await firstExisting(DEFAULT_ARTICLES_PATHS));
  const sourcesPath =
    args.get("sources") ?? (await firstExisting(DEFAULT_SOURCES_PATHS));
  const outPath = args.get("out") ?? DEFAULT_OUT_PATH;
  const briefOutPath = args.get("brief-out") ?? DEFAULT_BRIEF_OUT_PATH;
  const generatedAt = args.get("generated-at") ?? new Date().toISOString();

  const topicInput = await readJsonFile(
    topicPath,
    z.union([TopicSchema, z.array(TopicSchema)])
  );
  const topics = Array.isArray(topicInput) ? topicInput : [topicInput];
  if (topics.length === 0) {
    throw new Error(`No topics found in ${topicPath}`);
  }
  const articles = await readJsonFile(articlesPath, z.array(ArticleSchema));
  const sourceProfiles = await readJsonFile(
    sourcesPath,
    z.array(SourceProfileSchema)
  );
  const events = topics.map((topic) =>
    generateEventFromArticles({
      topic,
      articles,
      sourceProfiles,
      generatedAt
    })
  );

  await writeJsonFile(
    outPath,
    events.length === 1 ? events[0] : { generatedAt, events }
  );

  if (briefOutPath) {
    const brief =
      events.length === 1
        ? buildBrief(events[0]!)
        : [
            "# Clawnews Sample Daily Brief",
            "",
            `Generated ${events.length} sample event briefs for UI and pipeline testing.`,
            "",
            ...events.flatMap((event, index) => [
              index > 0 ? "\n---\n" : "",
              buildBrief(event)
            ])
          ].join("\n");
    await writeTextFile(briefOutPath, brief);
  }

  console.log(
    `Generated ${outPath} with ${events.length} event(s), ${events.reduce(
      (total, event) => total + event.articles.length,
      0
    )} article(s), ${events.reduce(
      (total, event) => total + event.sourceComparisons.length,
      0
    )} comparison(s), and ${events.reduce(
      (total, event) => total + event.auditFindings.length,
      0
    )} audit finding(s).`
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
