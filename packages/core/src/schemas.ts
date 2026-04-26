import { z } from "zod";

export const DEFAULT_CONFIDENCE = 0.65;

export const ConfidenceSchema = z
  .number()
  .min(0)
  .max(1)
  .default(DEFAULT_CONFIDENCE);

export const IsoDateTimeSchema = z.string().datetime({ offset: true });

export const StanceSchema = z.enum([
  "supporting",
  "opposing",
  "neutral",
  "mixed",
  "unclear"
]);

export const ArticleClaimSchema = z.object({
  id: z.string().min(1),
  questionId: z.string().min(1).optional(),
  text: z.string().min(1),
  stance: StanceSchema.default("unclear"),
  evidence: z.string().min(1).optional(),
  confidence: ConfidenceSchema
});

export const ArticleQuoteSchema = z.object({
  speaker: z.string().min(1).optional(),
  text: z.string().min(1),
  articleSection: z.string().min(1).optional(),
  confidence: ConfidenceSchema
});

export const ArticleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  sourceId: z.string().min(1),
  author: z.string().min(1).optional(),
  language: z.string().min(2).default("en"),
  publishedAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema.optional(),
  fetchedAt: IsoDateTimeSchema.default(() => new Date().toISOString()),
  summary: z.string().min(1),
  body: z.string().min(1).optional(),
  topicIds: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  quotes: z.array(ArticleQuoteSchema).default([]),
  claims: z.array(ArticleClaimSchema).default([]),
  confidence: ConfidenceSchema
});

export const SourceFundingModelSchema = z.enum([
  "advertising",
  "subscription",
  "donation",
  "public-funding",
  "government",
  "member-dues",
  "foundation",
  "commercial-sponsor",
  "unknown"
]);

export const SourceTypeSchema = z.enum([
  "local-news",
  "wire",
  "public-media",
  "commercial",
  "advocacy",
  "government",
  "academic",
  "industry",
  "community"
]);

export const SourceProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  homepage: z.string().url(),
  type: SourceTypeSchema,
  country: z.string().min(2),
  region: z.string().min(1).optional(),
  language: z.string().min(2).default("en"),
  owner: z.string().min(1).optional(),
  parentCompany: z.string().min(1).optional(),
  ultimateOwner: z.string().min(1).optional(),
  ownership: z.string().min(1).optional(),
  businessModel: z.string().min(1).optional(),
  knownFunding: z.array(z.string().min(1)).default([]),
  fundingModel: z.array(SourceFundingModelSchema).default(["unknown"]),
  editorialProfile: z.string().min(1).optional(),
  likelyFraming: z.string().min(1).optional(),
  knownPerspective: z.string().min(1).optional(),
  editorialStandards: z.array(z.string().min(1)).default([]),
  notes: z.array(z.string().min(1)).default([]),
  lastVerifiedAt: IsoDateTimeSchema.optional(),
  reliability: ConfidenceSchema,
  transparency: ConfidenceSchema,
  confidence: ConfidenceSchema
});

export const StakeholderRoleSchema = z.enum([
  "government",
  "regulator",
  "industry",
  "civil-society",
  "community",
  "expert",
  "opposition",
  "affected-group",
  "other"
]);

export const StakeholderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: StakeholderRoleSchema,
  type: StakeholderRoleSchema.optional(),
  position: z.string().min(1).optional(),
  positionSummary: z.string().min(1),
  likelyInterest: z.string().min(1).optional(),
  interests: z.array(z.string().min(1)).default([]),
  fundingOrBackers: z.string().min(1).optional(),
  possibleBias: z.string().min(1).optional(),
  confidence: ConfidenceSchema
});

export const ContestedQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  relatedKeywords: z.array(z.string().min(1)).default([])
});

export const TopicSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string().min(1)).default([]),
  contestedQuestions: z.array(ContestedQuestionSchema).min(1),
  eventWindowDays: z.number().int().positive().default(30),
  stakeholders: z.array(StakeholderSchema).default([])
});

export const ComparisonDimensionSchema = z.enum([
  "claim",
  "framing",
  "evidence",
  "omission",
  "priority"
]);

export const AgreementSchema = z.enum([
  "aligned",
  "partial",
  "conflicting",
  "unclear"
]);

export const SourceComparisonSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  questionId: z.string().min(1).optional(),
  sourceId: z.string().min(1).optional(),
  dimension: ComparisonDimensionSchema,
  agreement: AgreementSchema,
  sourceIds: z.array(z.string().min(1)).min(2),
  articleIds: z.array(z.string().min(1)).min(1),
  stanceSpread: z.array(StanceSchema).default([]),
  stance: StanceSchema.optional(),
  framing: z.string().min(1).optional(),
  claims: z.array(z.string().min(1)).default([]),
  ownershipNotes: z.string().min(1).optional(),
  biasNotes: z.string().min(1).optional(),
  summary: z.string().min(1),
  evidence: z.array(z.string().min(1)).default([]),
  confidence: ConfidenceSchema
});

export const AuditSeveritySchema = z.enum(["info", "low", "medium", "high"]);

export const AuditCategorySchema = z.enum([
  "missing-source-profile",
  "low-source-diversity",
  "low-confidence-claim",
  "claim-conflict",
  "coverage-gap",
  "stale-article"
]);

export const AuditFindingSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  severity: AuditSeveritySchema,
  category: AuditCategorySchema,
  summary: z.string().min(1),
  missingPerspectives: z.array(z.string().min(1)).default([]),
  unsupportedClaims: z.array(z.string().min(1)).default([]),
  ownershipUncertainties: z.array(z.string().min(1)).default([]),
  summaryRisk: z.string().min(1).optional(),
  recommendedReview: z.boolean().default(false),
  articleIds: z.array(z.string().min(1)).default([]),
  sourceIds: z.array(z.string().min(1)).default([]),
  remediation: z.string().min(1).optional(),
  confidence: ConfidenceSchema
});

export const EventStatusSchema = z.enum([
  "monitoring",
  "developing",
  "resolved",
  "archived"
]);

export const EventSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  topic: z.string().min(1).optional(),
  title: z.string().min(1),
  neutralSummary: z.string().min(1).optional(),
  summary: z.string().min(1),
  status: EventStatusSchema.default("monitoring"),
  generatedAt: IsoDateTimeSchema.default(() => new Date().toISOString()),
  timeframe: z.object({
    start: IsoDateTimeSchema,
    end: IsoDateTimeSchema.optional()
  }),
  firstSeenAt: IsoDateTimeSchema.optional(),
  lastUpdatedAt: IsoDateTimeSchema.optional(),
  sourceCount: z.number().int().nonnegative().default(0),
  convergenceScore: ConfidenceSchema,
  disagreementScore: ConfidenceSchema,
  evidenceQualityScore: ConfidenceSchema,
  agreedFacts: z.array(z.string().min(1)).default([]),
  disputedPoints: z.array(z.string().min(1)).default([]),
  whatChanged: z.array(z.string().min(1)).default([]),
  articles: z.array(ArticleSchema).default([]),
  sourceProfiles: z.array(SourceProfileSchema).default([]),
  stakeholders: z.array(StakeholderSchema).default([]),
  sourceComparisons: z.array(SourceComparisonSchema).default([]),
  auditFindings: z.array(AuditFindingSchema).default([]),
  audit: z.array(AuditFindingSchema).default([]),
  confidence: ConfidenceSchema
});

export type Confidence = z.output<typeof ConfidenceSchema>;
export type Stance = z.output<typeof StanceSchema>;
export type ArticleClaim = z.output<typeof ArticleClaimSchema>;
export type ArticleQuote = z.output<typeof ArticleQuoteSchema>;
export type Article = z.output<typeof ArticleSchema>;
export type SourceProfile = z.output<typeof SourceProfileSchema>;
export type Stakeholder = z.output<typeof StakeholderSchema>;
export type ContestedQuestion = z.output<typeof ContestedQuestionSchema>;
export type Topic = z.output<typeof TopicSchema>;
export type SourceComparison = z.output<typeof SourceComparisonSchema>;
export type AuditFinding = z.output<typeof AuditFindingSchema>;
export type Event = z.output<typeof EventSchema>;
