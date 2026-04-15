import Image from "next/image";
import Link from "next/link";

const logoImage = "/images/logo.webp";
const BILIBILI_URL = "https://space.bilibili.com/202993136?spm_id_from=333.33.0.0";

export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-canvas">
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl -translate-y-8 flex-col items-center justify-center px-6 text-center sm:-translate-y-12">
        <Image
          src={logoImage}
          alt="三角洲人格测试 Logo"
          width={128}
          height={128}
          priority
          sizes="(min-width: 640px) 8rem, 7rem"
          className="mb-6 h-28 w-28 object-contain sm:mb-8 sm:h-32 sm:w-32"
        />

        <h1 className="max-w-5xl text-5xl font-semibold leading-tight text-white sm:text-7xl">
          测测你在三角洲里，
          <span className="block text-signal">到底是哪种玩家</span>
        </h1>

        <p className="mt-6 text-base text-zinc-200 sm:text-lg">
          4w字文案，22个总人格，PDF，三角洲人自己的SBTI。
        </p>

        <Link href="/quiz" className="button-primary mt-10 px-12 py-4 text-lg">
          开始测试
        </Link>

        <Link href="/personas" className="button-secondary mt-4 px-8 py-3 text-base">
          所有人格预览
        </Link>

        <a
          href={BILIBILI_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-5 text-sm text-signal underline decoration-signal/50 underline-offset-4"
        >
          哔哩哔哩：@诸葛葡萄
        </a>

        <p className="mt-6 max-w-2xl text-xs leading-6 text-zinc-400 sm:text-sm">
          免责声明：本测试结果仅用于娱乐与社交分享，不构成任何心理、职业或医学等专业结论。
        </p>
      </div>
    </main>
  );
}
