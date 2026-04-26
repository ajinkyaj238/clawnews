import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ArticleSchema, EventSchema } from "../src/schemas.js";

describe("schema validation", () => {
  it("accepts the frontend sample event artifact", () => {
    const fixturePath = new URL("../../../artifacts/sample-event.json", import.meta.url);
    const raw = JSON.parse(readFileSync(fixturePath, "utf8"));

    const event = EventSchema.parse(raw);

    expect(event.topicId).toBe("harborview-offshore-wind-transmission");
    expect(event.articles).toHaveLength(5);
    expect(event.sourceComparisons.length).toBeGreaterThan(0);
  });

  it("rejects malformed article urls and out-of-range confidence", () => {
    expect(() =>
      ArticleSchema.parse({
        id: "article-bad",
        title: "Bad URL",
        url: "not-a-url",
        sourceId: "source-a",
        publishedAt: "2026-04-01T00:00:00.000Z",
        summary: "This article should fail validation.",
        confidence: 1.4
      })
    ).toThrow();
  });
});
