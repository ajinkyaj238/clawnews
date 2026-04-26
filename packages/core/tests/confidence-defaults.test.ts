import { describe, expect, it } from "vitest";
import {
  ArticleSchema,
  DEFAULT_CONFIDENCE,
  SourceProfileSchema,
  StakeholderSchema
} from "../src/schemas.js";

describe("confidence defaults", () => {
  it("applies confidence defaults to articles, claims, and quotes", () => {
    const article = ArticleSchema.parse({
      id: "article-defaults",
      title: "Defaults are applied",
      url: "https://example.org/defaults",
      sourceId: "source-defaults",
      publishedAt: "2026-04-01T00:00:00.000Z",
      summary: "A small fixture for defaults.",
      claims: [
        {
          id: "claim-defaults",
          text: "A claim without confidence should still be usable."
        }
      ],
      quotes: [
        {
          text: "A quote without confidence should still be usable."
        }
      ]
    });

    expect(article.confidence).toBe(DEFAULT_CONFIDENCE);
    expect(article.claims[0]?.confidence).toBe(DEFAULT_CONFIDENCE);
    expect(article.claims[0]?.stance).toBe("unclear");
    expect(article.quotes[0]?.confidence).toBe(DEFAULT_CONFIDENCE);
    expect(article.language).toBe("en");
    expect(article.topicIds).toEqual([]);
  });

  it("applies confidence defaults to source profiles and stakeholders", () => {
    const source = SourceProfileSchema.parse({
      id: "source-defaults",
      name: "Source Defaults",
      homepage: "https://example.org/source-defaults",
      type: "local-news",
      country: "US"
    });
    const stakeholder = StakeholderSchema.parse({
      id: "stakeholder-defaults",
      name: "Stakeholder Defaults",
      role: "community",
      positionSummary: "Has a position but no explicit confidence."
    });

    expect(source.reliability).toBe(DEFAULT_CONFIDENCE);
    expect(source.transparency).toBe(DEFAULT_CONFIDENCE);
    expect(source.confidence).toBe(DEFAULT_CONFIDENCE);
    expect(source.fundingModel).toEqual(["unknown"]);
    expect(stakeholder.confidence).toBe(DEFAULT_CONFIDENCE);
    expect(stakeholder.interests).toEqual([]);
  });

  it("does not mark unverified ownership as high confidence by default", () => {
    const source = SourceProfileSchema.parse({
      id: "unverified-owner",
      name: "Unverified Owner Daily",
      homepage: "https://example.org/unverified-owner",
      type: "local-news",
      country: "US",
      owner: "Unknown / needs verification"
    });

    expect(source.confidence).toBeLessThan(0.75);
    expect(source.fundingModel).toEqual(["unknown"]);
  });
});
