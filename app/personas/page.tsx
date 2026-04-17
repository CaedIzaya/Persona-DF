import Link from "next/link";
import { PersonaImage } from "@/components/common/PersonaImage";
import { loadPersonaAnalysisMap } from "@/lib/quiz/analysisParser";
import { easterEggs } from "@/lib/quiz/easterEggs";
import { getPersonaImagePosition, getPersonaImageUrl } from "@/lib/quiz/personaVisuals";
import { personas } from "@/lib/quiz/personas";

export default function PersonasPage() {
  const analysisMap = loadPersonaAnalysisMap();

  const baseCards = personas.map((persona) => ({
    id: persona.id,
    nameCn: persona.nameCn,
    nameEn: persona.shortCode,
    imageUrl: getPersonaImageUrl(persona.nameCn),
    imagePosition: getPersonaImagePosition(persona.nameCn),
    oneLiner: analysisMap[persona.id]?.oneLiner || persona.summary,
  }));

  const easterCards = easterEggs.map((egg) => ({
    id: egg.id,
    nameCn: egg.nameCn,
    nameEn: egg.nameEn,
    imageUrl: egg.imageUrl,
    imagePosition: getPersonaImagePosition(egg.nameCn),
    oneLiner: egg.revealLine || egg.summary,
  }));

  const cards = [...baseCards, ...easterCards];

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-canvas py-8 sm:py-10">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">所有人格预览</h1>
          <Link href="/" className="button-secondary">
            返回首页
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.id}
              className="overflow-hidden rounded-md border border-white/12 bg-black/28 transition duration-200 hover:-translate-y-1 hover:border-signal/70 hover:bg-black/35"
            >
              <div className="h-52 w-full overflow-hidden bg-black/45">
                <PersonaImage
                  src={card.imageUrl}
                  alt={`${card.nameCn} 人格图`}
                  width={640}
                  height={416}
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-contain"
                  style={{ objectPosition: card.imagePosition }}
                />
              </div>
              <div className="space-y-2 p-4">
                <h2 className="text-2xl font-semibold text-white">{card.nameCn}</h2>
                <p className="text-lg font-semibold text-signal">{card.nameEn}</p>
                <p className="text-sm leading-7 text-zinc-200">{card.oneLiner}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
