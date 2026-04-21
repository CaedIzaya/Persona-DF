import { easterEggs } from "./easterEggs";
import { personas } from "./personas";
import { personaSignalOverrides } from "./personaSignalOverrides";
import { questions } from "./questions";
import {
  DIMENSION_IDS,
  EASTER_EGG_IDS,
  GAME_INTENT_IDS,
  MEANING_TAG_IDS,
  PERSONA_IDS,
  QUESTION_IDS,
  type AnswerMap,
  type DimensionId,
  type DimensionScoreMap,
  type EasterEggId,
  type EasterEggProfile,
  type EasterEggScoreMap,
  type GameIntentId,
  type GameIntentScoreMap,
  type MeaningScoreMap,
  type MeaningTagId,
  type PartialAnswerMap,
  type PartialMeaningScoreMap,
  type Persona,
  type PersonaId,
  type PersonaScoreMap,
  type QuestionId,
  type QuizOutcome,
  type RankedEasterEgg,
  type RankedPersona,
} from "./types";

const CORE_BONE_WEIGHT = 1.35;
const LEGACY_EGG_PROMOTION_WEIGHT = 2;
const PERSONA_CANDIDATE_POOL_SIZE = 6;
const DIMENSION_MATCH_WEIGHT = 0.33;
const PERSONA_SIGNAL_MATCH_WEIGHT = 0.6;
const INTENT_MATCH_WEIGHT = 0.07;
const SPECIAL_SIGNAL_HEAVY_DIMENSION_WEIGHT = 0.25;
const SPECIAL_SIGNAL_HEAVY_SIGNAL_WEIGHT = 0.68;
const SPECIAL_SIGNAL_HEAVY_INTENT_WEIGHT = 0.07;
const SIGNAL_HEAVY_SIGNAL_CAP_MULTIPLIER = 0.62;
const SIGNAL_HEAVY_PERSONA_IDS = new Set<PersonaId>(["jiahao", "laobeizha", "duqiaolai", "tangwang"]);
const DEFAULT_CLASS_EASTER_SIGNAL_HIT_RATE_THRESHOLD = 0.82;
const CLASS_EASTER_SIGNAL_HIT_RATE_THRESHOLDS: Partial<Record<PersonaId, number>> = {
  tangwang: 0.75,
  laobeizha: 0.75,
  duqiaolai: 0.8,
  jiahao: 0.84,
};
const CLASS_EASTER_DIRECT_UNLOCK_THRESHOLDS: Partial<Record<PersonaId, number>> = {
  tangwang: 0.75,
  laobeizha: 0.75,
  duqiaolai: 0.8,
  jiahao: 0.84,
};
const CLASS_UNLOCK_SIGNAL_BONUS: Partial<Record<PersonaId, number>> = {
  tangwang: 8,
  laobeizha: 10,
  duqiaolai: 8,
  jiahao: 5,
};
const JIAHAO_DIRECT_UNLOCK_HIT_RATE_THRESHOLD = 0.84;
const DIMENSION_HARD_GAP_THRESHOLD = 2.8;
const DIMENSION_HARD_GAP_PENALTY = 0.88;
const KEY_DIMENSION_CONSISTENT_GAP = 1.5;
const KEY_DIMENSION_CONSISTENT_BONUS = 2;
const EXTREME_KEY_DIMENSION_CONSISTENT_BONUS = 3;
const DATA_DRIVEN_PROFILE_WEIGHT = 0.65;
const DESIGN_PROFILE_WEIGHT = 0.35;
const PROFILE_ANCHOR_HIGH = 8;
const PROFILE_ANCHOR_LOW = 3;
const PROFILE_OPTION_SIGNATURE_SCALE = 1.8;
const LEGACY_EGG_RELEVANT_SIGNAL_MIN = 1.5;
const HIGH_SIGNAL_OVERRIDE_THRESHOLD = 6;

const CORE_BONE_QUESTION_IDS = new Set<QuestionId>([
  "gunfire",
  "teammate-downed",
  "after-fight",
  "single-extract-priority",
  "fun-source",
  "hate-point",
  "rich-but-greedy",
  "friendly-rat",
]);

const DIMENSION_WEIGHTS: Record<DimensionId, number> = {
  // 全题库均衡权重（总和 5.7）：
  // - 降低 team/tactics/rational 的过度主导
  // - 保持 loot 中性
  // - 适度抬升 combat/emotion，避免风格向单一理性流收敛
  combat: 0.88,
  team: 0.82,
  loot: 1.0,
  tactics: 0.93,
  rational: 1.05,
  emotion: 1.02,
};

const DIMENSION_TIE_EPSILON = 1.2;
const INTENT_TIE_EPSILON = 2;
const SCORE_TIE_EPSILON = 0.35;
const LOOT_ATTITUDE_QUESTION_ID: QuestionId = "loot-attitude";
const LOOT_ATTITUDE_XIPU_OPTION_ID = "small-is-enough";
const LOOT_ATTITUDE_TANGWANG_OPTION_ID = "eat-anything";
const TANGWANG_DISAMBIGUATION_BONUS = 3;

const LEGACY_EGG_TO_BASE_PERSONA: Partial<Record<EasterEggId, PersonaId>> = {
  tangwang: "tangwang",
  jiahao: "jiahao",
  laobeizha: "laobeizha",
  duqiaolai: "duqiaolai",
};
const BASE_PERSONA_TO_LEGACY_EGG = Object.fromEntries(
  Object.entries(LEGACY_EGG_TO_BASE_PERSONA).map(([eggId, personaId]) => [personaId, eggId as EasterEggId]),
) as Partial<Record<PersonaId, EasterEggId>>;
const CLASS_EASTER_BASE_REQUIREMENTS: Partial<Record<PersonaId, PersonaId[]>> = {
  jiahao: ["benzhigaoshou", "weilong"],
  laobeizha: ["duya", "benzhigaoshou"],
  duqiaolai: ["tujiu", "hadesen"],
  tangwang: ["shushu", "shoucangjia"],
};

const SPECIAL_EGG_PRIORITY: Record<EasterEggId, number> = {
  xipubawang: 1,
  linshu: 2,
  haotian: 3,
  duoshedelang: 4,
  tangwang: 999,
  jiahao: 999,
  laobeizha: 999,
  duqiaolai: 999,
};

const EXTREME_PERSONA_IDS = new Set<PersonaId>([
  "leisi",
  "saiyide",
  "hadesen",
  "tangwang",
  "shoucangjia",
  "duqiaolai",
  "laobeizha",
]);

const PERSONA_BALANCE_FACTORS: Partial<Record<PersonaId, number>> = {
  // 温和回正：只修正长期高频与长期低频人格，避免“反向过拟合”
  menggonglang: 0.94,
  hadesen: 0.98,
  jiaoguan: 1.02,
  benzhigaoshou: 0.93,
  tujiu: 0.9,
  weilong: 0.95,
  jiahao: 1.02,
  tangwang: 1.08,
  laobeizha: 1.1,
  duqiaolai: 1.05,
};
const PERSONA_SIGNAL_GAIN_FACTORS: Partial<Record<PersonaId, number>> = {
  // 本质高手在映射覆盖面明显更宽，单独压低映射增益，避免候选阶段过度冒头。
  benzhigaoshou: 0.88,
};

const PERSONA_KEY_DIMENSIONS: Partial<Record<PersonaId, DimensionId[]>> = {
  menggonglang: ["combat", "emotion"],
  laoban: ["loot", "rational"],
  shushu: ["loot", "combat"],
  benzhigaoshou: ["tactics", "rational"],
  mama: ["team", "emotion"],
  tujiu: ["tactics", "team"],
  shoucangjia: ["loot", "combat"],
  weilong: ["combat", "team"],
  jiaoguan: ["team", "tactics"],
  saiyide: ["combat", "emotion"],
  demulan: ["team", "tactics"],
  duya: ["tactics", "emotion"],
  hadesen: ["tactics", "rational"],
  leisi: ["combat", "emotion"],
  jiahao: ["combat", "emotion"],
  laobeizha: ["tactics", "emotion"],
  duqiaolai: ["tactics", "loot"],
  tangwang: ["loot", "combat"],
};

const gameIntentMeaningWeights: Record<GameIntentId, Partial<Record<MeaningTagId, number>>> = {
  a: {
    profit: 1.2,
    collection: 1.1,
    efficiency: 0.4,
    fate: 0.5,
  },
  b: {
    kill: 1.25,
    destruction: 1.15,
    belief: 0.45,
  },
  c: {
    control: 1.25,
    efficiency: 1.1,
    taxation: 0.5,
  },
  d: {
    care: 1.2,
    command: 1.2,
    guardianship: 1.15,
  },
  e: {
    disruption: 1.2,
    torment: 1.2,
    style: 1.1,
    fate: 0.55,
  },
};

const personaOrder = new Map(personas.map((persona, index) => [persona.id, index] as const));
const easterEggOrder = new Map(easterEggs.map((profile, index) => [profile.id, index] as const));
const validOptionsByQuestion = new Map(
  questions.map((question) => [question.id, new Set(question.options.map((option) => option.id))] as const),
);

const MAX_DIMENSION_DISTANCE = DIMENSION_IDS.reduce(
  (total, dimensionId) => total + DIMENSION_WEIGHTS[dimensionId] * 10,
  0,
);
const MAX_INTENT_DISTANCE = GAME_INTENT_IDS.length * 10;
const QUESTION_DIMENSION_MEANS = getQuestionDimensionMeans();
const PERSONA_SIGNAL_CAPS = getPersonaSignalCaps();
const CALIBRATED_DIMENSION_PROFILES = buildCalibratedDimensionProfiles();

export function createEmptyPersonaScoreMap(): PersonaScoreMap {
  return PERSONA_IDS.reduce((scores, personaId) => {
    scores[personaId] = 0;
    return scores;
  }, {} as PersonaScoreMap);
}

export function createEmptyEasterEggScoreMap(): EasterEggScoreMap {
  return EASTER_EGG_IDS.reduce((scores, eggId) => {
    scores[eggId] = 0;
    return scores;
  }, {} as EasterEggScoreMap);
}

export function createEmptyDimensionScoreMap(): DimensionScoreMap {
  return DIMENSION_IDS.reduce((scores, dimensionId) => {
    scores[dimensionId] = 0;
    return scores;
  }, {} as DimensionScoreMap);
}

export function createEmptyMeaningScoreMap(): MeaningScoreMap {
  return MEANING_TAG_IDS.reduce((scores, meaningId) => {
    scores[meaningId] = 0;
    return scores;
  }, {} as MeaningScoreMap);
}

export function createEmptyGameIntentScoreMap(): GameIntentScoreMap {
  return GAME_INTENT_IDS.reduce((scores, intentId) => {
    scores[intentId] = 0;
    return scores;
  }, {} as GameIntentScoreMap);
}

export function serializeAnswers(answers: PartialAnswerMap): string {
  return QUESTION_IDS
    .filter((questionId) => typeof answers[questionId] === "string")
    .map((questionId) => `${questionId}:${answers[questionId]}`)
    .join("|");
}

export function parseAnswerString(serialized: string | null): PartialAnswerMap {
  if (!serialized) {
    return {};
  }

  return serialized.split("|").reduce<PartialAnswerMap>((answers, segment) => {
    const [questionId, optionId] = segment.split(":");

    if (!questionId || !optionId) {
      return answers;
    }

    const typedQuestionId = questionId as QuestionId;
    const validOptions = validOptionsByQuestion.get(typedQuestionId);

    if (!validOptions?.has(optionId)) {
      return answers;
    }

    answers[typedQuestionId] = optionId;
    return answers;
  }, {});
}

export function isAnswerMapComplete(answers: PartialAnswerMap): answers is AnswerMap {
  return QUESTION_IDS.every((questionId) => {
    const selectedOptionId = answers[questionId];
    return typeof selectedOptionId === "string" && validOptionsByQuestion.get(questionId)?.has(selectedOptionId);
  });
}

export function scoreQuiz(answers: AnswerMap): QuizOutcome {
  const personaSignals = createEmptyPersonaScoreMap();
  const easterEggScores = createEmptyEasterEggScoreMap();
  const dimensionScores = createEmptyDimensionScoreMap();
  const meaningScores = createEmptyMeaningScoreMap();
  const gameIntentRawScores = createEmptyGameIntentScoreMap();
  const answerSeed = serializeAnswers(answers);

  for (const question of questions) {
    const selectedOptionId = answers[question.id];
    const selectedOption = question.options.find((option) => option.id === selectedOptionId);
    const questionWeight = getQuestionWeight(question.id);

    if (!selectedOption) {
      continue;
    }

    for (const dimensionId of DIMENSION_IDS) {
      dimensionScores[dimensionId] +=
        getRebalancedDimensionDelta(question.id, dimensionId, selectedOption.dimensionDeltas[dimensionId]) *
        questionWeight;
    }

    for (const meaningId of MEANING_TAG_IDS) {
      meaningScores[meaningId] += (selectedOption.meaningDeltas?.[meaningId] ?? 0) * questionWeight;
    }

    for (const personaId of PERSONA_IDS) {
      personaSignals[personaId] +=
        getOptionPersonaSignal(question.id, selectedOption.id, personaId, selectedOption.personaSignals) *
        (PERSONA_SIGNAL_GAIN_FACTORS[personaId] ?? 1) *
        questionWeight;
    }

    for (const eggId of EASTER_EGG_IDS) {
      const delta = (selectedOption.easterEggSignals?.[eggId] ?? 0) * questionWeight;
      easterEggScores[eggId] += delta;

      const promotedPersonaId = LEGACY_EGG_TO_BASE_PERSONA[eggId];
      if (promotedPersonaId) {
        personaSignals[promotedPersonaId] += delta * LEGACY_EGG_PROMOTION_WEIGHT;
      }
    }

    const intentDeltas = mapMeaningToGameIntentDeltas(selectedOption.meaningDeltas);
    for (const intentId of GAME_INTENT_IDS) {
      gameIntentRawScores[intentId] += (intentDeltas[intentId] ?? 0) * questionWeight;
    }
  }

  // QX 强判别：用于区分「西普坝王」与「唐王大人」
  const lootAttitudeAnswer = answers[LOOT_ATTITUDE_QUESTION_ID];
  if (lootAttitudeAnswer === LOOT_ATTITUDE_TANGWANG_OPTION_ID) {
    personaSignals.tangwang += TANGWANG_DISAMBIGUATION_BONUS;
  }

  const gameIntentScores = normalizeGameIntentScores(gameIntentRawScores);
  const regularPool = personas.filter((persona) => !SIGNAL_HEAVY_PERSONA_IDS.has(persona.id));
  const regularPoolRanking = buildPersonaRanking(
    regularPool,
    dimensionScores,
    gameIntentScores,
    personaSignals,
    answerSeed,
  );
  const regularCorePersona = regularPoolRanking[0]?.persona ?? regularPool[0];
  const unlockedClassPersonas = personas.filter((persona) =>
    isClassEasterPersonaUnlocked(persona.id, regularCorePersona.id, answers),
  );
  for (const unlockedPersona of unlockedClassPersonas) {
    const bonus = CLASS_UNLOCK_SIGNAL_BONUS[unlockedPersona.id] ?? 0;
    if (bonus > 0) {
      personaSignals[unlockedPersona.id] += bonus;
    }
  }
  const finalPersonaPool = [...regularPool, ...unlockedClassPersonas];
  const baseRanking = buildPersonaRanking(
    finalPersonaPool,
    dimensionScores,
    gameIntentScores,
    personaSignals,
    answerSeed,
  );
  const easterEggRanking = buildEasterEggRanking(easterEggScores, answerSeed);
  const shouldForceJiahao = shouldForcePersonaByHighSignalOptions("jiahao", answers);
  const rankingWithForcedJiahao = shouldForceJiahao ? ensurePersonaRankedFirst(baseRanking, "jiahao") : baseRanking;

  const corePersona = rankingWithForcedJiahao[0]?.persona ?? personas[0];
  const triggeredSpecialEggs = getTriggeredSpecialEggs(corePersona, answers, easterEggScores, answerSeed);
  const selectedEasterEgg = triggeredSpecialEggs[0]?.profile ?? null;

  const broadcastKind = selectedEasterEgg ? "easter_egg" : "base";
  const broadcastLabel = selectedEasterEgg
    ? `彩蛋触发：${selectedEasterEgg.nameCn}`
    : `基础人格：${corePersona.nameCn}`;

  return {
    corePersona,
    broadcastKind,
    broadcastLabel,
    easterEgg: selectedEasterEgg,
    baseRanking: rankingWithForcedJiahao,
    easterEggRanking,
    dimensionScores,
    meaningScores,
    gameIntentScores,
    personaSignals,
    easterEggScores,
    shareSummary: buildShareSummary(corePersona.nameCn, selectedEasterEgg?.nameCn ?? null),
  };
}

export function getSuggestedDimensionMatrix() {
  return PERSONA_IDS.reduce(
    (matrix, personaId) => {
      matrix[personaId] = DIMENSION_IDS.reduce((profile, dimensionId) => {
        profile[dimensionId] = Number(CALIBRATED_DIMENSION_PROFILES[personaId][dimensionId].toFixed(2));
        return profile;
      }, {} as Record<DimensionId, number>);
      return matrix;
    },
    {} as Record<PersonaId, Record<DimensionId, number>>,
  );
}

export function getDimensionCoverageAudit() {
  const byDimension = DIMENSION_IDS.reduce(
    (summary, dimensionId) => {
      summary[dimensionId] = {
        positive: 0,
        negative: 0,
        explicit: 0,
      };
      return summary;
    },
    {} as Record<DimensionId, { positive: number; negative: number; explicit: number }>,
  );

  const sparseOptions: Array<{ questionId: QuestionId; optionId: string; explicitDimensions: number }> = [];
  const incompleteCoreOptions: Array<{ questionId: QuestionId; optionId: string; explicitDimensions: number }> = [];
  let totalOptions = 0;

  for (const question of questions) {
    for (const option of question.options) {
      totalOptions += 1;
      let explicitDimensions = 0;

      for (const dimensionId of DIMENSION_IDS) {
        const value = option.dimensionDeltas[dimensionId];
        if (typeof value !== "number") {
          continue;
        }

        explicitDimensions += 1;
        byDimension[dimensionId].explicit += 1;
        if (value > 0) {
          byDimension[dimensionId].positive += 1;
        } else if (value < 0) {
          byDimension[dimensionId].negative += 1;
        }
      }

      if (explicitDimensions < 3) {
        sparseOptions.push({
          questionId: question.id,
          optionId: option.id,
          explicitDimensions,
        });
      }

      if (CORE_BONE_QUESTION_IDS.has(question.id) && explicitDimensions < DIMENSION_IDS.length) {
        incompleteCoreOptions.push({
          questionId: question.id,
          optionId: option.id,
          explicitDimensions,
        });
      }
    }
  }

  return {
    totalOptions,
    byDimension,
    sparseOptions,
    incompleteCoreOptions,
    recommendedMinPerSign: 25,
    recommendedSparseOptionRule: ">= 3 explicit dimensions per option",
    recommendedCoreBoneRule: "core bone questions should define all six dimensions",
  };
}

export function validatePersonaExpectations(
  cases: Array<{
    label: string;
    answers: AnswerMap;
    expectedTop1: PersonaId;
  }>,
) {
  let top1Hit = 0;
  let top3Hit = 0;
  const misses: Array<{
    label: string;
    expectedTop1: PersonaId;
    actualTop1: PersonaId;
    actualTop3: PersonaId[];
  }> = [];

  for (const item of cases) {
    const outcome = scoreQuiz(item.answers);
    const actualTop1 = outcome.baseRanking[0]?.persona.id ?? outcome.corePersona.id;
    const actualTop3 = outcome.baseRanking.slice(0, 3).map((entry) => entry.persona.id);
    if (actualTop1 === item.expectedTop1) {
      top1Hit += 1;
    }

    if (actualTop3.includes(item.expectedTop1)) {
      top3Hit += 1;
    }

    if (actualTop1 !== item.expectedTop1) {
      misses.push({
        label: item.label,
        expectedTop1: item.expectedTop1,
        actualTop1,
        actualTop3,
      });
    }
  }

  const total = cases.length || 1;
  return {
    totalCases: cases.length,
    top1Hit,
    top3Hit,
    top1Accuracy: Number(((top1Hit / total) * 100).toFixed(2)),
    top3Accuracy: Number(((top3Hit / total) * 100).toFixed(2)),
    misses,
  };
}

function buildPersonaRanking(
  targets: Persona[],
  dimensionScores: DimensionScoreMap,
  gameIntentScores: GameIntentScoreMap,
  personaSignals: PersonaScoreMap,
  answerSeed: string,
): RankedPersona[] {
  const dimensionBounds = getDimensionBounds();
  const normalizedVector = toNormalizedDimensionVector(dimensionScores, dimensionBounds);

  const candidates = targets.map((persona) => {
    const personaDimensionProfile = CALIBRATED_DIMENSION_PROFILES[persona.id];
    const dimensionDistance = calcDimensionDistance(normalizedVector, personaDimensionProfile);
    const intentDistance = calcIntentDistance(gameIntentScores, persona);
    const signalScore = personaSignals[persona.id];
    const score = calcPersonaDisplayScore(
      persona.id,
      dimensionDistance,
      signalScore,
      intentDistance,
      normalizedVector,
      personaDimensionProfile,
    );
    const signalFit = calcPersonaSignalFit(persona.id, signalScore);

    return {
      persona,
      score,
      dimensionDistance,
      intentDistance,
      signalScore,
      signalFit,
    };
  });

  const signalCandidates = [...candidates]
    .sort((left, right) => {
      if (right.signalFit !== left.signalFit) {
        return right.signalFit - left.signalFit;
      }

      if (right.signalScore !== left.signalScore) {
        return right.signalScore - left.signalScore;
      }

      const rightRoll = stableRoll(answerSeed, right.persona.id);
      const leftRoll = stableRoll(answerSeed, left.persona.id);
      if (rightRoll !== leftRoll) {
        return rightRoll - leftRoll;
      }

      return (personaOrder.get(left.persona.id) ?? 0) - (personaOrder.get(right.persona.id) ?? 0);
    })
    .slice(0, Math.min(PERSONA_CANDIDATE_POOL_SIZE, candidates.length));

  return signalCandidates
    .sort((left, right) => {
      const scoreGap = Math.abs(left.score - right.score);
      if (scoreGap > SCORE_TIE_EPSILON) {
        return right.score - left.score;
      }

      const dimensionGap = Math.abs(left.dimensionDistance - right.dimensionDistance);
      if (dimensionGap > DIMENSION_TIE_EPSILON) {
        return left.dimensionDistance - right.dimensionDistance;
      }

      if (right.signalScore !== left.signalScore) {
        return right.signalScore - left.signalScore;
      }

      const intentGap = Math.abs(left.intentDistance - right.intentDistance);
      if (intentGap > INTENT_TIE_EPSILON) {
        return left.intentDistance - right.intentDistance;
      }

      const rightRoll = stableRoll(answerSeed, right.persona.id);
      const leftRoll = stableRoll(answerSeed, left.persona.id);
      if (rightRoll !== leftRoll) {
        return rightRoll - leftRoll;
      }

      return (personaOrder.get(left.persona.id) ?? 0) - (personaOrder.get(right.persona.id) ?? 0);
    })
    .map(({ persona, score }) => ({
      persona,
      score: Number(score.toFixed(2)),
    }));
}

function buildEasterEggRanking(easterEggScores: EasterEggScoreMap, answerSeed: string): RankedEasterEgg[] {
  return easterEggs
    .map((profile) => ({
      profile,
      score: easterEggScores[profile.id],
    }))
    .sort((left, right) => {
      const leftPriority = SPECIAL_EGG_PRIORITY[left.profile.id];
      const rightPriority = SPECIAL_EGG_PRIORITY[right.profile.id];

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      if (right.score !== left.score) {
        return right.score - left.score;
      }

      const rightRoll = stableRoll(answerSeed, right.profile.id);
      const leftRoll = stableRoll(answerSeed, left.profile.id);
      if (rightRoll !== leftRoll) {
        return rightRoll - leftRoll;
      }

      return (easterEggOrder.get(left.profile.id) ?? 0) - (easterEggOrder.get(right.profile.id) ?? 0);
    });
}

function getTriggeredSpecialEggs(
  corePersona: Persona,
  answers: AnswerMap,
  easterEggScores: EasterEggScoreMap,
  answerSeed: string,
): RankedEasterEgg[] {
  const triggered = easterEggs
    .filter((profile) => isSpecialEggTriggered(profile, corePersona, answers))
    .map((profile) => ({
      profile,
      score: easterEggScores[profile.id],
    }));

  return triggered.sort((left, right) => {
    const leftPriority = SPECIAL_EGG_PRIORITY[left.profile.id];
    const rightPriority = SPECIAL_EGG_PRIORITY[right.profile.id];

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    if (right.score !== left.score) {
      return right.score - left.score;
    }

    const rightRoll = stableRoll(answerSeed, right.profile.id);
    const leftRoll = stableRoll(answerSeed, left.profile.id);
    if (rightRoll !== leftRoll) {
      return rightRoll - leftRoll;
    }

    return (easterEggOrder.get(left.profile.id) ?? 0) - (easterEggOrder.get(right.profile.id) ?? 0);
  });
}

function isSpecialEggTriggered(profile: EasterEggProfile, corePersona: Persona, answers: AnswerMap): boolean {
  const lootAttitudeAnswer = answers[LOOT_ATTITUDE_QUESTION_ID];

  switch (profile.id) {
    case "xipubawang":
      if (lootAttitudeAnswer === LOOT_ATTITUDE_TANGWANG_OPTION_ID) {
        return false;
      }

      return (
        lootAttitudeAnswer === LOOT_ATTITUDE_XIPU_OPTION_ID &&
        corePersona.id === "shushu" &&
        answers.map === "dam" &&
        answers.difficulty === "normal"
      );
    case "linshu":
      return (
        (corePersona.id === "benzhigaoshou" || corePersona.id === "menggonglang") &&
        answers.map === "space-base" &&
        answers.difficulty === "classified" &&
        answers.operator === "assault"
      );
    case "haotian":
      return (
        (corePersona.id === "benzhigaoshou" || corePersona.id === "menggonglang") &&
        answers.map === "space-base" &&
        answers.difficulty === "classified" &&
        answers.operator === "recon"
      );
    case "duoshedelang":
      return (
        corePersona.id === "tujiu" &&
        answers["after-fight"] === "leave-with-profit" &&
        answers.loadout === "torment-kit"
      );
    default:
      return false;
  }
}

export function getDimensionBounds(): Record<DimensionId, { min: number; max: number }> {
  return DIMENSION_IDS.reduce(
    (bounds, dimensionId) => {
      const range = questions.reduce(
        (current, question) => {
          const questionWeight = getQuestionWeight(question.id);
          const values = question.options.map(
            (option) =>
              getRebalancedDimensionDelta(question.id, dimensionId, option.dimensionDeltas[dimensionId]) *
              questionWeight,
          );

          current.min += Math.min(...values);
          current.max += Math.max(...values);
          return current;
        },
        { min: 0, max: 0 },
      );

      bounds[dimensionId] = range;
      return bounds;
    },
    {} as Record<DimensionId, { min: number; max: number }>,
  );
}

export function normalizeDimensionScore(
  dimensionId: DimensionId,
  score: number,
  bounds: Record<DimensionId, { min: number; max: number }> = getDimensionBounds(),
): number {
  const { min, max } = bounds[dimensionId];

  if (max === min) {
    return 50;
  }

  return ((score - min) / (max - min)) * 100;
}

export function getGameIntentBounds(): Record<GameIntentId, { min: number; max: number }> {
  return GAME_INTENT_IDS.reduce(
    (bounds, intentId) => {
      const range = questions.reduce(
        (current, question) => {
          const questionWeight = getQuestionWeight(question.id);
          const values = question.options.map((option) => {
            const deltas = mapMeaningToGameIntentDeltas(option.meaningDeltas);
            return (deltas[intentId] ?? 0) * questionWeight;
          });

          current.min += Math.min(...values);
          current.max += Math.max(...values);
          return current;
        },
        { min: 0, max: 0 },
      );

      bounds[intentId] = range;
      return bounds;
    },
    {} as Record<GameIntentId, { min: number; max: number }>,
  );
}

export function normalizeGameIntentScore(
  intentId: GameIntentId,
  score: number,
  bounds: Record<GameIntentId, { min: number; max: number }> = getGameIntentBounds(),
): number {
  const { min, max } = bounds[intentId];

  if (max === min) {
    return 5;
  }

  const normalized = ((score - min) / (max - min)) * 10;
  return Math.min(10, Math.max(0, normalized));
}

export function normalizeGameIntentScores(rawScores: GameIntentScoreMap) {
  const bounds = getGameIntentBounds();

  return GAME_INTENT_IDS.reduce((scores, intentId) => {
    scores[intentId] = Number(normalizeGameIntentScore(intentId, rawScores[intentId], bounds).toFixed(1));
    return scores;
  }, createEmptyGameIntentScoreMap());
}

export function getTopMeaningTags(meaningScores: MeaningScoreMap, count = 3) {
  return [...MEANING_TAG_IDS]
    .map((meaningId) => ({
      id: meaningId,
      score: meaningScores[meaningId],
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, count);
}

export function getTopGameIntents(gameIntentScores: GameIntentScoreMap, count = 2) {
  return [...GAME_INTENT_IDS]
    .map((intentId) => ({
      id: intentId,
      score: gameIntentScores[intentId],
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, count);
}

function toNormalizedDimensionVector(
  rawDimensionScores: DimensionScoreMap,
  bounds: Record<DimensionId, { min: number; max: number }>,
) {
  return DIMENSION_IDS.reduce((vector, dimensionId) => {
    const { min, max } = bounds[dimensionId];
    const raw = rawDimensionScores[dimensionId];

    if (max === min) {
      vector[dimensionId] = 5;
      return vector;
    }

    const normalized = ((raw - min) / (max - min)) * 10;
    vector[dimensionId] = Math.min(10, Math.max(0, normalized));
    return vector;
  }, {} as Record<DimensionId, number>);
}

function calcDimensionDistance(
  userVector: Record<DimensionId, number>,
  personaDimensionProfile: Record<DimensionId, number>,
): number {
  return DIMENSION_IDS.reduce((total, dimensionId) => {
    const userValue = userVector[dimensionId];
    const personaValue = personaDimensionProfile[dimensionId];
    const weight = DIMENSION_WEIGHTS[dimensionId];

    return total + Math.abs(userValue - personaValue) * weight;
  }, 0);
}

function calcIntentDistance(userIntentScores: GameIntentScoreMap, persona: Persona): number {
  const personaIntentScores = mapMeaningProfileToIntentPrototype(persona.meaningProfile);

  return GAME_INTENT_IDS.reduce((total, intentId) => {
    return total + Math.abs(userIntentScores[intentId] - personaIntentScores[intentId]);
  }, 0);
}

function mapMeaningProfileToIntentPrototype(meaningProfile: PartialMeaningScoreMap): GameIntentScoreMap {
  const rawIntentScores = mapMeaningToGameIntentDeltas(meaningProfile);
  const max = Math.max(0, ...GAME_INTENT_IDS.map((intentId) => rawIntentScores[intentId]));

  if (max <= 0) {
    return createEmptyGameIntentScoreMap();
  }

  return GAME_INTENT_IDS.reduce((scores, intentId) => {
    scores[intentId] = (rawIntentScores[intentId] / max) * 10;
    return scores;
  }, createEmptyGameIntentScoreMap());
}

function calcPersonaDisplayScore(
  personaId: PersonaId,
  dimensionDistance: number,
  signalScore: number,
  intentDistance: number,
  userVector: Record<DimensionId, number>,
  personaDimensionProfile: Record<DimensionId, number>,
): number {
  const matchWeights = SIGNAL_HEAVY_PERSONA_IDS.has(personaId)
    ? {
        dimensionWeight: SPECIAL_SIGNAL_HEAVY_DIMENSION_WEIGHT,
        signalWeight: SPECIAL_SIGNAL_HEAVY_SIGNAL_WEIGHT,
        intentWeight: SPECIAL_SIGNAL_HEAVY_INTENT_WEIGHT,
      }
    : {
        dimensionWeight: DIMENSION_MATCH_WEIGHT,
        signalWeight: PERSONA_SIGNAL_MATCH_WEIGHT,
        intentWeight: INTENT_MATCH_WEIGHT,
      };
  const dimensionFit = 1 - dimensionDistance / MAX_DIMENSION_DISTANCE;
  const signalFit = calcPersonaSignalFit(personaId, signalScore);
  const intentFit = 1 - intentDistance / MAX_INTENT_DISTANCE;
  const dimensionConstraint = getDimensionConstraint(personaId, userVector, personaDimensionProfile);
  const consistencyBonus = getPersonaConsistencyBonus(personaId, dimensionConstraint);

  const weightedScore =
    dimensionFit * (matchWeights.dimensionWeight * 100) +
    signalFit * (matchWeights.signalWeight * 100) +
    intentFit * (matchWeights.intentWeight * 100);
  const score = weightedScore * dimensionConstraint.penaltyMultiplier + consistencyBonus;
  const balanceFactor = PERSONA_BALANCE_FACTORS[personaId] ?? 1;
  return Math.min(100, Math.max(0, score * balanceFactor));
}

function calcPersonaSignalFit(personaId: PersonaId, signalScore: number) {
  const rawSignalCap = PERSONA_SIGNAL_CAPS[personaId] || 0;
  const signalCap = SIGNAL_HEAVY_PERSONA_IDS.has(personaId)
    ? rawSignalCap * SIGNAL_HEAVY_SIGNAL_CAP_MULTIPLIER
    : rawSignalCap;
  return signalCap > 0 ? Math.min(1, Math.max(0, signalScore / signalCap)) : 0;
}

function getDimensionConstraint(
  personaId: PersonaId,
  userVector: Record<DimensionId, number>,
  personaDimensionProfile: Record<DimensionId, number>,
) {
  const keyDimensions = PERSONA_KEY_DIMENSIONS[personaId] ?? [];
  if (!keyDimensions.length) {
    return {
      penaltyMultiplier: 1,
      isConsistent: false,
    };
  }

  const gaps = keyDimensions.map((dimensionId) => Math.abs(userVector[dimensionId] - personaDimensionProfile[dimensionId]));
  const hasHardGap = gaps.some((gap) => gap > DIMENSION_HARD_GAP_THRESHOLD);
  const isConsistent = gaps.every((gap) => gap <= KEY_DIMENSION_CONSISTENT_GAP);

  return {
    penaltyMultiplier: hasHardGap ? DIMENSION_HARD_GAP_PENALTY : 1,
    isConsistent,
  };
}

function getPersonaConsistencyBonus(
  personaId: PersonaId,
  constraint: { penaltyMultiplier: number; isConsistent: boolean },
) {
  if (!constraint.isConsistent || constraint.penaltyMultiplier < 1) {
    return 0;
  }

  return EXTREME_PERSONA_IDS.has(personaId)
    ? EXTREME_KEY_DIMENSION_CONSISTENT_BONUS
    : KEY_DIMENSION_CONSISTENT_BONUS;
}

function getPersonaSignalCaps(): PersonaScoreMap {
  const caps = createEmptyPersonaScoreMap();

  for (const question of questions) {
    const questionWeight = getQuestionWeight(question.id);

    for (const personaId of PERSONA_IDS) {
      let questionBest = 0;

      for (const option of question.options) {
        let signal =
          getOptionPersonaSignal(question.id, option.id, personaId, option.personaSignals) * questionWeight;

        for (const eggId of EASTER_EGG_IDS) {
          const promotedPersonaId = LEGACY_EGG_TO_BASE_PERSONA[eggId];
          if (promotedPersonaId !== personaId) {
            continue;
          }

          const eggDelta = (option.easterEggSignals?.[eggId] ?? 0) * questionWeight;
          signal += eggDelta * LEGACY_EGG_PROMOTION_WEIGHT;
        }

        if (signal > questionBest) {
          questionBest = signal;
        }
      }

      caps[personaId] += questionBest;
    }
  }

  // QX 强判别附加分：把理论上限也同步补齐
  caps.tangwang += TANGWANG_DISAMBIGUATION_BONUS;

  return caps;
}

function getOptionPersonaSignal(
  questionId: QuestionId,
  optionId: string,
  personaId: PersonaId,
  fallbackSignals: Partial<Record<PersonaId, number>> | undefined,
) {
  const overrideSignals = personaSignalOverrides[questionId]?.[optionId];
  if (overrideSignals) {
    return overrideSignals[personaId] ?? 0;
  }

  return fallbackSignals?.[personaId] ?? 0;
}

function mapMeaningToGameIntentDeltas(meaningDeltas: PartialMeaningScoreMap | undefined): GameIntentScoreMap {
  const result = createEmptyGameIntentScoreMap();

  if (!meaningDeltas) {
    return result;
  }

  for (const intentId of GAME_INTENT_IDS) {
    const weights = gameIntentMeaningWeights[intentId];
    let total = 0;

    for (const meaningId of MEANING_TAG_IDS) {
      const weight = weights[meaningId] ?? 0;
      if (!weight) {
        continue;
      }

      total += (meaningDeltas[meaningId] ?? 0) * weight;
    }

    result[intentId] = total;
  }

  return result;
}

function getQuestionDimensionMeans() {
  return questions.reduce(
    (meansByQuestion, question) => {
      meansByQuestion[question.id] = DIMENSION_IDS.reduce(
        (means, dimensionId) => {
          const values = question.options.map((option) => option.dimensionDeltas[dimensionId] ?? 0);
          means[dimensionId] = values.reduce((total, value) => total + value, 0) / values.length;
          return means;
        },
        {} as Record<DimensionId, number>,
      );
      return meansByQuestion;
    },
    {} as Record<QuestionId, Record<DimensionId, number>>,
  );
}

function buildCalibratedDimensionProfiles(): Record<PersonaId, Record<DimensionId, number>> {
  const matrix = PERSONA_IDS.reduce((acc, personaId) => {
    const weightedSum = createEmptyDimensionScoreMap();
    let totalWeight = 0;

    for (const question of questions) {
      const questionWeight = getQuestionWeight(question.id);

      for (const option of question.options) {
        const signal = getOptionPersonaSignal(question.id, option.id, personaId, option.personaSignals) * questionWeight;
        if (signal <= 0) {
          continue;
        }

        totalWeight += signal;
        for (const dimensionId of DIMENSION_IDS) {
          const normalizedOptionValue = toOptionDimensionSignature(question.id, dimensionId, option.dimensionDeltas[dimensionId]);
          weightedSum[dimensionId] += normalizedOptionValue * signal;
        }
      }
    }

    const basePersona = personas.find((persona) => persona.id === personaId);
    const baseProfile = DIMENSION_IDS.reduce((profile, dimensionId) => {
      profile[dimensionId] = basePersona?.dimensionProfile[dimensionId] ?? 5;
      return profile;
    }, {} as Record<DimensionId, number>);

    const dataDrivenProfile = DIMENSION_IDS.reduce((profile, dimensionId) => {
      if (totalWeight <= 0) {
        profile[dimensionId] = baseProfile[dimensionId];
        return profile;
      }

      profile[dimensionId] = weightedSum[dimensionId] / totalWeight;
      return profile;
    }, {} as Record<DimensionId, number>);

    const blendedProfile = DIMENSION_IDS.reduce((profile, dimensionId) => {
      const blended = dataDrivenProfile[dimensionId] * DATA_DRIVEN_PROFILE_WEIGHT + baseProfile[dimensionId] * DESIGN_PROFILE_WEIGHT;
      profile[dimensionId] = clamp(blended, 0, 10);
      return profile;
    }, {} as Record<DimensionId, number>);

    acc[personaId] = applyProfileAnchors(baseProfile, blendedProfile);
    return acc;
  }, {} as Record<PersonaId, Record<DimensionId, number>>);

  return matrix;
}

function toOptionDimensionSignature(questionId: QuestionId, dimensionId: DimensionId, rawDelta: number | undefined) {
  const centered = getRebalancedDimensionDelta(questionId, dimensionId, rawDelta);
  return clamp(5 + centered * PROFILE_OPTION_SIGNATURE_SCALE, 0, 10);
}

function applyProfileAnchors(
  baseProfile: Record<DimensionId, number>,
  blendedProfile: Record<DimensionId, number>,
): Record<DimensionId, number> {
  const anchored = { ...blendedProfile };
  const keyDimensions = [...DIMENSION_IDS].sort(
    (left, right) => Math.abs(baseProfile[right] - 5) - Math.abs(baseProfile[left] - 5),
  );

  for (const dimensionId of keyDimensions.slice(0, 2)) {
    const baseValue = baseProfile[dimensionId];
    if (baseValue >= PROFILE_ANCHOR_HIGH) {
      anchored[dimensionId] = Math.max(anchored[dimensionId], PROFILE_ANCHOR_HIGH);
      continue;
    }

    if (baseValue <= PROFILE_ANCHOR_LOW) {
      anchored[dimensionId] = Math.min(anchored[dimensionId], PROFILE_ANCHOR_LOW);
    }
  }

  return anchored;
}

function getRebalancedDimensionDelta(
  questionId: QuestionId,
  dimensionId: DimensionId,
  rawDelta: number | undefined,
) {
  const baseline = QUESTION_DIMENSION_MEANS[questionId]?.[dimensionId] ?? 0;
  return (rawDelta ?? 0) - baseline;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildShareSummary(coreName: string, easterEggName: string | null): string {
  if (easterEggName) {
    return `彩蛋触发：${easterEggName}（主人格底色：${coreName}）`;
  }

  return `基础人格：${coreName}`;
}

function isClassEasterPersonaUnlocked(
  personaId: PersonaId,
  regularCorePersonaId: PersonaId,
  answers: AnswerMap,
) {
  if (!SIGNAL_HEAVY_PERSONA_IDS.has(personaId)) {
    return false;
  }

  const mappedEggId = BASE_PERSONA_TO_LEGACY_EGG[personaId];
  if (!mappedEggId) {
    return false;
  }

  const signalHitRate = getLegacyEggSignalHitRate(mappedEggId, answers);
  // 高命中率可直通，避免被前置人格硬门槛完全挡住
  const directUnlockThreshold =
    CLASS_EASTER_DIRECT_UNLOCK_THRESHOLDS[personaId] ??
    (personaId === "jiahao" ? JIAHAO_DIRECT_UNLOCK_HIT_RATE_THRESHOLD : undefined);
  if (typeof directUnlockThreshold === "number" && signalHitRate >= directUnlockThreshold) {
    return true;
  }

  const requiredBasePersonas = CLASS_EASTER_BASE_REQUIREMENTS[personaId] ?? [];
  if (!requiredBasePersonas.includes(regularCorePersonaId)) {
    return false;
  }
  const threshold = CLASS_EASTER_SIGNAL_HIT_RATE_THRESHOLDS[personaId] ?? DEFAULT_CLASS_EASTER_SIGNAL_HIT_RATE_THRESHOLD;
  return signalHitRate >= threshold;
}

function getLegacyEggSignalHitRate(eggId: EasterEggId, answers: AnswerMap) {
  const relevantQuestions = questions.filter((question) =>
    question.options.some((option) => (option.easterEggSignals?.[eggId] ?? 0) >= LEGACY_EGG_RELEVANT_SIGNAL_MIN),
  );

  if (relevantQuestions.length === 0) {
    return 0;
  }

  let hitScore = 0;
  let maxScore = 0;

  for (const question of relevantQuestions) {
    const questionWeight = getQuestionWeight(question.id);
    const selectedOptionId = answers[question.id];
    const selectedOption = question.options.find((option) => option.id === selectedOptionId);
    const selectedSignal = (selectedOption?.easterEggSignals?.[eggId] ?? 0) * questionWeight;
    const questionMaxSignal =
      Math.max(...question.options.map((option) => (option.easterEggSignals?.[eggId] ?? 0))) * questionWeight;

    hitScore += selectedSignal;
    maxScore += questionMaxSignal;
  }

  if (maxScore <= 0) {
    return 0;
  }

  return hitScore / maxScore;
}

function shouldForcePersonaByHighSignalOptions(personaId: PersonaId, answers: AnswerMap) {
  const requiredQuestionIds = new Set<QuestionId>();

  for (const question of questions) {
    const highSignalOptions = question.options.filter((option) => {
      const signal = getOptionPersonaSignal(question.id, option.id, personaId, option.personaSignals);
      return signal >= HIGH_SIGNAL_OVERRIDE_THRESHOLD;
    });

    if (highSignalOptions.length === 0) {
      continue;
    }

    requiredQuestionIds.add(question.id);
    const selectedOptionId = answers[question.id];
    if (!highSignalOptions.some((option) => option.id === selectedOptionId)) {
      return false;
    }
  }

  return requiredQuestionIds.size > 0;
}

function ensurePersonaRankedFirst(ranking: RankedPersona[], personaId: PersonaId): RankedPersona[] {
  const existing = ranking.find((entry) => entry.persona.id === personaId);
  const targetPersona = personas.find((persona) => persona.id === personaId);
  if (!targetPersona) {
    return ranking;
  }

  const topScore = ranking[0]?.score ?? 0;
  const forcedEntry: RankedPersona = {
    persona: targetPersona,
    score: Math.max(topScore, existing?.score ?? 0),
  };

  return [forcedEntry, ...ranking.filter((entry) => entry.persona.id !== personaId)];
}

function getQuestionWeight(questionId: QuestionId): number {
  return CORE_BONE_QUESTION_IDS.has(questionId) ? CORE_BONE_WEIGHT : 1;
}

function stableRoll(seed: string, key: string): number {
  const input = `${seed}|${key}`;
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}
