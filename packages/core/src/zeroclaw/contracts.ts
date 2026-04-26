import { z } from "zod";

export const ZeroClawJobKindSchema = z.enum([
  "clawnews.rss.fetch",
  "clawnews.article.dedupe",
  "clawnews.event.cluster",
  "clawnews.claim.extract",
  "clawnews.source.enrich",
  "clawnews.event.summarize",
  "clawnews.event.audit"
]);

export const ZeroClawArtifactSchema = z.object({
  path: z.string().min(1),
  kind: z.enum(["json", "markdown", "log"]),
  mediaType: z.string().min(1)
});

export const ZeroClawLogEntrySchema = z.object({
  at: z.string().datetime({ offset: true }).default(() => new Date().toISOString()),
  level: z.enum(["debug", "info", "warn", "error"]).default("info"),
  message: z.string().min(1)
});

const BaseJobSchema = z.object({
  jobId: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }).default(() => new Date().toISOString()),
  traceId: z.string().min(1).optional(),
  attempts: z.number().int().min(0).default(0)
});

export const RssFetchJobSchema = BaseJobSchema.extend({
  kind: z.literal("clawnews.rss.fetch"),
  payload: z.object({
    feedsPath: z.string().min(1),
    outPath: z.string().min(1),
    topicPath: z.string().min(1).optional(),
    maxItemsPerFeed: z.number().int().positive().default(10),
    mockArticlesPath: z.string().min(1).optional()
  })
});

export const ArticleDedupeJobSchema = BaseJobSchema.extend({
  kind: z.literal("clawnews.article.dedupe"),
  payload: z.object({
    articlesPath: z.string().min(1),
    outPath: z.string().min(1)
  })
});

export const EventClusterJobSchema = BaseJobSchema.extend({
  kind: z.literal("clawnews.event.cluster"),
  payload: z.object({
    topicPath: z.string().min(1),
    articlesPath: z.string().min(1),
    sourcesPath: z.string().min(1),
    outPath: z.string().min(1),
    generatedAt: z.string().datetime({ offset: true }).optional()
  })
});

export const ClaimExtractJobSchema = BaseJobSchema.extend({
  kind: z.literal("clawnews.claim.extract"),
  payload: z.object({
    eventPath: z.string().min(1),
    outPath: z.string().min(1)
  })
});

export const SourceEnrichJobSchema = BaseJobSchema.extend({
  kind: z.literal("clawnews.source.enrich"),
  payload: z.object({
    sourcesPath: z.string().min(1),
    outPath: z.string().min(1)
  })
});

export const EventSummarizeJobSchema = BaseJobSchema.extend({
  kind: z.literal("clawnews.event.summarize"),
  payload: z.object({
    topicPath: z.string().min(1),
    articlesPath: z.string().min(1),
    sourcesPath: z.string().min(1),
    outPath: z.string().min(1),
    briefOutPath: z.string().min(1).optional(),
    generatedAt: z.string().datetime({ offset: true }).optional()
  })
});

export const EventAuditJobSchema = BaseJobSchema.extend({
  kind: z.literal("clawnews.event.audit"),
  payload: z.object({
    eventPath: z.string().min(1),
    outPath: z.string().min(1)
  })
});

export const ZeroClawJobSchema = z.discriminatedUnion("kind", [
  RssFetchJobSchema,
  ArticleDedupeJobSchema,
  EventClusterJobSchema,
  ClaimExtractJobSchema,
  SourceEnrichJobSchema,
  EventSummarizeJobSchema,
  EventAuditJobSchema
]);

export const ZeroClawJobResultSchema = z.object({
  jobId: z.string().min(1),
  kind: ZeroClawJobKindSchema,
  status: z.enum(["succeeded", "failed"]),
  startedAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }),
  artifacts: z.array(ZeroClawArtifactSchema).default([]),
  logs: z.array(ZeroClawLogEntrySchema).default([]),
  error: z
    .object({
      message: z.string().min(1),
      stack: z.string().min(1).optional()
    })
    .optional()
});

export type ZeroClawJobKind = z.infer<typeof ZeroClawJobKindSchema>;
export type ZeroClawArtifact = z.infer<typeof ZeroClawArtifactSchema>;
export type ZeroClawLogEntry = z.infer<typeof ZeroClawLogEntrySchema>;
export type ZeroClawJob = z.infer<typeof ZeroClawJobSchema>;
export type ZeroClawJobResult = z.infer<typeof ZeroClawJobResultSchema>;
