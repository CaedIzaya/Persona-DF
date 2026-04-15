"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/lib/quiz/questions";
import { isAnswerMapComplete, serializeAnswers } from "@/lib/quiz/scoring";
import type { PartialAnswerMap } from "@/lib/quiz/types";

const NON_SHUFFLED_QUESTION_IDS = new Set(["asset-level"]);
const OPTION_ORDER_SEED = "quiz-option-order-v1";

export function QuizExperience() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswerMap>({});

  const currentQuestion = questions[currentIndex];
  const shuffledOptionsByQuestion = useMemo(() => {
    return Object.fromEntries(
      questions.map((question) => [
        question.id,
        NON_SHUFFLED_QUESTION_IDS.has(question.id)
          ? question.options
          : shuffleListDeterministic(question.options, `${OPTION_ORDER_SEED}:${question.id}`),
      ]),
    );
  }, []);
  const currentOptions = shuffledOptionsByQuestion[currentQuestion.id] ?? currentQuestion.options;
  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === questions.length - 1;

  function handleSelect(optionId: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: optionId,
    }));
  }

  function handleBack() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function handleAdvance() {
    if (!currentAnswer) {
      return;
    }

    if (isLastQuestion) {
      if (!isAnswerMapComplete(answers)) {
        return;
      }

      router.push(`/result?answers=${encodeURIComponent(serializeAnswers(answers))}`);
      return;
    }

    setCurrentIndex((index) => Math.min(questions.length - 1, index + 1));
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-canvas">
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center px-5 py-10 sm:px-6">
        <section className="panel w-full p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <p className="eyebrow">答题进度</p>
            <p className="text-base font-semibold text-white">
              {currentIndex + 1}/{questions.length}
            </p>
          </div>

          <h1 className="mt-6 text-2xl font-semibold leading-tight text-white sm:text-4xl">{currentQuestion.prompt}</h1>

          <div className="mt-6 grid gap-3">
            {currentOptions.map((option, index) => {
              const selected = currentAnswer === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={[
                    "group rounded-md border p-4 text-left sm:p-5",
                    selected
                      ? "border-signal bg-signal/10 shadow-[0_0_0_1px_rgba(99,240,121,0.15)]"
                      : "border-white/12 bg-black/20 hover:border-signal/45 hover:bg-black/30",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm font-semibold",
                        selected
                          ? "border-signal bg-signal text-black"
                          : "border-white/20 bg-black/30 text-zinc-200 group-hover:border-signal/45",
                      ].join(" ")}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <p className="text-base font-medium leading-7 text-white sm:text-lg">{option.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="button-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              上一题
            </button>
            <button
              type="button"
              onClick={handleAdvance}
              disabled={!currentAnswer}
              className="button-primary disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/10 disabled:text-zinc-500"
            >
              {isLastQuestion ? "揭晓结果" : "下一题"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function shuffleListDeterministic<T>(source: T[], seedText: string) {
  const items = [...source];
  let seed = seedFromText(seedText);

  for (let index = items.length - 1; index > 0; index -= 1) {
    seed = nextSeed(seed);
    const randomIndex = Math.floor(seed * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }

  return items;
}

function seedFromText(text: string) {
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function nextSeed(seed: number) {
  const next = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return next / 4294967296;
}
