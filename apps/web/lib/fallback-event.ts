import type { EventBrief } from "@/lib/types";

export const fallbackEvent: EventBrief = {
  agreedFacts: [
    "Sources agree the board approved a six-month pilot framework.",
    "Sources agree a final operating budget is still required before service starts."
  ],
  audit: [
    {
      confidence: 0.62,
      id: "sample-audit-source-context",
      recommendedReview: true,
      severity: "info",
      summary:
        "Sample fallback data uses fictional sources and should not be treated as verified reporting."
    }
  ],
  claims: [
    {
      id: "claim-late-service-access",
      label: "Access",
      confidence: 0.72,
      sourceIds: ["city-ledger", "transit-workers-local-18"],
      text: "Supporters say late-night routes would help shift workers reach jobs after current rail and bus windows close."
    },
    {
      id: "claim-budget-exposure",
      label: "Cost",
      confidence: 0.69,
      sourceIds: ["civic-budget-office"],
      text: "The budget office estimates the pilot would require extra operator hours, station staffing, and overnight security coverage."
    },
    {
      id: "claim-business-demand",
      label: "Demand",
      confidence: 0.66,
      sourceIds: ["metro-business-journal"],
      text: "Hospitality employers argue that inconsistent late service is one reason evening roles are harder to fill."
    }
  ],
  confidence: 0.67,
  convergenceScore: 0.58,
  disagreements: [
    {
      id: "ridership-forecast",
      confidence: 0.67,
      point: "How much ridership the pilot can prove in six months",
      positions: [
        "Transit planners expect demand to concentrate on three trunk routes.",
        "Budget analysts say a short pilot may not capture seasonal travel patterns."
      ]
    },
    {
      id: "safety-staffing",
      confidence: 0.64,
      point: "Whether the staffing plan is enough for overnight service",
      positions: [
        "The transit board says security staffing is included in the cost range.",
        "The operators union says platform staffing details are still unresolved."
      ]
    }
  ],
  disagreementScore: 0.42,
  disputedPoints: [
    "Forecast confidence differs between transit planners and budget analysts.",
    "Overnight staffing assumptions remain unresolved."
  ],
  evidenceQualityScore: 0.66,
  happenedAt: "2026-04-25T18:30:00.000Z",
  id: "regional-transit-late-night-pilot",
  impact:
    "The decision moves the proposal from committee debate to route planning, with a final operating budget due before service can begin.",
  kicker: "Sample brief",
  location: "Riverton metro area",
  origin: "sample",
  slug: "regional-transit-late-night-pilot",
  sources: [
    {
      articleTitle: "Transit board approves late-night service pilot",
      country: "US",
      confidence: 0.68,
      funding: "Subscriber revenue and local advertising",
      homepage: "https://example.com/city-ledger",
      id: "city-ledger",
      incentives: ["Metro audience growth", "Public service coverage"],
      knownFunding: ["subscriptions", "advertising"],
      lastVerifiedAt: "2026-04-26T00:15:00.000Z",
      likelyFraming: "May emphasize municipal service delivery and public access.",
      name: "City Ledger",
      notes: ["Locally owned daily newsroom"],
      outletType: "Local newspaper",
      ownership: "Ledger Media Cooperative",
      publishedAt: "2026-04-25T20:10:00.000Z",
      url: "https://example.com/city-ledger/transit-pilot"
    },
    {
      articleTitle: "Late-night transit plan draws support from hospitality firms",
      country: "US",
      confidence: 0.62,
      funding: "Membership dues and event sponsorship",
      homepage: "https://example.com/metro-business-journal",
      id: "metro-business-journal",
      incentives: ["Business readership", "Employer policy priorities"],
      knownFunding: ["membership dues", "event sponsorship"],
      lastVerifiedAt: "2026-04-26T00:15:00.000Z",
      likelyFraming: "May emphasize employer demand and regional economic effects.",
      name: "Metro Business Journal",
      notes: ["Publishes workplace and regional economy coverage"],
      outletType: "Business publication",
      ownership: "Riverton Commerce Group",
      publishedAt: "2026-04-25T21:40:00.000Z",
      url: "https://example.com/metro-business-journal/late-transit"
    },
    {
      articleTitle: "Budget note on overnight transit service pilot",
      country: "US",
      confidence: 0.73,
      funding: "Public agency budget",
      homepage: "https://example.com/civic-budget-office",
      id: "civic-budget-office",
      incentives: ["Fiscal oversight", "Cost transparency"],
      knownFunding: ["public agency budget"],
      lastVerifiedAt: "2026-04-26T00:15:00.000Z",
      likelyFraming: "May emphasize cost exposure and budget uncertainty.",
      name: "Civic Budget Office",
      notes: ["Independent municipal budget analysis office"],
      outletType: "Government analysis",
      ownership: "City charter office",
      publishedAt: "2026-04-26T00:15:00.000Z",
      url: "https://example.com/civic-budget-office/transit-note"
    },
    {
      articleTitle: "Operators need safety plan before overnight expansion",
      country: "US",
      confidence: 0.65,
      funding: "Member dues",
      homepage: "https://example.com/local-18",
      id: "transit-workers-local-18",
      incentives: ["Worker safety", "Staffing levels"],
      knownFunding: ["member dues"],
      lastVerifiedAt: "2026-04-26T00:15:00.000Z",
      likelyFraming: "May emphasize operator safety and staffing needs.",
      name: "Transit Workers Local 18",
      notes: ["Represents bus and rail operators"],
      outletType: "Stakeholder statement",
      ownership: "Labor union",
      publishedAt: "2026-04-25T23:00:00.000Z",
      url: "https://example.com/local-18/night-service"
    }
  ],
  sourceComparisons: [
    {
      agreement: "partial",
      confidence: 0.67,
      evidence: [
        "Supporters emphasize late-shift access.",
        "Budget analysts emphasize staffing and security costs."
      ],
      framing: "Sources agree on the vote but frame the pilot through access, costs, and labor safety.",
      id: "sample-comparison-service-cost",
      sourceIds: ["city-ledger", "civic-budget-office", "transit-workers-local-18"],
      stance: "mixed",
      summary:
        "Coverage converges on the board vote while disagreeing on whether the pilot is operationally ready."
    }
  ],
  stakeholders: [
    {
      id: "transit-board",
      interest: "Move a visible service proposal into a measurable pilot.",
      name: "Regional Transit Board",
      position: "Approved the pilot framework.",
      role: "Decision maker"
    },
    {
      id: "operators-union",
      interest: "Secure staffing and safety commitments before overnight expansion.",
      name: "Transit Workers Local 18",
      position: "Conditionally supportive.",
      role: "Labor stakeholder"
    },
    {
      id: "hospitality-employers",
      interest: "Improve late-shift hiring and employee retention.",
      name: "Hospitality employers",
      position: "Support the pilot.",
      role: "Business stakeholder"
    }
  ],
  status: "Developing",
  summary:
    "A regional transit board approved a six-month late-night service pilot after business groups, labor representatives, and budget analysts pressed different concerns about access, staffing, and cost.",
  tags: ["Transit", "Labor", "Municipal budget"],
  timeline: [
    {
      id: "committee-vote",
      label: "Committee",
      text: "The service committee advanced a narrower route map for late-night buses.",
      time: "2026-04-18T15:00:00.000Z"
    },
    {
      id: "board-approval",
      label: "Board vote",
      text: "The full board approved pilot planning and requested a final operating budget.",
      time: "2026-04-25T18:30:00.000Z"
    },
    {
      id: "budget-note",
      label: "Cost note",
      text: "The budget office published a cost range and flagged overnight staffing assumptions.",
      time: "2026-04-26T00:15:00.000Z"
    }
  ],
  title: "Regional transit board approves late-night service pilot",
  updatedAt: "2026-04-26T00:15:00.000Z",
  whatChanged: [
    "The proposal moved from committee approval to a full board vote.",
    "A public budget note added staffing and security cost ranges.",
    "The operators union narrowed its objection to overnight safety details."
  ]
};
