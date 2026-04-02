import { useMemo } from "react";
import type { JournalSentimentSegment } from "@/api/journal-sentiment";

type JournalSentimentSegmentLike = JournalSentimentSegment & {
  sentence?: string | null;
};

export type JournalPaperEntry = {
  title?: string;
  content?: string;
};

export type HighlightableSentiment = "positive" | "neutral" | "negative";

export default function JournalPaper({
  journal,
  selectedSentiment,
  highlightedSegments,
}: {
  journal: JournalPaperEntry | null;
  selectedSentiment: HighlightableSentiment | null;
  highlightedSegments: JournalSentimentSegment[];
}) {
  const formattedContent = useMemo(
    () =>
      buildHighlightedJournalHtml(
        journal?.content ?? "",
        selectedSentiment,
        highlightedSegments,
      ),
    [highlightedSegments, journal?.content, selectedSentiment],
  );

  return (
    <section className="p-10">
      <header>
        <h1 className="text-[45px]">{journal?.title}</h1>
      </header>

      <main
        data-journal-content
        className="journal-highlight-content mt-6"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
      <style>{`
        .journal-highlight-content [data-sentiment-highlight] {
          border-radius: 0.35rem;
          padding: 0.08rem 0.18rem;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          transition:
            background-color 0.18s ease,
            box-shadow 0.18s ease;
        }
        .journal-highlight-content [data-sentiment-highlight="positive"] {
          background: rgba(20, 184, 166, 0.18);
          box-shadow: inset 0 0 0 1px rgba(13, 148, 136, 0.18);
        }
        .journal-highlight-content [data-sentiment-highlight="neutral"] {
          background: rgba(59, 130, 246, 0.14);
          box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.14);
        }
        .journal-highlight-content [data-sentiment-highlight="negative"] {
          background: rgba(248, 113, 113, 0.18);
          box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.18);
        }
      `}</style>
    </section>
  );
}

function buildHighlightedJournalHtml(
  content: string,
  selectedSentiment: HighlightableSentiment | null,
  highlightedSegments: JournalSentimentSegment[],
) {
  const sanitized = sanitizeJournalHtml(content);

  if (!selectedSentiment || highlightedSegments.length === 0) {
    return sanitized;
  }

  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return sanitized;
  }

  const matchingTexts = Array.from(
    new Set(
      highlightedSegments
        .filter(
          (segment) => normalizeSentiment(segment.sentiment) === selectedSentiment,
        )
        .map((segment) => normalizeWhitespace(resolveSegmentText(segment)))
        .filter(Boolean),
    ),
  );

  if (matchingTexts.length === 0) {
    return sanitized;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(sanitized, "text/html");

  for (const text of matchingTexts) {
    highlightTextInDocument(document.body, text, selectedSentiment);
  }

  return document.body.innerHTML;
}

function sanitizeJournalHtml(content: string) {
  const sanitized = content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "");

  return normalizedQuillHtml(sanitized);
}

function normalizedQuillHtml(content: string) {
  return content
    .replace(
      /<span[^>]*class=(['"])[^'"]*\bql-ui\b[^'"]*\1[^>]*>[\s\S]*?<\/span>/gi,
      "",
    )
    .replace(
      /<(p|blockquote|h[1-6]|li)>\s*(?:<br\s*\/?>|&nbsp;|\s)*<\/\1>/gi,
      "",
    )
    .replace(/<ol>([\s\S]*?)<\/ol>/gi, (fullMatch, listBody: string) => {
      const listItems = listBody.match(/<li[\s\S]*?<\/li>/gi);

      if (!listItems?.length) {
        return fullMatch;
      }

      const isBulletOnlyList = listItems.every((item) =>
        /data-list\s*=\s*['"]bullet['"]/i.test(item),
      );

      if (!isBulletOnlyList) {
        return fullMatch;
      }

      const cleanedListBody = listBody.replace(
        /\sdata-list\s*=\s*(['"])bullet\1/gi,
        "",
      );

      return `<ul>${cleanedListBody}</ul>`;
    })
    .trim();
}

function highlightTextInDocument(
  root: HTMLElement,
  targetText: string,
  sentiment: HighlightableSentiment,
) {
  const ownerDocument = root.ownerDocument ?? document;
  const walker = ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const current = walker.currentNode;

    if (!(current instanceof Text) || !current.parentElement) {
      continue;
    }

    if (current.parentElement.closest("[data-sentiment-highlight]")) {
      continue;
    }

    textNodes.push(current);
  }

  for (const textNode of textNodes) {
    const nodeValue = textNode.nodeValue ?? "";
    const normalizedNodeValue = normalizeComparableText(nodeValue);
    const normalizedTarget = normalizeComparableText(targetText);

    if (!normalizedNodeValue || !normalizedTarget) {
      continue;
    }

    const directIndex = nodeValue.indexOf(targetText);
    if (directIndex >= 0) {
      wrapTextRange(textNode, directIndex, targetText.length, sentiment);
      return;
    }

    const normalizedRange = findNormalizedSubstringRange(nodeValue, targetText);
    if (normalizedRange) {
      wrapTextRange(
        textNode,
        normalizedRange.start,
        normalizedRange.length,
        sentiment,
      );
      return;
    }

    if (normalizedNodeValue === normalizedTarget) {
      wrapTextRange(textNode, 0, nodeValue.length, sentiment);
      return;
    }
  }
}

function wrapTextRange(
  textNode: Text,
  start: number,
  length: number,
  sentiment: HighlightableSentiment,
) {
  const ownerDocument = textNode.ownerDocument ?? document;
  const range = ownerDocument.createRange();
  range.setStart(textNode, start);
  range.setEnd(textNode, start + length);

  const marker = ownerDocument.createElement("mark");
  marker.setAttribute("data-sentiment-highlight", sentiment);
  marker.className = "not-italic";

  range.surroundContents(marker);
}

function normalizeSentiment(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("positive")) return "positive";
  if (normalized.includes("neutral")) return "neutral";
  return "negative";
}

function normalizeWhitespace(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function normalizeComparableText(value: string | null | undefined) {
  return normalizeWhitespace(value)
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .toLowerCase();
}

function findNormalizedSubstringRange(source: string, target: string) {
  const normalizedSource = buildNormalizedIndexMap(source);
  const normalizedTarget = normalizeComparableText(target);

  if (!normalizedSource.normalized || !normalizedTarget) {
    return null;
  }

  const matchIndex = normalizedSource.normalized.indexOf(normalizedTarget);
  if (matchIndex < 0) {
    return null;
  }

  const sourceStart = normalizedSource.sourceIndexes[matchIndex];
  const sourceEnd =
    normalizedSource.sourceIndexes[matchIndex + normalizedTarget.length - 1];

  if (sourceStart == null || sourceEnd == null || sourceEnd < sourceStart) {
    return null;
  }

  return {
    start: sourceStart,
    length: sourceEnd - sourceStart + 1,
  };
}

function buildNormalizedIndexMap(value: string) {
  let normalized = "";
  const sourceIndexes: number[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const currentCharacter = value[index];
    const isWhitespace = /\s/.test(currentCharacter);

    if (isWhitespace) {
      if (!normalized || normalized.endsWith(" ")) {
        continue;
      }

      normalized += " ";
      sourceIndexes.push(index);
      continue;
    }

    normalized += normalizeComparableCharacter(currentCharacter);
    sourceIndexes.push(index);
  }

  if (normalized.endsWith(" ")) {
    normalized = normalized.slice(0, -1);
    sourceIndexes.pop();
  }

  return {
    normalized,
    sourceIndexes,
  };
}

function normalizeComparableCharacter(value: string) {
  if (value === "’" || value === "‘") return "'";
  if (value === "“" || value === "”") return '"';
  if (value === "–" || value === "—") return "-";

  return value.toLowerCase();
}

function resolveSegmentText(segment: JournalSentimentSegmentLike) {
  return segment.text ?? segment.sentence ?? "";
}
