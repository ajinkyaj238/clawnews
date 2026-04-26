import { describe, expect, it } from "vitest";
import { generateEventFromArticles } from "../src/eventGeneration.js";

describe("event generation", () => {
  it("builds a contested event from arbitrary topic data", () => {
    const topic = {
      id: "school-phone-policy",
      title: "School Phone Policy Vote",
      description:
        "A school board is weighing classroom phone restrictions after competing claims about distraction, safety, and family access.",
      keywords: ["phone policy", "school board", "classroom"],
      contestedQuestions: [
        {
          id: "learning",
          question: "Would the policy improve classroom learning?",
          relatedKeywords: ["learning", "distraction"]
        }
      ],
      stakeholders: [
        {
          id: "parent-council",
          name: "Parent Council",
          role: "community",
          positionSummary: "Wants safety exceptions and transparent enforcement."
        }
      ]
    };
    const articles = [
      {
        id: "article-parents",
        title: "Parents question phone ban",
        url: "https://example.org/parents-phone-ban",
        sourceId: "parent-newsletter",
        publishedAt: "2026-03-02T10:00:00.000Z",
        summary: "Parents say the policy may make family coordination harder.",
        topicIds: ["school-phone-policy"],
        claims: [
          {
            id: "claim-parent-learning",
            questionId: "learning",
            text: "Parents say distraction concerns are real but a full ban is too blunt.",
            stance: "opposing",
            confidence: 0.7
          }
        ]
      },
      {
        id: "article-teachers",
        title: "Teachers support classroom phone limits",
        url: "https://example.org/teachers-phone-limits",
        sourceId: "teacher-union",
        publishedAt: "2026-03-01T10:00:00.000Z",
        summary: "Teachers say classroom distraction is disrupting instruction.",
        topicIds: ["school-phone-policy"],
        claims: [
          {
            id: "claim-teacher-learning",
            questionId: "learning",
            text: "Teachers say fewer phones would reduce classroom distraction.",
            stance: "supporting",
            confidence: 0.8
          }
        ]
      },
      {
        id: "article-board",
        title: "Board delays vote on phone policy",
        url: "https://example.org/board-phone-delay",
        sourceId: "district-office",
        publishedAt: "2026-03-03T10:00:00.000Z",
        summary: "The district delayed the vote to review implementation details.",
        topicIds: ["school-phone-policy"],
        claims: []
      }
    ];
    const sourceProfiles = [
      {
        id: "parent-newsletter",
        name: "Parent Newsletter",
        homepage: "https://example.org/parent-newsletter",
        type: "community",
        country: "US"
      },
      {
        id: "teacher-union",
        name: "Teacher Union",
        homepage: "https://example.org/teacher-union",
        type: "community",
        country: "US"
      },
      {
        id: "district-office",
        name: "District Office",
        homepage: "https://example.org/district-office",
        type: "government",
        country: "US"
      }
    ];

    const event = generateEventFromArticles({
      topic,
      articles,
      sourceProfiles,
      generatedAt: "2026-03-04T00:00:00.000Z"
    });

    expect(event.topicId).toBe("school-phone-policy");
    expect(event.title).toBe("School Phone Policy Vote");
    expect(event.articles.map((article) => article.id)).toEqual([
      "article-teachers",
      "article-parents",
      "article-board"
    ]);
    expect(event.sourceComparisons).toHaveLength(1);
    expect(event.sourceComparisons[0]?.agreement).toBe("conflicting");
    expect(event.auditFindings.some((finding) => finding.category === "claim-conflict")).toBe(
      true
    );
    expect(event.confidence).toBeGreaterThan(0);
    expect(event.confidence).toBeLessThanOrEqual(1);
  });
});
