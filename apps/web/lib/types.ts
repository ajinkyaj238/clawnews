export type DataOrigin = "artifact" | "sample";

export interface SourceProfile {
  articleTitle?: string;
  businessModel?: string;
  confidence?: number;
  country?: string;
  editorialProfile?: string;
  funding?: string;
  homepage?: string;
  id: string;
  incentives: string[];
  knownFunding?: string[];
  lastVerifiedAt?: string;
  likelyFraming?: string;
  name: string;
  notes: string[];
  outletType?: string;
  parentCompany?: string;
  ownership?: string;
  publishedAt?: string;
  ultimateOwner?: string;
  url?: string;
}

export interface ClaimItem {
  confidence?: number;
  id: string;
  label?: string;
  sourceIds: string[];
  text: string;
}

export interface DisagreementItem {
  confidence?: number;
  id: string;
  point: string;
  positions: string[];
}

export interface SourceComparisonItem {
  agreement?: string;
  confidence?: number;
  evidence: string[];
  framing?: string;
  id: string;
  sourceIds: string[];
  stance?: string;
  summary: string;
}

export interface AuditItem {
  confidence?: number;
  id: string;
  recommendedReview?: boolean;
  severity?: string;
  summary: string;
}

export interface StakeholderItem {
  confidence?: number;
  fundingOrBackers?: string;
  id: string;
  interest?: string;
  name: string;
  possibleBias?: string;
  position?: string;
  role?: string;
}

export interface TimelineItem {
  id: string;
  label?: string;
  time?: string;
  text: string;
}

export interface EventBrief {
  agreedFacts: string[];
  artifactPath?: string;
  audit: AuditItem[];
  claims: ClaimItem[];
  confidence?: number;
  convergenceScore?: number;
  disagreements: DisagreementItem[];
  disagreementScore?: number;
  disputedPoints: string[];
  evidenceQualityScore?: number;
  happenedAt?: string;
  id: string;
  impact?: string;
  kicker?: string;
  location?: string;
  origin: DataOrigin;
  slug: string;
  sourceComparisons: SourceComparisonItem[];
  sources: SourceProfile[];
  stakeholders: StakeholderItem[];
  status?: string;
  summary: string;
  tags: string[];
  timeline: TimelineItem[];
  title: string;
  updatedAt?: string;
  whatChanged: string[];
}
