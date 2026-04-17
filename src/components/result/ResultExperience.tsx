"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PersonaImage } from "@/components/common/PersonaImage";
import {
  getDimensionBounds,
  isAnswerMapComplete,
  normalizeDimensionScore,
  parseAnswerString,
  scoreQuiz,
} from "@/lib/quiz/scoring";
import { getPersonaImagePosition, getPersonaImageUrl } from "@/lib/quiz/personaVisuals";
import {
  gameIntentMeta,
  type GameIntentId,
  type PersonaAnalysisContent,
  type PersonaId,
} from "@/lib/quiz/types";

const BILIBILI_URL = "https://space.bilibili.com/202993136?spm_id_from=333.33.0.0";

export function ResultExperience({
  analysisMap,
}: {
  analysisMap: Partial<Record<PersonaId, PersonaAnalysisContent>>;
}) {
  const searchParams = useSearchParams();

  const parsedAnswers = useMemo(
    () => parseAnswerString(searchParams.get("answers")),
    [searchParams],
  );

  const outcome = useMemo(() => {
    if (!isAnswerMapComplete(parsedAnswers)) {
      return null;
    }

    return scoreQuiz(parsedAnswers);
  }, [parsedAnswers]);

  const bounds = useMemo(() => getDimensionBounds(), []);
  const [showCorePersonaCard, setShowCorePersonaCard] = useState(false);

  if (!outcome) {
    return (
      <main className="py-12">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-6">
          <section className="panel p-8 text-center">
            <h1 className="text-3xl font-semibold text-white">先答完题，再出结果</h1>
            <div className="mt-6 flex justify-center">
              <Link href="/quiz" className="button-primary">
                去答题
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const coreAnalysis = analysisMap[outcome.corePersona.id];
  const isEaster = Boolean(outcome.easterEgg);
  const isShowingCoreCard = isEaster && showCorePersonaCard;
  const coreOneLiner = (coreAnalysis?.oneLiner || outcome.corePersona.summary).replace(/\s+/g, " ").trim();
  const easterOneLiner = (outcome.easterEgg?.revealLine || outcome.easterEgg?.summary || "")
    .replace(/\s+/g, " ")
    .trim();
  const displayName = isShowingCoreCard
    ? outcome.corePersona.nameCn
    : (outcome.easterEgg?.nameCn ?? outcome.corePersona.nameCn);
  const displayImage = isShowingCoreCard
    ? getPersonaImageUrl(outcome.corePersona.nameCn)
    : (outcome.easterEgg?.imageUrl ?? getPersonaImageUrl(outcome.corePersona.nameCn));
  const displayImagePosition = getPersonaImagePosition(displayName);
  const displayCode = isShowingCoreCard
    ? outcome.corePersona.shortCode
    : (isEaster ? outcome.easterEgg?.nameEn : outcome.corePersona.shortCode) ?? "";
  const oneLiner = isShowingCoreCard ? coreOneLiner : (isEaster ? easterOneLiner || coreOneLiner : coreOneLiner);

  const combat = normalizeDimensionScore("combat", outcome.dimensionScores.combat, bounds);
  const team = normalizeDimensionScore("team", outcome.dimensionScores.team, bounds);
  const loot = normalizeDimensionScore("loot", outcome.dimensionScores.loot, bounds);
  const tactics = normalizeDimensionScore("tactics", outcome.dimensionScores.tactics, bounds);
  const rational = normalizeDimensionScore("rational", outcome.dimensionScores.rational, bounds);
  const emotion = normalizeDimensionScore("emotion", outcome.dimensionScores.emotion, bounds);
  const driveValue = Math.max(rational, emotion);
  const driveLabel = rational >= emotion ? "理性驱动" : "感性驱动";

  const topIntent = (Object.entries(outcome.gameIntentScores) as [GameIntentId, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const topIntentMeta = gameIntentMeta.find((item) => item.id === topIntent?.[0]);
  const meaningValue = Math.max(0, Math.min(100, (topIntent?.[1] ?? 0) * 10));
  const meaningLabel = topIntentMeta?.label.split("/")[1]?.trim() || "收益成长";

  const topMatch = outcome.baseRanking[0];
  const secondMatch = outcome.baseRanking[1];
  const thirdMatch = outcome.baseRanking[2];
  const topMatchPercent = Math.round(topMatch?.score ?? 0);

  const radarItems = [
    { label: "交战意愿", value: combat },
    { label: "团队责任", value: team },
    { label: "摸金意愿", value: loot },
    { label: "战术意识", value: tactics },
    { label: driveLabel, value: driveValue },
    { label: `意义感：${meaningLabel}`, value: meaningValue },
  ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-canvas py-8 sm:py-10">
      <div className="relative mx-auto w-full max-w-4xl space-y-6 px-4 sm:px-6">
        <section className="panel p-5 sm:p-7">
          <p className="eyebrow text-center">结果揭晓</p>
          <h1 className="mt-3 text-center text-3xl font-semibold text-zinc-300 sm:text-4xl">你的人格是</h1>
          <h2 className="mt-2 text-center text-5xl font-semibold text-white sm:text-6xl">{displayName}</h2>
          <p className="mt-3 text-center text-2xl font-semibold text-signal sm:text-3xl">{displayCode}</p>

          <div className="relative mt-6 h-[360px] w-full overflow-hidden rounded-md border border-white/10 bg-black/40 sm:h-[520px]">
            <PersonaImage
              src={displayImage}
              alt={`${displayName} 人格图`}
              fill
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
              className="h-full w-full object-contain"
              style={{ objectPosition: displayImagePosition }}
            />
          </div>

          <div className="mt-5 space-y-2 text-center">
            <p className="text-lg font-medium leading-8 text-white">{oneLiner}</p>
            {isEaster ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowCorePersonaCard((current) => !current)}
                  className="button-secondary"
                >
                  {isShowingCoreCard ? "展示彩蛋人格" : "展示主人格"}
                </button>
              </div>
            ) : null}
            <p className="text-sm text-zinc-300">匹配程度：{topMatchPercent}%</p>
          </div>
        </section>

        <section className="panel p-5 sm:p-7">
          <h3 className="text-2xl font-semibold text-white">六维图</h3>
          <p className="mt-2 text-sm text-zinc-400">游戏意义感只显示你最突出的那一项。</p>
          <div className="mt-6 flex justify-center">
            <RadarHexChart items={radarItems} />
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {radarItems.map((item) => (
              <div key={item.label} className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs text-zinc-400">{item.label}</p>
                <p className="text-sm font-semibold text-white">{item.value.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5 sm:p-7">
          <h3 className="text-2xl font-semibold text-white">人格解析</h3>
          <p className="mt-2 text-xs text-zinc-400">
            免责声明：本解析不构成任何专业解读，仅供娱乐。
          </p>
          <div className="mt-5 space-y-5">
            <SimpleBlock title="游戏行为" content={coreAnalysis?.gameplay || outcome.corePersona.playstyle} />
            <SimpleBlock title="优点价值" content={coreAnalysis?.value || outcome.corePersona.tacticalProfile} />
            <SimpleBlock title="真实心理" content={coreAnalysis?.psychology || outcome.corePersona.summary} />
            <SimpleBlock title="需要注意的点" content={coreAnalysis?.caution || outcome.corePersona.blindSpots.join("；")} />
          </div>
        </section>

        <section className="panel space-y-6 p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">你的2nd匹配人格是</p>
              {secondMatch ? (
                <>
                  <p className="mt-1 text-xl font-semibold text-white">{secondMatch.persona.nameCn}</p>
                  <PersonaImage
                    src={getPersonaImageUrl(secondMatch.persona.nameCn)}
                    alt={`${secondMatch.persona.nameCn} 人格图`}
                    width={640}
                    height={320}
                    sizes="(min-width: 640px) 320px, 100vw"
                    className="mt-3 h-48 w-full rounded-md border border-white/10 object-contain"
                  />
                </>
              ) : (
                <p className="mt-1 text-sm text-zinc-300">暂无</p>
              )}
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">你的3rd匹配人格是</p>
              {thirdMatch ? (
                <>
                  <p className="mt-1 text-xl font-semibold text-white">{thirdMatch.persona.nameCn}</p>
                  <PersonaImage
                    src={getPersonaImageUrl(thirdMatch.persona.nameCn)}
                    alt={`${thirdMatch.persona.nameCn} 人格图`}
                    width={640}
                    height={320}
                    sizes="(min-width: 640px) 320px, 100vw"
                    className="mt-3 h-48 w-full rounded-md border border-white/10 object-contain"
                  />
                </>
              ) : (
                <p className="mt-1 text-sm text-zinc-300">暂无</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/quiz" className="button-secondary">
              重新测试
            </Link>
            <Link href="/" className="button-secondary">
              回到首页
            </Link>
          </div>

          <div className="space-y-1 text-center">
            <p className="text-sm text-zinc-300">想要了解更多人格信息和彩蛋？</p>
            <a
              href={BILIBILI_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-signal underline decoration-signal/50 underline-offset-4"
            >
              哔哩哔哩：@诸葛葡萄
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function SimpleBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-semibold text-zinc-300">{title}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-zinc-200">{content}</p>
    </div>
  );
}

function RadarHexChart({
  items,
}: {
  items: Array<{ label: string; value: number }>;
}) {
  const size = 320;
  const center = size / 2;
  const radius = 112;
  const levelCount = 5;

  const toPoint = (index: number, valueScale: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / items.length;
    const x = center + Math.cos(angle) * radius * valueScale;
    const y = center + Math.sin(angle) * radius * valueScale;
    return `${x},${y}`;
  };

  const polygonPoints = items
    .map((item, index) => toPoint(index, Math.max(0, Math.min(100, item.value)) / 100))
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-[320px] w-[320px] max-w-full">
      {Array.from({ length: levelCount }, (_, level) => {
        const scale = (level + 1) / levelCount;
        const points = items.map((_, index) => toPoint(index, scale)).join(" ");
        return (
          <polygon
            key={`grid-${scale}`}
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
        );
      })}

      {items.map((_, index) => (
        <line
          key={`axis-${index}`}
          x1={center}
          y1={center}
          x2={Number(toPoint(index, 1).split(",")[0])}
          y2={Number(toPoint(index, 1).split(",")[1])}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      ))}

      <polygon points={polygonPoints} fill="rgba(99,240,121,0.22)" stroke="rgba(99,240,121,0.9)" strokeWidth="2" />

      {items.map((item, index) => {
        const [xText, yText] = toPoint(index, 1.14).split(",").map(Number);
        return (
          <text
            key={`label-${item.label}`}
            x={xText}
            y={yText}
            fill="#d9dfdc"
            fontSize="11"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {item.label}
          </text>
        );
      })}
    </svg>
  );
}
