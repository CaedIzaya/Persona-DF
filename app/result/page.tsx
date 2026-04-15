import { Suspense } from "react";
import { ResultExperience } from "@/components/result/ResultExperience";
import { loadPersonaAnalysisMap } from "@/lib/quiz/analysisParser";

export default function ResultPage() {
  const analysisMap = loadPersonaAnalysisMap();

  return (
    <Suspense fallback={<main className="page-shell py-20 text-zinc-400">结果加载中...</main>}>
      <ResultExperience analysisMap={analysisMap} />
    </Suspense>
  );
}
