import ArabicReshaper from 'arabic-reshaper';

/**
 * Check if a character is Arabic (Unicode ranges for Arabic block + Presentation Forms).
 */
function isArabicChar(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x0600 && code <= 0x06FF) || // Arabic
    (code >= 0x0750 && code <= 0x077F) || // Arabic Supplement
    (code >= 0x08A0 && code <= 0x08FF) || // Arabic Extended-A
    (code >= 0xFB50 && code <= 0xFDFF) || // Arabic Presentation Forms-A
    (code >= 0xFE70 && code <= 0xFEFF)    // Arabic Presentation Forms-B
  );
}

/**
 * Check if a character is a digit (0-9) or Latin letter (a-z, A-Z).
 */
function isDigitOrLatin(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x30 && code <= 0x39) || // 0-9
    (code >= 0x41 && code <= 0x5A) || // A-Z
    (code >= 0x61 && code <= 0x7A)    // a-z
  );
}

/**
 * Check if a token contains any Arabic characters.
 */
function containsArabic(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (isArabicChar(text[i])) return true;
  }
  return false;
}

/**
 * Directional run — a contiguous segment of text sharing the same direction.
 */
interface DirectionalRun {
  text: string;
  isRTL: boolean;
}

/**
 * Split text into directional runs at the character level.
 *
 * Strong characters (Arabic = RTL, digits/Latin = LTR) define the direction.
 * Neutral characters (spaces, punctuation like ، : . - /) inherit the direction
 * of the preceding strong character. If no preceding strong character exists,
 * they inherit from the next strong character, defaulting to RTL for Arabic-
 * dominant text.
 */
function splitIntoRuns(text: string): DirectionalRun[] {
  if (!text) return [];

  // First pass: classify each character
  const chars: { ch: string; dir: 'rtl' | 'ltr' | 'neutral' }[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isArabicChar(ch)) {
      chars.push({ ch, dir: 'rtl' });
    } else if (isDigitOrLatin(ch)) {
      chars.push({ ch, dir: 'ltr' });
    } else {
      chars.push({ ch, dir: 'neutral' });
    }
  }

  // Second pass: resolve neutrals by inheriting from preceding strong character
  let lastStrongDir: 'rtl' | 'ltr' = 'rtl'; // default RTL for Arabic-dominant text

  // Pre-scan: find the first strong direction
  for (const c of chars) {
    if (c.dir !== 'neutral') {
      lastStrongDir = c.dir;
      break;
    }
  }

  // Resolve neutrals forward
  let currentDir: 'rtl' | 'ltr' = lastStrongDir;
  for (const c of chars) {
    if (c.dir === 'neutral') {
      c.dir = currentDir;
    } else {
      currentDir = c.dir;
    }
  }

  // Third pass: group into contiguous runs
  const runs: DirectionalRun[] = [];
  let currentRun: DirectionalRun | null = null;

  for (const c of chars) {
    if (!currentRun || currentRun.isRTL !== (c.dir === 'rtl')) {
      if (currentRun) runs.push(currentRun);
      currentRun = { text: c.ch, isRTL: c.dir === 'rtl' };
    } else {
      currentRun.text += c.ch;
    }
  }
  if (currentRun) runs.push(currentRun);

  return runs;
}

/**
 * Reshape Arabic text for jsPDF rendering.
 *
 * jsPDF has two problems with Arabic:
 * 1. No text shaping — letters appear in isolated form instead of connected
 * 2. No RTL support — text is rendered left-to-right
 *
 * This function fixes both using a run-based Bidi approach:
 * 1. Converts Arabic characters to Presentation Forms (pre-shaped glyphs)
 * 2. Segments text into directional runs (Arabic vs digits/Latin)
 * 3. Reverses character order only within Arabic (RTL) runs
 * 4. Reverses the overall run order for visual RTL in LTR context
 *
 * Numbers and Latin text remain intact and readable.
 */
export function reshapeArabic(text: string): string {
  if (!text || !containsArabic(text)) return text;

  // Step 1: Reshape the entire string to convert to presentation forms
  const reshaped = ArabicReshaper.convertArabic(text);

  // Step 2: Split into directional runs
  const runs = splitIntoRuns(reshaped);

  // Step 3: Reverse characters within RTL runs only
  const processedRuns = runs.map((run) => {
    if (run.isRTL) {
      return { ...run, text: run.text.split('').reverse().join('') };
    }
    return run;
  });

  // Step 4: Reverse the order of all runs (overall RTL base direction)
  processedRuns.reverse();

  return processedRuns.map((r) => r.text).join('');
}

/**
 * Reshape a mixed Arabic/non-Arabic string that contains labels and values.
 * Example: "رقم السجل التجاري: 12ب0807686-09/00"
 *
 * This creates a visual RTL layout: "value :reshapedLabel"
 * so in jsPDF's LTR rendering it reads correctly right-to-left.
 */
export function reshapeArabicLabel(label: string, value: string): string {
  return `${value} :${reshapeArabic(label)}`;
}
