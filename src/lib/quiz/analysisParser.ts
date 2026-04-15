import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { PersonaAnalysisContent, PersonaId } from "./types";

const ANALYSIS_MD_PATH =
  process.env.ANALYSIS_MD_PATH ?? path.join(process.cwd(), "content", "analysis.md");

const headingRegex = /^\s*(\d+)\.\s*(.+)\s*$/;
const oneLinerSectionTitles = ["一句简介", "一句话简介"] as const;
const sectionTitles = [
  ...oneLinerSectionTitles,
  "游戏行为",
  "优点价值",
  "真实心理",
  "需要注意的点",
] as const;

const nameToPersonaId: Record<string, PersonaId> = {
  猛攻将: "menggonglang",
  老板: "laoban",
  鼠鼠: "shushu",
  本质高手: "benzhigaoshou",
  妈妈: "mama",
  秃鹫: "tujiu",
  收藏家: "shoucangjia",
  威龙: "weilong",
  教官: "jiaoguan",
  赛伊德: "saiyide",
  德穆兰: "demulan",
  渡鸦: "duya",
  哈德森: "hadesen",
  雷斯: "leisi",
  嘉豪: "jiahao",
  老贝榨: "laobeizha",
  堵桥来: "duqiaolai",
  唐王大人: "tangwang",
};

type SectionTitle = (typeof sectionTitles)[number];
type RawSections = Partial<Record<SectionTitle, string>>;

export function loadPersonaAnalysisMap(): Partial<Record<PersonaId, PersonaAnalysisContent>> {
  try {
    const content = fs.readFileSync(ANALYSIS_MD_PATH, "utf8");
    return parseAnalysisContent(content);
  } catch {
    return {};
  }
}

function parseAnalysisContent(markdown: string): Partial<Record<PersonaId, PersonaAnalysisContent>> {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const result: Partial<Record<PersonaId, PersonaAnalysisContent>> = {};

  let index = 0;
  while (index < lines.length) {
    const headingMatch = lines[index].trim().match(headingRegex);
    if (!headingMatch) {
      index += 1;
      continue;
    }

    const headingText = headingMatch[2]?.trim() ?? "";
    const headingName = headingText.split(/\s+/)[0] ?? "";
    const personaId = nameToPersonaId[headingName];

    index += 1;

    const sections: RawSections = {};
    let currentSection: SectionTitle | null = null;
    let preface: string[] = [];
    let buffer: string[] = [];

    const flush = () => {
      if (!currentSection) {
        buffer = [];
        return;
      }

      sections[currentSection] = normalizeBlock(buffer);
      buffer = [];
    };

    while (index < lines.length && !headingRegex.test(lines[index].trim())) {
      const line = lines[index].trim();
      const sectionTitle = sectionTitles.find((item) => item === line);

      if (sectionTitle) {
        flush();
        currentSection = sectionTitle;
      } else if (!currentSection) {
        if (line) {
          preface.push(line);
        }
      } else {
        buffer.push(line);
      }

      index += 1;
    }

    flush();

    if (!personaId) {
      continue;
    }

    result[personaId] = {
      oneLiner:
        oneLinerSectionTitles
          .map((title) => sections[title]?.trim())
          .find((value) => Boolean(value)) || normalizeBlock(preface),
      gameplay: sections["游戏行为"]?.trim() || "",
      value: sections["优点价值"]?.trim() || "",
      psychology: sections["真实心理"]?.trim() || "",
      caution: sections["需要注意的点"]?.trim() || "",
    };
  }

  return result;
}

function normalizeBlock(lines: string[]) {
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}
