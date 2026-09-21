export type AppcomElementKey =
  | "acceptance"
  | "purpose"
  | "probing"
  | "consulting"
  | "objections"
  | "motivate";

export const APPCOM_ELEMENTS: {
  key: AppcomElementKey;
  letter: string;
  title: string;
  description: string;
  scoreField: string;
  notesField: string;
}[] = [
  {
    key: "acceptance",
    letter: "A",
    title: "Acceptance",
    description:
      "The open — genuine small talk to break the ice, not a canned line. (\"Where on planet earth are you today?\")",
    scoreField: "acceptanceScore",
    notesField: "acceptanceNotes",
  },
  {
    key: "purpose",
    letter: "P",
    title: "Purpose",
    description:
      "Stated the reason for the meeting within the first 3 minutes, framed around the BAC (best action commitment) and MAA (minimum acceptable action).",
    scoreField: "purposeScore",
    notesField: "purposeNotes",
  },
  {
    key: "probing",
    letter: "P",
    title: "Probing",
    description:
      "A mix of open- and closed-ended questions about the business, org structure, and what's working or not — leading toward the solution.",
    scoreField: "probingScore",
    notesField: "probingNotes",
  },
  {
    key: "consulting",
    letter: "C",
    title: "Consulting",
    description:
      "Covered the right points for this prospect using Feature → Advantage → Benefit, with the benefit stated in the customer's own words.",
    scoreField: "consultingScore",
    notesField: "consultingNotes",
  },
  {
    key: "objections",
    letter: "O",
    title: "Overcome Objections",
    description:
      "Anticipated and handled objections effectively (feel / felt / found), rather than winging it.",
    scoreField: "objectionsScore",
    notesField: "objectionsNotes",
  },
  {
    key: "motivate",
    letter: "M",
    title: "Motivate to Act",
    description:
      "Explicitly asked for the commitment tied to the BAC/MAA. (\"What are your thoughts on partnering with us?\")",
    scoreField: "motivateScore",
    notesField: "motivateNotes",
  },
];

export const SCORE_MIN = 1;
export const SCORE_MAX = 5;

export const PROBING_CHECKLIST: {
  key:
    | "uncoveredChallenges"
    | "uncoveredCostOfInaction"
    | "uncoveredIdealSolution"
    | "understoodBuyingProcess";
  label: string;
}[] = [
  { key: "uncoveredChallenges", label: "Uncovered their major challenges" },
  { key: "uncoveredCostOfInaction", label: 'Uncovered the "cost of doing nothing"' },
  {
    key: "uncoveredIdealSolution",
    label: 'Uncovered the ideal solution ("if you could wave a magic wand...")',
  },
  { key: "understoodBuyingProcess", label: "Understood the buying / decision process" },
];

export function averageAppcomScores(scorecards: Record<string, unknown>[]) {
  if (scorecards.length === 0) return null;
  const keys = APPCOM_ELEMENTS.map((e) => e.scoreField);
  const averages: Record<string, number> = {};
  for (const key of keys) {
    const values = scorecards
      .map((s) => s[key])
      .filter((v): v is number => typeof v === "number");
    averages[key] =
      values.length > 0
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : 0;
  }
  return averages;
}
