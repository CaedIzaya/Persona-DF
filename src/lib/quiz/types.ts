export const CORE_PERSONA_IDS = [
  "menggonglang",
  "laoban",
  "shushu",
  "benzhigaoshou",
  "mama",
  "tujiu",
  "shoucangjia",
] as const;

export const PROJECTION_PERSONA_IDS = [
  "weilong",
  "jiaoguan",
  "saiyide",
  "demulan",
  "duya",
  "hadesen",
  "leisi",
] as const;

export const EXTRA_BASE_PERSONA_IDS = [
  "jiahao",
  "laobeizha",
  "duqiaolai",
  "tangwang",
] as const;

export const PERSONA_IDS = [
  ...CORE_PERSONA_IDS,
  ...PROJECTION_PERSONA_IDS,
  ...EXTRA_BASE_PERSONA_IDS,
] as const;

// 保留 8 个 id 兼容题库旧信号；实际彩蛋输出只使用 easterEggs.ts 内定义的 4 个特定彩蛋
export const EASTER_EGG_IDS = [
  "duqiaolai",
  "laobeizha",
  "tangwang",
  "xipubawang",
  "duoshedelang",
  "jiahao",
  "linshu",
  "haotian",
] as const;

export const QUESTION_IDS = [
  "backpack",
  "operator",
  "map",
  "difficulty",
  "asset-level",
  "core-zone-quiet",
  "teammate-downed",
  "gunfire",
  "after-fight",
  "full-gear-shattered",
  "single-extract-priority",
  "red-loot-footsteps",
  "weapon",
  "last-gate-ambush",
  "loadout",
  "team-split",
  "hate-point",
  "lead-call",
  "rich-but-greedy",
  "fixed-team",
  "friendly-rat",
  "loot-attitude",
  "fun-source",
] as const;

export const DIMENSION_IDS = [
  "combat",
  "team",
  "loot",
  "tactics",
  "rational",
  "emotion",
] as const;

export const MEANING_TAG_IDS = [
  "kill",
  "control",
  "care",
  "command",
  "guardianship",
  "profit",
  "collection",
  "disruption",
  "torment",
  "taxation",
  "belief",
  "efficiency",
  "style",
  "fate",
  "destruction",
] as const;

export const GAME_INTENT_IDS = ["a", "b", "c", "d", "e"] as const;

export type CorePersonaId = (typeof CORE_PERSONA_IDS)[number];
export type ProjectionPersonaId = (typeof PROJECTION_PERSONA_IDS)[number];
export type ExtraBasePersonaId = (typeof EXTRA_BASE_PERSONA_IDS)[number];
export type PersonaId = (typeof PERSONA_IDS)[number];
export type EasterEggId = (typeof EASTER_EGG_IDS)[number];
export type QuestionId = (typeof QUESTION_IDS)[number];
export type DimensionId = (typeof DIMENSION_IDS)[number];
export type MeaningTagId = (typeof MEANING_TAG_IDS)[number];
export type GameIntentId = (typeof GAME_INTENT_IDS)[number];

export type PersonaLayer = "core" | "projection" | "base_extra";
export type PersonaTone = "signal" | "mint" | "slate";

export type PersonaScoreMap = Record<PersonaId, number>;
export type EasterEggScoreMap = Record<EasterEggId, number>;
export type DimensionScoreMap = Record<DimensionId, number>;
export type MeaningScoreMap = Record<MeaningTagId, number>;
export type GameIntentScoreMap = Record<GameIntentId, number>;
export type PartialPersonaScoreMap = Partial<Record<PersonaId, number>>;
export type PartialEasterEggScoreMap = Partial<Record<EasterEggId, number>>;
export type PartialDimensionScoreMap = Partial<Record<DimensionId, number>>;
export type PartialMeaningScoreMap = Partial<Record<MeaningTagId, number>>;
export type PartialGameIntentScoreMap = Partial<Record<GameIntentId, number>>;
export type AnswerMap = Record<QuestionId, string>;
export type PartialAnswerMap = Partial<Record<QuestionId, string>>;

export interface DimensionMeta {
  id: DimensionId;
  label: string;
  highLabel: string;
  lowLabel: string;
}

export interface MeaningTagMeta {
  id: MeaningTagId;
  label: string;
  summary: string;
}

export interface GameIntentMeta {
  id: GameIntentId;
  label: string;
  summary: string;
}

export interface Persona {
  id: PersonaId;
  layer: PersonaLayer;
  slug: string;
  shortCode: string;
  nameCn: string;
  nameEn: string;
  roleLabel: string;
  tone: PersonaTone;
  summary: string;
  resultIntro: string;
  playstyle: string;
  tacticalProfile: string;
  strengths: string[];
  blindSpots: string[];
  signatureLine: string;
  visualLabel: string;
  signalWords: string[];
  notMixWith: string[];
  // 0-10 原型矩阵
  dimensionProfile: PartialDimensionScoreMap;
  meaningProfile: PartialMeaningScoreMap;
}

export interface PersonaAnalysisContent {
  oneLiner: string;
  gameplay: string;
  value: string;
  psychology: string;
  caution: string;
}

export interface EasterEggProfile {
  id: EasterEggId;
  slug: string;
  nameCn: string;
  nameEn: string;
  title: string;
  summary: string;
  revealLine: string;
  rarityLabel: string;
  threshold: number;
  tone: PersonaTone;
  signalWords: string[];
  kind: "special";
  imageUrl: string;
}

export interface AnswerOption {
  id: string;
  label: string;
  description: string;
  dimensionDeltas: PartialDimensionScoreMap;
  meaningDeltas?: PartialMeaningScoreMap;
  personaSignals?: PartialPersonaScoreMap;
  easterEggSignals?: PartialEasterEggScoreMap;
}

export interface Question {
  id: QuestionId;
  prompt: string;
  brief: string;
  options: AnswerOption[];
}

export interface RankedPersona {
  persona: Persona;
  score: number;
}

export interface RankedEasterEgg {
  profile: EasterEggProfile;
  score: number;
}

export interface QuizOutcome {
  corePersona: Persona;
  broadcastKind: "base" | "easter_egg";
  broadcastLabel: string;
  easterEgg: EasterEggProfile | null;
  baseRanking: RankedPersona[];
  easterEggRanking: RankedEasterEgg[];
  dimensionScores: DimensionScoreMap;
  meaningScores: MeaningScoreMap;
  gameIntentScores: GameIntentScoreMap;
  personaSignals: PersonaScoreMap;
  easterEggScores: EasterEggScoreMap;
  shareSummary: string;
}

export const dimensionMeta: DimensionMeta[] = [
  { id: "combat", label: "交战意愿", highLabel: "主动求战", lowLabel: "避战保本" },
  { id: "team", label: "团队责任感", highLabel: "愿意扛责", lowLabel: "独行自保" },
  { id: "loot", label: "摸金意愿", highLabel: "收益执念", lowLabel: "对钱不敏感" },
  { id: "tactics", label: "战术意识", highLabel: "读局控节奏", lowLabel: "先动再说" },
  { id: "rational", label: "理性驱动", highLabel: "先算后动", lowLabel: "冲动压过理性" },
  { id: "emotion", label: "情绪驱动", highLabel: "上头先动", lowLabel: "克制收着打" },
];

export const meaningTagMeta: MeaningTagMeta[] = [
  { id: "kill", label: "狠狠干", summary: "正面对抗、击杀征服、爆发推进" },
  { id: "control", label: "掌控理解", summary: "看懂局势并处理干净" },
  { id: "care", label: "照顾托底", summary: "照看队友、补位、稳住团队" },
  { id: "command", label: "带队节奏", summary: "统一指挥、分工、推进" },
  { id: "guardianship", label: "护自己人", summary: "扛责护送、不让队友白给" },
  { id: "profit", label: "收益撤离", summary: "收益落袋、撤离兑现" },
  { id: "collection", label: "收藏图鉴", summary: "长期囤积、收藏满足" },
  { id: "disruption", label: "搅局戏剧", summary: "背刺、变局、打乱节奏" },
  { id: "torment", label: "折磨恶心", summary: "持续压迫、搞心态" },
  { id: "taxation", label: "堵点收税", summary: "空间封锁、撤离卡点" },
  { id: "belief", label: "立场信念", summary: "护自己人、情绪立场" },
  { id: "efficiency", label: "效率最优解", summary: "止损、性价比、结果优先" },
  { id: "style", label: "风格表达", summary: "自我理解、审美、味道" },
  { id: "fate", label: "命格玄学", summary: "爆率、运气、系统眷顾" },
  { id: "destruction", label: "破坏存在感", summary: "冲撞破局、压迫全场" },
];

export const gameIntentMeta: GameIntentMeta[] = [
  { id: "a", label: "A / 收益成长", summary: "摸金、收益、收藏、经济、撤离兑现" },
  { id: "b", label: "B / 战斗征服", summary: "狠狠干、击杀、突破、征服快感" },
  { id: "c", label: "C / 掌控策略", summary: "读局、效率、止损、风控、最优解" },
  { id: "d", label: "D / 团队担当", summary: "托底、带队、协同、护送、全员撤离" },
  { id: "e", label: "E / 风格戏剧", summary: "搅局、折磨、卡点、审美、命格戏剧" },
];
