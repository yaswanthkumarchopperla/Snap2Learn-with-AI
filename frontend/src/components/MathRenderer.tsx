import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content?: string | null;
  className?: string;
  block?: boolean;
}

// ----------------------------------------------------------------------
// Helpers for LaTeX Preprocessing and Delimiter Normalization
// ----------------------------------------------------------------------

/**
 * Extracts balanced braces starting at openIdx in str.
 * Handles nested braces like \boxed{V_{\text{avg}}}.
 */
function extractBalancedBraces(str: string, openIdx: number): { full: string; end: number } | null {
  if (str[openIdx] !== '{') return null;
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === '{' && (i === 0 || str[i - 1] !== '\\')) depth++;
    else if (str[i] === '}' && (i === 0 || str[i - 1] !== '\\')) {
      depth--;
      if (depth === 0) return { full: str.slice(openIdx, i + 1), end: i };
    }
  }
  return null;
}

/**
 * Wraps any bare \boxed{...} expressions with matching braces in $...$
 */
function wrapBoxedExpressions(str: string): string {
  let res = '';
  let i = 0;
  while (i < str.length) {
    const idx = str.indexOf('\\boxed{', i);
    if (idx === -1) {
      res += str.slice(i);
      break;
    }
    // Check if preceded by $
    if (idx > 0 && str[idx - 1] === '$') {
      res += str.slice(i, idx + 7);
      i = idx + 7;
      continue;
    }
    res += str.slice(i, idx);
    const braceMatch = extractBalancedBraces(str, idx + 6);
    if (braceMatch) {
      res += `$${str.slice(idx, braceMatch.end + 1)}$`;
      i = braceMatch.end + 1;
    } else {
      res += str.slice(idx, idx + 7);
      i = idx + 7;
    }
  }
  return res;
}

/**
 * Normalizes escaped newlines, LaTeX brackets, and redundant delimiters.
 */
function preprocessMathText(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  // 1. Unescape literal escaped newlines (\\n or \n) that are NOT LaTeX commands
  // Known LaTeX commands starting with \n:
  // \nabla, \neq, \ne, \neg, \notin, \nu, \natural, \nobreak, \newline, \newcommand, \not, \ni, \null
  let text = raw.replace(/\\\\n/g, '\n');
  text = text.replace(/\\n(?!(?:abla|eq|e|eg|otin|u|atural|obreak|ewline|ewcommand|ot|i|ull)\b)/g, '\n');

  // 2. Normalize LaTeX display \[ ... \] to $$ ... $$ and inline \( ... \) to $ ... $
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => `\n\n$$${math.trim()}$$\n\n`);
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => `$${math.trim()}$`);

  // 3. Fix double/nested delimiters: $$$$...$$$$ -> $$...$$
  text = text.replace(/\${3,}([\s\S]+?)\${3,}/g, (_, math) => `$$${math.trim()}$$`);

  return text;
}

/**
 * Intelligently detects and wraps bare LaTeX formulas (not enclosed in $...$ or $$...$$)
 */
function wrapBareFormulas(text: string): string {
  const mathIndicators = /\b(?:\\omega|\\pi|\\alpha|\\beta|\\theta|\\lambda|\\mu|\\sigma|\\Delta|\\Omega|\\sin|\\cos|\\tan|\\sqrt|\\frac|\\boxed|\\text|\\approx|\\times|\\cdot|\\int|\\sum|\\infty|\\leq|\\geq|\\pm|\\partial)\b|_\{\s*[a-zA-Z0-9\\]+\s*\}|_([a-zA-Z0-9])/;

  // Split by existing $$...$$ and $...$
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let result = '';

  while ((match = mathRegex.exec(text)) !== null) {
    const nonMath = text.slice(lastIndex, match.index);
    result += processNonMathSegment(nonMath, mathIndicators);
    result += match[0]; // Preserve existing math block
    lastIndex = match.index + match[0].length;
  }

  const trailing = text.slice(lastIndex);
  result += processNonMathSegment(trailing, mathIndicators);

  return result;
}

function processNonMathSegment(segment: string, mathIndicators: RegExp): string {
  if (!segment) return '';

  // First wrap any bare \boxed{...}
  let current = wrapBoxedExpressions(segment);

  // Process line by line
  const lines = current.split('\n');
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Check if the entire line is a formula (e.g. V = 100 \sin(314t) or \omega = 314 rad/s)
    const isStandaloneFormula =
      trimmed.startsWith('$$') ||
      trimmed.startsWith('$') ||
      trimmed.startsWith('\\frac') ||
      trimmed.startsWith('\\begin') ||
      ((trimmed.includes('=') || trimmed.includes('\\approx')) &&
        mathIndicators.test(trimmed) &&
        !trimmed.includes('http'));

    // If standalone formula on its own line without dollar signs and not long prose text
    if (isStandaloneFormula && !trimmed.startsWith('$') && !/[a-zA-Z]{12,}/.test(trimmed)) {
      return line.replace(trimmed, `$$${trimmed}$$`);
    }

    let processedLine = line;

    // Match equations like:
    // \omega = 314 rad/s
    // \pi = 3.14
    // V = 100 \sin(314t)
    // f = \frac{\omega}{2\pi} = 50 Hz
    // V_{\text{rms}} = 70.7 V
    const eqPattern = /(?<![\$\w])((?:\\[a-zA-Z]+|[A-Za-z](?:_[A-Za-z0-9]+|_{[^{}]+})?))\s*(=|\\approx|\\le|\\ge|\\ne)\s*([^,;\n]+?)(?=(?:(?:\.\s+)|\.$|[,;\n]|$|(?:\s+(?:and|or|where|with|is|in|then|when|if|మరియు|యొక్క)\b)))/gi;

    processedLine = processedLine.replace(eqPattern, (full, left, op, right) => {
      const cleanRight = right.trim();
      if (!cleanRight) return full;
      // Only wrap if it contains numbers, math symbols, or LaTeX commands, and not a standard English sentence
      if (mathIndicators.test(left) || mathIndicators.test(cleanRight) || /[0-9]/.test(cleanRight)) {
        if (!/[a-zA-Z]{12,}/.test(cleanRight)) {
          // If right side ends with unit like rad/s, Hz, V, s, wrap unit in \text{} if not already
          const formattedRight = cleanRight.replace(
            /\b(rad\/s|rad|Hz|kHz|MHz|GHz|V|mV|kV|A|mA|s|ms|ns|W|kW|MW|deg)\b(?![}])/g,
            (unit: string) => `\\text{ ${unit}}`
          );
          return `$${left.trim()} ${op} ${formattedRight}$`;
        }
      }
      return full;
    });

    // Wrap bare Greek letters or isolated LaTeX symbols: \omega, \pi, \alpha, \beta, \theta, \lambda, \Delta, \Omega, etc.
    const greekPattern = /(?<![\$\\a-zA-Z])(\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|approx|times|cdot|pm|partial|nabla|infty))\b(?!\$)/g;
    processedLine = processedLine.replace(greekPattern, (_, symbol) => `$${symbol}$`);

    return processedLine;
  });

  return processedLines.join('\n');
}

// ----------------------------------------------------------------------
// Tokenizer & Safe KaTeX Invocation
// ----------------------------------------------------------------------

interface Token {
  type: 'block-math' | 'inline-math' | 'text';
  content: string;
}

function tokenize(content: string): Token[] {
  const preprocessed = wrapBareFormulas(preprocessMathText(content));
  const tokens: Token[] = [];

  const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(preprocessed)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: preprocessed.slice(lastIndex, match.index),
      });
    }

    const raw = match[0];
    if (raw.startsWith('$$')) {
      tokens.push({
        type: 'block-math',
        content: raw.slice(2, -2).trim(),
      });
    } else {
      tokens.push({
        type: 'inline-math',
        content: raw.slice(1, -1).trim(),
      });
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < preprocessed.length) {
    tokens.push({
      type: 'text',
      content: preprocessed.slice(lastIndex),
    });
  }

  return tokens;
}

function renderKaTeX(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch (err) {
    console.warn('KaTeX render error:', err);
    return `<span class="katex-error font-mono text-amber-400">${latex}</span>`;
  }
}

/**
 * Formats prose text: converts basic markdown (bold, code, line breaks)
 * while preserving Telugu and other Unicode text.
 */
function renderProseText(text: string): React.ReactNode[] {
  // Split by newlines to respect lines and paragraphs
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      nodes.push(<br key={`br-${lineIdx}`} />);
    }

    if (!line) return;

    // Process bold (**bold**) and inline code (`code`)
    const parts = line.split(/(\*\*[^*]+?\*\*|`[^`]+?`)/g);
    parts.forEach((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        nodes.push(
          <strong key={`b-${lineIdx}-${pIdx}`} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        nodes.push(
          <code
            key={`c-${lineIdx}-${pIdx}`}
            className="px-1.5 py-0.5 rounded bg-surface-elevated text-[11px] font-mono text-secondary border border-border/50"
          >
            {part.slice(1, -1)}
          </code>
        );
      } else if (part) {
        nodes.push(<span key={`t-${lineIdx}-${pIdx}`}>{part}</span>);
      }
    });
  });

  return nodes;
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  block = false,
}) => {
  // Tokenize and render
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // If caller explicitly requested block mode and content is a single formula
    let raw = content.trim();
    if (block && !raw.startsWith('$$') && !raw.startsWith('$')) {
      raw = `$$${raw}$$`;
    }

    const tokens = tokenize(raw);

    return tokens.map((token, index) => {
      if (token.type === 'block-math') {
        const html = renderKaTeX(token.content, true);
        return (
          <div
            key={`block-${index}`}
            className="katex-block-wrapper my-2.5 max-w-full overflow-x-auto scrollbar-thin"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      if (token.type === 'inline-math') {
        const html = renderKaTeX(token.content, false);
        return (
          <span
            key={`inline-${index}`}
            className="katex-inline-wrapper"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      return (
        <span key={`text-${index}`} className="prose-text">
          {renderProseText(token.content)}
        </span>
      );
    });
  }, [content, block]);

  if (!content) return null;

  return (
    <div className={`math-renderer-root leading-relaxed break-words ${className}`}>
      {renderedElements}
    </div>
  );
};
