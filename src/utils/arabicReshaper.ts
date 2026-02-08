import ArabicReshaper from 'arabic-reshaper';

/**
 * Check if a character is Arabic (Unicode ranges for Arabic block).
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
 * Check if a token contains any Arabic characters.
 */
function containsArabic(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (isArabicChar(text[i])) return true;
  }
  return false;
}

/**
 * Reshape Arabic text for jsPDF rendering.
 *
 * jsPDF has a problem with Arabic: no text shaping — letters appear in
 * isolated form instead of connected. This function fixes it by converting
 * Arabic characters to their Presentation Forms (pre-shaped glyphs).
 *
 * RTL direction is handled by jsPDF's built-in BiDi engine via the
 * `isInputRtl` option on doc.text() — we do NOT reverse text manually.
 *
 * Non-Arabic tokens (numbers, Latin text) are kept as-is.
 */
export function reshapeArabic(text: string): string {
  if (!text || !containsArabic(text)) return text;

  // Reshape the entire string to convert to presentation forms
  return ArabicReshaper.convertArabic(text);
}

/**
 * Reshape a mixed Arabic/non-Arabic string that contains labels and values.
 * Example: "رقم السجل التجاري: 12ب0807686-09/00"
 *
 * This creates a properly ordered string with the Arabic label and value,
 * relying on jsPDF's BiDi engine (isInputRtl) for correct RTL display.
 */
export function reshapeArabicLabel(label: string, value: string): string {
  return `${reshapeArabic(label)}: ${value}`;
}
