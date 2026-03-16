import type { FeatureItem } from "@/types/domain";

export const coreFeatures: FeatureItem[] = [
  {
    id: "feature_core_1",
    title: "Real-time interactive presentations",
    description: "Live lesson delivery with polls, quizzes, and drawing activities.",
    priority: "must-have",
    complexity: "medium",
  },
  {
    id: "feature_core_2",
    title: "Custom lesson builder",
    description: "Drag-and-drop composition for multimedia lessons and assessments.",
    priority: "must-have",
    complexity: "high",
  },
  {
    id: "feature_core_3",
    title: "Student progress tracking",
    description: "Performance trends, risk indicators, and mastery heatmaps.",
    priority: "must-have",
    complexity: "medium",
  },
  {
    id: "feature_core_4",
    title: "Virtual field trips",
    description: "360-style immersive explorations embedded into live lessons.",
    priority: "important",
    complexity: "high",
  },
  {
    id: "feature_core_5",
    title: "Parent portal",
    description: "Progress visibility, assignment digests, and next-step recommendations.",
    priority: "important",
    complexity: "low",
  },
];

export const advancedFeatures: FeatureItem[] = [
  {
    id: "feature_adv_1",
    title: "AI-powered adaptive learning",
    description: "Difficulty and pacing recommendations based on real-time performance.",
    priority: "innovative",
    complexity: "high",
  },
  {
    id: "feature_adv_2",
    title: "Predictive analytics dashboard",
    description: "Flags students who may need intervention before they disengage.",
    priority: "innovative",
    complexity: "high",
  },
  {
    id: "feature_adv_3",
    title: "NLP-assisted grading",
    description: "Short-answer feedback workflows with human-in-the-loop review.",
    priority: "important",
    complexity: "high",
  },
  {
    id: "feature_adv_4",
    title: "Virtual AI teaching assistants",
    description: "24/7 learner support with guarded prompts and escalation paths.",
    priority: "important",
    complexity: "high",
  },
];

export const innovativeIdeas = [
  "AI-generated personalized content suggestions tuned to curriculum standards.",
  "Global classroom collaboration rooms that pair classes across regions.",
  "Emotion-responsive pacing modeled through opt-in engagement signals rather than surveillance.",
  "Career pathway insights inferred from mastery trends and learning preferences.",
];
