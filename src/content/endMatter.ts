import contentSource from "../../docs/content.md?raw";

export interface ReferenceItem {
  number: string;
  title: string;
  url?: string;
}

export interface AboutContent {
  author: string;
  origin: string;
  dataSource: string;
  copyright: string;
}

export interface EndMatterContent {
  title: string;
  references: ReferenceItem[];
  storySources: string[];
  aboutTitle: string;
  about: AboutContent;
}

function linesBetween(lines: string[], start: number, end: number) {
  return lines.slice(start + 1, end).map((line) => line.trim());
}

export function parseEndMatter(source: string): EndMatterContent {
  const lines = source.replace(/\r/g, "").split("\n");
  const referencesHeading = lines.findIndex((line) => /^##\s+参考文献(?:\s*[+与]\s*)故事素材来源\s*$/.test(line.trim()));
  const aboutHeading = lines.findIndex((line, index) => index > referencesHeading && /^##\s+关于\s*$/.test(line.trim()));

  if (referencesHeading < 0 || aboutHeading < 0) {
    throw new Error("content.md 缺少参考文献或关于区块");
  }

  const referenceLines = linesBetween(lines, referencesHeading, aboutHeading);
  const storyLabel = referenceLines.findIndex((line) => line === "故事素材");
  const referenceLabel = referenceLines.findIndex((line) => line === "参考文献");
  const storySources = referenceLines
    .slice(storyLabel + 1, referenceLabel)
    .filter(Boolean);

  const references: ReferenceItem[] = [];
  for (const line of referenceLines.slice(referenceLabel + 1).filter(Boolean)) {
    const entry = line.match(/^【(\d+)】\s*(.+)$/);
    if (entry) {
      references.push({ number: entry[1], title: entry[2].trim() });
      continue;
    }
    if (/^https?:\/\//.test(line) && references.length > 0) {
      references[references.length - 1].url = line;
    }
  }

  const aboutFields = Object.fromEntries(
    lines.slice(aboutHeading + 1)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => {
        const field = line.match(/^-\s*([^：:]+)[：:]\s*(.*)$/);
        return field ? [field[1].trim(), field[2].trim()] : ["", ""];
      })
      .filter(([label]) => Boolean(label)),
  );

  return {
    title: lines[referencesHeading].replace(/^##\s+/, "").trim(),
    references,
    storySources,
    aboutTitle: lines[aboutHeading].replace(/^##\s+/, "").trim(),
    about: {
      author: aboutFields["作者"] ?? "",
      origin: aboutFields["报道缘起"] ?? "",
      dataSource: aboutFields["数据来源说明"] ?? "",
      copyright: aboutFields["版权说明"] ?? "",
    },
  };
}

export const endMatter = parseEndMatter(contentSource);
