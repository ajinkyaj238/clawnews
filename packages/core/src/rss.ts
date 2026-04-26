import Parser from "rss-parser";
import { z } from "zod";
import {
  Article,
  ArticleSchema,
  DEFAULT_CONFIDENCE,
  Topic,
  TopicSchema
} from "./schemas.js";
import { createStableId } from "./ids.js";

export const RssFeedSchema = z.object({
  sourceId: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  topicIds: z.array(z.string().min(1)).default([])
});

export const RssIngestionConfigSchema = z.object({
  feeds: z.array(RssFeedSchema).min(1),
  maxItemsPerFeed: z.number().int().positive().default(10)
});

export type RssFeed = z.infer<typeof RssFeedSchema>;
export type RssIngestionConfig = z.infer<typeof RssIngestionConfigSchema>;

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  creator?: string;
  author?: string;
  categories?: string[];
};

export interface IngestRssFeedsOptions {
  topic?: unknown;
  maxItemsPerFeed?: number;
  fetchedAt?: string;
}

export async function ingestRssFeeds(
  rawConfig: unknown,
  options: IngestRssFeedsOptions = {}
): Promise<Article[]> {
  const config = RssIngestionConfigSchema.parse(rawConfig);
  const topic = options.topic ? TopicSchema.parse(options.topic) : undefined;
  const maxItemsPerFeed = options.maxItemsPerFeed ?? config.maxItemsPerFeed;
  const fetchedAt = options.fetchedAt ?? new Date().toISOString();
  const parser = new Parser<Record<string, never>, RssItem>();
  const articles: Article[] = [];

  for (const feed of config.feeds) {
    let items: RssItem[] = [];

    try {
      const parsedFeed = await parser.parseURL(feed.url);
      items = parsedFeed.items.slice(0, maxItemsPerFeed);
    } catch (error) {
      console.warn(
        `Failed to fetch RSS feed ${feed.sourceId} (${feed.url}); continuing with remaining feeds.`,
        error instanceof Error ? error.message : error
      );
      continue;
    }

    for (const item of items) {
      articles.push(rssItemToArticle(feed, item, fetchedAt, topic));
    }
  }

  return articles;
}

export function rssItemToArticle(
  feed: RssFeed,
  item: RssItem,
  fetchedAt: string,
  topic?: Topic
): Article {
  const title = item.title?.trim() || "Untitled RSS item";
  const url = item.link?.trim() || feed.url;
  const summary =
    item.contentSnippet?.trim() ||
    stripHtml(item.content ?? "").slice(0, 500) ||
    `RSS item from ${feed.name}`;
  const publishedAt = normalizeDate(item.isoDate ?? item.pubDate, fetchedAt);
  const topicIds = topic
    ? unique([...feed.topicIds, topic.id]).filter((topicId) =>
        articleMatchesTopic(title, summary, topicId, topic)
      )
    : feed.topicIds;

  return ArticleSchema.parse({
    id: createStableId("article", [feed.sourceId, url, publishedAt]),
    title,
    url,
    sourceId: feed.sourceId,
    author: item.creator ?? item.author,
    publishedAt,
    fetchedAt,
    summary,
    topicIds,
    tags: topic ? matchingKeywords(title, summary, topic) : item.categories ?? [],
    claims: [],
    quotes: [],
    confidence: DEFAULT_CONFIDENCE
  });
}

function articleMatchesTopic(
  title: string,
  summary: string,
  topicId: string,
  topic: Topic
) {
  if (topicId !== topic.id) {
    return true;
  }

  const haystack = `${title} ${summary}`.toLowerCase();
  return topic.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function matchingKeywords(title: string, summary: string, topic: Topic) {
  const haystack = `${title} ${summary}`.toLowerCase();
  return topic.keywords.filter((keyword) =>
    haystack.includes(keyword.toLowerCase())
  );
}

function normalizeDate(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toISOString();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}
