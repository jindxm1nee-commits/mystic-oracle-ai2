import React from 'react';

interface MarkdownOracleRendererProps {
  content: string;
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-amber-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-purple-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="font-mono-tabular text-xs px-1.5 py-0.5 rounded bg-purple-950/80 text-amber-300 border border-amber-400/20"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const MarkdownOracleRenderer: React.FC<MarkdownOracleRendererProps> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      elements.push(
        <hr key={`hr-${i}`} className="my-7 border-t border-amber-200/15" />
      );
      i++;
      continue;
    }

    // Markdown Table block
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((cell) => cell.trim());

        const headers = parseRow(tableLines[0]);
        const isSeparator = (rowStr: string) => /^[\s|:-]+$/.test(rowStr);
        const bodyRows = tableLines
          .slice(1)
          .filter((r) => !isSeparator(r))
          .map(parseRow);

        elements.push(
          <div
            key={`table-${i}`}
            className="my-6 overflow-x-auto rounded-xl border border-amber-300/25 bg-[#0A0614]/95 shadow-[0_0_25px_rgba(88,28,135,0.2)]"
          >
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-amber-300/25 bg-gradient-to-r from-purple-950/80 via-[#1E1038] to-purple-950/80 text-amber-200">
                  {headers.map((header, hIdx) => (
                    <th
                      key={hIdx}
                      className="py-3.5 px-4 font-semibold tracking-wide whitespace-nowrap"
                    >
                      {renderInlineFormatting(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-300/10 font-mono-tabular">
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-purple-900/25 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3.5 px-4 leading-relaxed font-sans ${
                          cIdx === 0
                            ? 'font-semibold text-amber-100 whitespace-nowrap'
                            : 'text-[#EAE4DC]'
                        }`}
                      >
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-7 pl-5 pr-5 py-4 border-l-2 border-amber-300 bg-gradient-to-r from-amber-500/15 via-purple-900/20 to-transparent rounded-r-xl text-base md:text-lg italic text-amber-100 leading-relaxed shadow-[0_0_25px_rgba(245,208,118,0.1)]"
        >
          {quoteLines.map((qLine, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? 'mt-2' : ''}>
              {renderInlineFormatting(qLine)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Sub-headings (###)
    if (line.startsWith('### ')) {
      const titleText = line.slice(4);
      elements.push(
        <h4
          key={`h3-${i}`}
          className="mt-6 mb-2.5 text-base sm:text-lg font-semibold text-amber-200/95 tracking-wide flex items-center gap-2"
        >
          <span>{renderInlineFormatting(titleText)}</span>
        </h4>
      );
      i++;
      continue;
    }

    // Major Section Headings (##)
    if (line.startsWith('## ')) {
      const titleText = line.slice(3);
      const isWarningSection = titleText.includes('⚠️') || titleText.includes('ระวัง');
      elements.push(
        <div
          key={`h2-${i}`}
          className={`mt-9 mb-4 pb-3 border-b flex items-center justify-between ${
            isWarningSection
              ? 'border-rose-400/35'
              : 'border-amber-300/25'
          }`}
        >
          <h3
            className={`text-xl md:text-2xl font-mystic font-semibold tracking-wide ${
              isWarningSection
                ? 'text-rose-200 drop-shadow-[0_0_12px_rgba(251,113,133,0.3)]'
                : 'text-amber-200 drop-shadow-[0_0_12px_rgba(245,208,118,0.25)]'
            }`}
          >
            {renderInlineFormatting(titleText)}
          </h3>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h2
          key={`h1-${i}`}
          className="mt-8 mb-4 text-2xl md:text-3xl font-mystic font-semibold text-amber-100"
        >
          {renderInlineFormatting(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // Unordered list block
    if (/^[-*•]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-3.5 space-y-2.5 pl-1">
          {listItems.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-[#EAE4DC] leading-relaxed text-[15px] md:text-base"
            >
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-300 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
              />
              <span className="flex-1">{renderInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list block
    if (/^\d+\.\s+/.test(line)) {
      const orderedItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        orderedItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-3.5 space-y-2.5 pl-1">
          {orderedItems.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-[#EAE4DC] leading-relaxed text-[15px] md:text-base"
            >
              <span className="font-mono-tabular text-xs font-semibold text-amber-300 mt-1 shrink-0">
                0{idx + 1}.
              </span>
              <span className="flex-1">{renderInlineFormatting(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className="my-3 text-[#EAE4DC] leading-relaxed text-[15px] md:text-base max-w-[72ch]"
      >
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
};
