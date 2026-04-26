import { z } from "zod";
import { readJsonFile, writeJsonFile } from "../io.js";
import { ingestRssFeeds, RssIngestionConfigSchema } from "../rss.js";
import { ArticleSchema, TopicSchema } from "../schemas.js";
import { parseCliArgs } from "./args.js";

const DEFAULT_FEEDS_PATH = "../../data/feeds.seed.json";
const DEFAULT_TOPIC_PATH = "../../data/sample-topic.json";
const DEFAULT_OUT_PATH = "../../artifacts/articles.latest.json";
const DEFAULT_FALLBACK_ARTICLES_PATH = "../../data/sample_articles.json";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const feedsPath = args.get("feeds") ?? DEFAULT_FEEDS_PATH;
  const outPath = args.get("out") ?? DEFAULT_OUT_PATH;
  const topicPath = args.get("topic") ?? DEFAULT_TOPIC_PATH;
  const fallbackPath = args.get("fallback") ?? DEFAULT_FALLBACK_ARTICLES_PATH;
  const maxItems = args.get("max-items");
  const fetchedAt = args.get("fetched-at");
  const feeds = await readJsonFile(feedsPath, RssIngestionConfigSchema);
  const topic = topicPath ? await readJsonFile(topicPath, TopicSchema) : undefined;
  let articles = await ingestRssFeeds(feeds, {
    topic,
    maxItemsPerFeed: maxItems ? Number(maxItems) : undefined,
    fetchedAt
  });

  if (articles.length === 0) {
    articles = await readJsonFile(fallbackPath, z.array(ArticleSchema));
    console.warn(
      `RSS ingestion returned no articles; copied ${articles.length} fallback article(s) from ${fallbackPath}.`
    );
  }

  await writeJsonFile(outPath, articles);
  console.log(`Wrote ${articles.length} RSS article(s) to ${outPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
