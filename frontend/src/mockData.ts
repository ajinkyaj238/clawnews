import { Article } from "./types";

export const CATEGORIES = ["All", "World", "Politics", "Technology", "Science", "Business", "Health", "Sports"];

export const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Global Climate Summit Reaches Historic Emissions Agreement",
    summary:
      "World leaders from over 190 countries agreed to a landmark emissions reduction framework, pledging to cut carbon output by 45% before 2035. The deal, brokered after three days of intense negotiations, includes binding commitments from major economies and a $500 billion green transition fund for developing nations.",
    source: "Reuters",
    category: "World",
    publishedAt: "2026-04-26T09:15:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
  },
  {
    id: "2",
    title: "Senate Passes Sweeping AI Regulation Bill 68–32",
    summary:
      "The Senate voted to pass the AI Accountability Act, requiring federal review of high-risk AI systems before public deployment. The bill mandates transparency reports, algorithmic audits for hiring and lending tools, and establishes a new Office of AI Safety within the Commerce Department.",
    source: "The Washington Post",
    category: "Politics",
    publishedAt: "2026-04-26T07:40:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80",
  },
  {
    id: "3",
    title: "Breakthrough Battery Charges to 80% in Under Four Minutes",
    summary:
      "Researchers at MIT unveiled a solid-state battery prototype that reaches 80% charge in under four minutes while maintaining over 90% capacity after 5,000 cycles. The technology uses a lithium-ceramic anode and could enter mass production by 2028, potentially transforming the EV market.",
    source: "MIT Technology Review",
    category: "Technology",
    publishedAt: "2026-04-25T18:30:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: "4",
    title: "FDA Approves First Personalized mRNA Cancer Vaccine",
    summary:
      "The FDA granted full approval to NeoCure, the first individualized mRNA cancer vaccine, after Phase III trials showed a 44% reduction in recurrence for melanoma patients. The vaccine is synthesized from a patient's own tumor DNA and is expected to be available in major cancer centers by Q3 2026.",
    source: "The New England Journal of Medicine",
    category: "Health",
    publishedAt: "2026-04-25T14:00:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
  },
  {
    id: "5",
    title: "SpaceX Starship Completes First Crewed Lunar Orbit Mission",
    summary:
      "A crew of four astronauts successfully completed a 10-day lunar orbit mission aboard Starship, marking the spacecraft's first crewed deep-space flight. The mission gathered detailed surface mapping data ahead of NASA's planned 2027 crewed lunar landing. All crew members returned safely to Earth.",
    source: "NASA / AP",
    category: "Science",
    publishedAt: "2026-04-25T11:55:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&q=80",
  },
  {
    id: "6",
    title: "Fed Cuts Rates by 50 Basis Points Amid Slowdown Concerns",
    summary:
      "The Federal Reserve cut its benchmark rate by half a percentage point to 3.75%–4.00%, citing softening labor data and below-target inflation. Chair Powell signaled further easing is possible in H2 2026 if employment continues to weaken. Markets rallied sharply on the announcement.",
    source: "The Wall Street Journal",
    category: "Business",
    publishedAt: "2026-04-24T21:00:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  },
  {
    id: "7",
    title: "Championship Finals Draw Record 2.1 Billion Global Viewers",
    summary:
      "This year's championship match broke all streaming and broadcast records with an estimated 2.1 billion viewers across 210 territories. The event, streamed free in 40 countries for the first time, saw a 35% increase in viewership among the 18–34 demographic compared to the previous year.",
    source: "ESPN",
    category: "Sports",
    publishedAt: "2026-04-24T06:00:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
  },
  {
    id: "8",
    title: "Quantum Computer Solves 100-Year-Old Mathematical Problem",
    summary:
      "IBM's 10,000-qubit Condor system verified a solution to Hilbert's eighth problem — the Riemann Hypothesis — using a novel quantum-classical hybrid algorithm. Independent mathematicians are now reviewing the proof, which could have broad implications for cryptography and number theory.",
    source: "Nature",
    category: "Science",
    publishedAt: "2026-04-23T16:20:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
  },
  {
    id: "9",
    title: "Apple Unveils Vision Pro 2 with Neural Interface Support",
    summary:
      "Apple announced Vision Pro 2 featuring a non-invasive neural headband accessory that allows users to navigate and select content using focused thought. The headset also includes a 50% lighter frame, all-day battery life, and a new Spatial AI engine. Preorders open May 15.",
    source: "The Verge",
    category: "Technology",
    publishedAt: "2026-04-23T10:00:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=80",
  },
  {
    id: "10",
    title: "WHO Declares Mpox Variant of Concern as Cases Surge in SE Asia",
    summary:
      "The World Health Organization elevated clade IIc mpox to a Variant of Concern after case counts in Southeast Asia tripled over 60 days. The agency recommends accelerated vaccination rollout and enhanced airport surveillance. No evidence of increased lethality has been found.",
    source: "WHO / Reuters",
    category: "Health",
    publishedAt: "2026-04-22T13:30:00Z",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&q=80",
  },
];
