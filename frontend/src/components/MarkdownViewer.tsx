import React, { useMemo, useState } from 'react';
import katex from 'katex';
import { Copy, Check, Table as TableIcon } from 'lucide-react';

interface MarkdownViewerProps {
  content?: string | null;
  className?: string;
}

// -------------------------------------------------------------
// KaTeX Safe Rendering Helper
// -------------------------------------------------------------
function renderKaTeX(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch (err) {
    return `<span class="katex-error text-amber-400 font-mono">${latex}</span>`;
  }
}

// -------------------------------------------------------------
// Inline Text & Math Parser
// -------------------------------------------------------------
function renderInlineTextAndMath(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match inline math ($...$ or \(...\))
  const mathRegex = /(\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(renderFormattedProse(text.slice(lastIdx, match.index), `txt-${lastIdx}`));
    }

    const rawMath = match[0];
    let mathContent = '';
    if (rawMath.startsWith('$')) {
      mathContent = rawMath.slice(1, -1);
    } else if (rawMath.startsWith('\\(')) {
      mathContent = rawMath.slice(2, -2);
    }

    const html = renderKaTeX(mathContent.trim(), false);
    parts.push(
      <span
        key={`math-${match.index}`}
        className="katex-inline-wrapper"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );

    lastIdx = match.index + rawMath.length;
  }

  if (lastIdx < text.length) {
    parts.push(renderFormattedProse(text.slice(lastIdx), `txt-end`));
  }

  return parts;
}

function renderFormattedProse(text: string, keyPrefix: string): React.ReactNode {
  // Support bold (**bold**), italic (*italic*), and inline code (`code`)
  const parts = text.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g);

  return (
    <span key={keyPrefix}>
      {parts.map((p, idx) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return (
            <strong key={`${keyPrefix}-b-${idx}`} className="font-semibold text-foreground">
              {p.slice(2, -2)}
            </strong>
          );
        }
        if (p.startsWith('*') && p.endsWith('*')) {
          return (
            <em key={`${keyPrefix}-i-${idx}`} className="italic text-foreground/90">
              {p.slice(1, -1)}
            </em>
          );
        }
        if (p.startsWith('`') && p.endsWith('`')) {
          return (
            <code
              key={`${keyPrefix}-c-${idx}`}
              className="px-1.5 py-0.5 rounded bg-surface-elevated text-[11px] font-mono text-secondary border border-border/60"
            >
              {p.slice(1, -1)}
            </code>
          );
        }
        return p;
      })}
    </span>
  );
}

// -------------------------------------------------------------
// Markdown Table Component
// -------------------------------------------------------------
const MarkdownTable: React.FC<{ rows: string[]; tableKey: string }> = ({ rows, tableKey }) => {
  if (rows.length < 2) return null;

  const headerCells = rows[0]
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());

  // Skip row 1 if it's separator |---|---|
  const bodyRows = rows.slice(2).filter((r) => r.trim().startsWith('|'));

  return (
    <div key={tableKey} className="my-4 overflow-x-auto rounded-xl border border-border bg-surface/60 shadow-xs">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-elevated/80 border-b border-border text-[11px] font-semibold text-foreground-muted">
        <TableIcon className="w-3.5 h-3.5 text-secondary" />
        <span>Document Table</span>
      </div>
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-surface-elevated text-foreground font-semibold border-b border-border">
          <tr>
            {headerCells.map((header, idx) => (
              <th key={`th-${idx}`} className="px-4 py-2.5 font-bold text-foreground">
                {renderInlineTextAndMath(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {bodyRows.map((rowStr, rIdx) => {
            const cells = rowStr
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim());
            return (
              <tr key={`tr-${rIdx}`} className="hover:bg-surface-hover/50 transition-colors">
                {cells.map((cell, cIdx) => (
                  <td key={`td-${rIdx}-${cIdx}`} className="px-4 py-2 text-foreground/90">
                    {renderInlineTextAndMath(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// -------------------------------------------------------------
// Code Block with Copy Button
// -------------------------------------------------------------
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-surface-elevated border-b border-border text-[11px] font-mono text-foreground-muted">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono text-foreground overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// -------------------------------------------------------------
// Main Document Parser & Renderer
// -------------------------------------------------------------
export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  const renderedNodes = useMemo(() => {
    if (!content) return null;

    // Normalizing newlines
    let text = content.replace(/\\n/g, '\n');

    // Normalize display math delimiters \[ ... \] to $$ ... $$
    text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => `\n\n$$${math.trim()}$$\n\n`);

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty line
      if (!trimmed) {
        i++;
        continue;
      }

      // 1. Code Blocks (``` ... ```)
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeLines.join('\n')}
            language={lang}
          />
        );
        i++; // skip closing ```
        continue;
      }

      // 2. Block Math ($$ ... $$)
      if (trimmed.startsWith('$$')) {
        let mathBody = trimmed.slice(2);
        if (mathBody.endsWith('$$') && mathBody.length >= 2) {
          mathBody = mathBody.slice(0, -2);
        } else {
          // Multiline display math
          const mathLines = [mathBody];
          i++;
          while (i < lines.length && !lines[i].trim().endsWith('$$')) {
            mathLines.push(lines[i]);
            i++;
          }
          if (i < lines.length) {
            mathLines.push(lines[i].trim().slice(0, -2));
          }
          mathBody = mathLines.join('\n');
        }

        const html = renderKaTeX(mathBody.trim(), true);
        elements.push(
          <div
            key={`math-block-${i}`}
            className="my-3 py-2 px-3 rounded-xl bg-surface-elevated/50 border border-border/50 overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
        i++;
        continue;
      }

      // 3. Tables (| col | col |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines = [trimmed];
        i++;
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        elements.push(<MarkdownTable key={`table-${i}`} rows={tableLines} tableKey={`tbl-${i}`} />);
        continue;
      }

      // 4. Horizontal Rules
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        elements.push(<hr key={`hr-${i}`} className="my-4 border-border" />);
        i++;
        continue;
      }

      // 5. Headings
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl font-bold text-foreground mt-5 mb-2 pb-1.5 border-b border-border">
            {renderInlineTextAndMath(trimmed.slice(2))}
          </h1>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-base font-bold text-secondary mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-secondary inline-block" />
            {renderInlineTextAndMath(trimmed.slice(3))}
          </h2>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm font-semibold text-foreground mt-3 mb-1.5">
            {renderInlineTextAndMath(trimmed.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      // 6. Bullet Lists
      if (/^[\*\-•]\s+/.test(trimmed)) {
        const listText = trimmed.replace(/^[\*\-•]\s+/, '');
        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-2.5 my-1 text-xs text-foreground/90 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
            <div className="flex-1 leading-relaxed">{renderInlineTextAndMath(listText)}</div>
          </div>
        );
        i++;
        continue;
      }

      // 7. Numbered Lists
      if (/^\d+\.\s+/.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          elements.push(
            <div key={`num-${i}`} className="flex items-start gap-2.5 my-1 text-xs text-foreground/90 pl-2">
              <span className="font-mono font-bold text-secondary text-[11px] shrink-0 mt-0.5">
                {numMatch[1]}.
              </span>
              <div className="flex-1 leading-relaxed">{renderInlineTextAndMath(numMatch[2])}</div>
            </div>
          );
          i++;
          continue;
        }
      }

      // 8. Regular Prose Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm text-foreground/90 leading-relaxed my-1.5">
          {renderInlineTextAndMath(trimmed)}
        </p>
      );
      i++;
    }

    return elements;
  }, [content]);

  if (!content) return null;

  return (
    <div className={`markdown-viewer space-y-1 ${className}`}>
      {renderedNodes}
    </div>
  );
};

