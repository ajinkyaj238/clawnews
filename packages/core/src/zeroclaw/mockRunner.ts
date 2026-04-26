import { z } from "zod";
import { buildBrief } from "../brief.js";
import { generateEventFromArticles } from "../eventGeneration.js";
import {
  Article,
  ArticleSchema,
  EventSchema,
  SourceProfileSchema,
  TopicSchema
} from "../schemas.js";
import {
  ZeroClawArtifact,
  ZeroClawJobResult,
  ZeroClawJobResultSchema,
  ZeroClawJobSchema,
  ZeroClawLogEntry
} from "./contracts.js";
import { LocalZeroClawAdapter } from "./localAdapter.js";

export async function runMockZeroClawJob(
  rawJob: unknown,
  adapter = new LocalZeroClawAdapter()
): Promise<ZeroClawJobResult> {
  const job = ZeroClawJobSchema.parse(rawJob);
  const startedAt = new Date().toISOString();
  const logs: ZeroClawLogEntry[] = [
    {
      at: startedAt,
      level: "info",
      message: `Starting mock ZeroClaw job ${job.jobId}.`
    }
  ];
  const artifacts: ZeroClawArtifact[] = [];

  try {
    if (job.kind === "clawnews.rss.fetch") {
      if (job.payload.mockArticlesPath) {
        const articles = await adapter.readJson(
          job.payload.mockArticlesPath,
          z.array(ArticleSchema)
        );
        await adapter.writeJson(job.payload.outPath, articles);
        logs.push({
          at: new Date().toISOString(),
          level: "info",
          message: `Copied ${articles.length} mock RSS article(s).`
        });
      } else {
        await adapter.writeJson(job.payload.outPath, []);
        logs.push({
          at: new Date().toISOString(),
          level: "warn",
          message:
            "Mock runner did not fetch live RSS because no mockArticlesPath was supplied."
        });
      }

      artifacts.push({
        path: job.payload.outPath,
        kind: "json",
        mediaType: "application/json"
      });
    }

    if (job.kind === "clawnews.article.dedupe") {
      const articles = await adapter.readJson(
        job.payload.articlesPath,
        z.array(ArticleSchema)
      );
      const deduped = dedupeArticles(articles);

      await adapter.writeJson(job.payload.outPath, deduped);
      artifacts.push({
        path: job.payload.outPath,
        kind: "json",
        mediaType: "application/json"
      });
      logs.push({
        at: new Date().toISOString(),
        level: "info",
        message: `Deduped ${articles.length} article(s) to ${deduped.length}.`
      });
    }

    if (
      job.kind === "clawnews.event.cluster" ||
      job.kind === "clawnews.event.summarize"
    ) {
      const topic = await adapter.readJson(job.payload.topicPath, TopicSchema);
      const articles = await adapter.readJson(
        job.payload.articlesPath,
        z.array(ArticleSchema)
      );
      const sourceProfiles = await adapter.readJson(
        job.payload.sourcesPath,
        z.array(SourceProfileSchema)
      );
      const event = generateEventFromArticles({
        topic,
        articles,
        sourceProfiles,
        generatedAt: job.payload.generatedAt
      });

      await adapter.writeJson(job.payload.outPath, event);
      artifacts.push({
        path: job.payload.outPath,
        kind: "json",
        mediaType: "application/json"
      });

      if (job.kind === "clawnews.event.summarize" && job.payload.briefOutPath) {
        await adapter.writeText(job.payload.briefOutPath, buildBrief(event));
        artifacts.push({
          path: job.payload.briefOutPath,
          kind: "markdown",
          mediaType: "text/markdown"
        });
      }

      logs.push({
        at: new Date().toISOString(),
        level: "info",
        message: `Generated event ${event.id}.`
      });
    }

    if (job.kind === "clawnews.claim.extract") {
      const event = await adapter.readJson(job.payload.eventPath, EventSchema);
      const claims = event.articles.flatMap((article) =>
        article.claims.map((claim) => ({
          ...claim,
          articleId: article.id,
          sourceId: article.sourceId
        }))
      );

      await adapter.writeJson(job.payload.outPath, claims);
      artifacts.push({
        path: job.payload.outPath,
        kind: "json",
        mediaType: "application/json"
      });
      logs.push({
        at: new Date().toISOString(),
        level: "info",
        message: `Extracted ${claims.length} claim(s) from generated event.`
      });
    }

    if (job.kind === "clawnews.source.enrich") {
      const sources = await adapter.readJson(
        job.payload.sourcesPath,
        z.array(SourceProfileSchema)
      );

      await adapter.writeJson(job.payload.outPath, sources);
      artifacts.push({
        path: job.payload.outPath,
        kind: "json",
        mediaType: "application/json"
      });
      logs.push({
        at: new Date().toISOString(),
        level: "warn",
        message:
          "Mock source enrichment copied seed profiles; real ZeroClaw should verify ownership, funding, and source citations."
      });
    }

    if (job.kind === "clawnews.event.audit") {
      const event = await adapter.readJson(job.payload.eventPath, EventSchema);

      await adapter.writeJson(job.payload.outPath, event.auditFindings);
      artifacts.push({
        path: job.payload.outPath,
        kind: "json",
        mediaType: "application/json"
      });
      logs.push({
        at: new Date().toISOString(),
        level: "info",
        message: `Exported ${event.auditFindings.length} audit finding(s).`
      });
    }

    return ZeroClawJobResultSchema.parse({
      jobId: job.jobId,
      kind: job.kind,
      status: "succeeded",
      startedAt,
      completedAt: new Date().toISOString(),
      artifacts,
      logs
    });
  } catch (error) {
    return ZeroClawJobResultSchema.parse({
      jobId: job.jobId,
      kind: job.kind,
      status: "failed",
      startedAt,
      completedAt: new Date().toISOString(),
      artifacts,
      logs,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }
}

function dedupeArticles(articles: Article[]) {
  const byUrl = new Map<string, Article>();

  for (const article of articles) {
    const existing = byUrl.get(article.url);

    if (!existing || article.confidence > existing.confidence) {
      byUrl.set(article.url, article);
    }
  }

  return [...byUrl.values()];
}
