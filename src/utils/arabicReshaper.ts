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
 * jsPDF has two problems with Arabic:
 * 1. No text shaping — letters appear in isolated form instead of connected
 * 2. No RTL support — text is rendered left-to-right
 *
 * This function fixes both by:
 * 1. Converting Arabic characters to their Presentation Forms (pre-shaped glyphs)
 * 2. Reversing character order within Arabic words for visual RTL in LTR context
 * 3. Reversing the overall word order so the sentence reads right-to-left
 *
 * Non-Arabic tokens (numbers, Latin text) are kept as-is.
 */
export function reshapeArabic(text: string): string {
  if (!text || !containsArabic(text)) return text;

  // Step 1: Reshape the entire string to convert to presentation forms
  const reshaped = ArabicReshaper.convertArabic(text);

  // Step 2: Split into tokens (words) by spaces
  const tokens = reshaped.split(' ');

  // Step 3: Reverse character order within each Arabic token (for RTL in LTR context)
  const processedTokens = tokens.map((token) => {
    if (containsArabic(token)) {
      // Reverse character order for RTL display
      return token.split('').reverse().join('');
    }
    return token;
  });

  // Step 4: Reverse the word order so the full sentence reads RTL
  processedTokens.reverse();

  return processedTokens.join(' ');
}

/**
 * Reshape a mixed Arabic/non-Arabic string that contains labels and values.
 * Example: "رقم السجل التجاري: 12ب0807686-09/00"
 *
 * This splits at ": " to keep the value portion (numbers, codes) intact
 * while reshaping only the Arabic label part.
 */
export function reshapeArabicLabel(label: string, value: string): string {
  return `${value} :${reshapeArabic(label)}`;
}
