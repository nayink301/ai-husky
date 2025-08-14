export type Intent = "review" | "other";
export type Sentiment = "positive" | "negative" | "neutral";

const QUESTION_WORDS = ["how","what","why","when","where","which","who","whom","whose","can","could","should","would","is","are","do","does","did","will"];
const JOB_TERMS = ["job","role","interview","position","apply","salary","hiring","internship"];
const POS_TERMS = ["love","great","awesome","good","excellent","amazing","nice","works well","helpful"];
const NEG_TERMS = ["bad","poor","terrible","awful","broken","hate","bug","issue","doesn't work","not working","slow"];

export function classifyIntent(text: string): { intent: Intent; score: number } {
  const t = (text || "").trim().toLowerCase();
  if (!t) return { intent: "other", score: 0.0 };
  const hasQMark = t.includes("?");
  const startsWithQ = QUESTION_WORDS.some(w => t.startsWith(w + " "));
  const jobLike = JOB_TERMS.some(w => t.includes(w));
  const hasPos = POS_TERMS.some(w => t.includes(w));
  const hasNeg = NEG_TERMS.some(w => t.includes(w));
  if ((hasQMark || startsWithQ || jobLike) && !(hasPos || hasNeg)) return { intent: "other", score: 0.85 };
  if (hasPos || hasNeg) return { intent: "review", score: 0.8 };
  const looksDeclarative = /(\bi\b|\bit\b|\bthis\b|\bthat\b)/.test(t) && !hasQMark;
  if (looksDeclarative) return { intent: "review", score: 0.65 };
  return { intent: "other", score: 0.6 };
}

export function classifySentiment(text: string): { sentiment: Sentiment; score: number } {
  const t = (text || "").toLowerCase();
  const posHits = POS_TERMS.filter(w => t.includes(w)).length;
  const negHits = NEG_TERMS.filter(w => t.includes(w)).length;
  if (posHits === 0 && negHits === 0) return { sentiment: "neutral", score: 0.5 };
  if (posHits >= negHits) return { sentiment: "positive", score: Math.min(1, 0.6 + 0.1 * posHits) };
  return { sentiment: "negative", score: Math.min(1, 0.6 + 0.1 * negHits) };
}

export type HuskyDecision =
  | { kind: "review-positive"; message: string }
  | { kind: "review-negative"; message: string }
  | { kind: "other"; message: string };

export function decideResponse(desc: string): HuskyDecision {
  const { intent } = classifyIntent(desc);
  if (intent === "review") {
    const { sentiment } = classifySentiment(desc);
    if (sentiment === "positive") return { kind: "review-positive", message: "Thanks for the kind words — we’ll stay humble and keep improving." };
    if (sentiment === "negative") return { kind: "review-negative", message: "Sorry this wasn’t great. We’ll take a little time to make it right." };
    return { kind: "review-positive", message: "Thanks for the feedback — noted, and we’ll keep refining." };
  }
  return { kind: "other", message: "Got it. Do you want details, examples, or next steps?" };
}

export function suggestPhrases(text: string): string[] {
  const t = (text || "").toLowerCase().trim();
  const { intent } = classifyIntent(t);
  const { sentiment } = classifySentiment(t);

  if (t.length < 8) return [
    "What was the goal?",
    "What worked / didn’t?",
    "What’s the next step?"
  ];

  if (intent === "review") {
    if (sentiment === "positive") {
      return ["What stood out the most?", "Would you recommend it? Why?", "One suggestion for improvement."];
    }
    if (sentiment === "negative") {
      return ["What went wrong, step-by-step?", "What did you expect to happen?", "Any screenshot/link/log that helps?"];
    }
    return ["Add one pro and one con.", "How could this be 10% better?"];
  }

  return ["State your goal in one line.", "Share current approach & blocker.", "What would a good answer look like?"];
}

export function suggestPhrasesScored(text: string): Array<{ text: string; score: number }> {
  const base = suggestPhrases(text);
  const len = (text || "").trim().length;
  const intent = classifyIntent(text).intent;
  const bias = intent === "review" ? 0.15 : 0;
  return base.map((t, i) => ({
    text: t,
    score: Math.max(0, Math.min(1, 0.5 + Math.min(len, 200) / 200 * 0.35 + bias - i * 0.08))
  }));
}
