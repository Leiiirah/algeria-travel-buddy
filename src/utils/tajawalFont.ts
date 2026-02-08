import jsPDF from 'jspdf';

// Cache for loaded font data
let tajawalRegularCache: string | null = null;
let tajawalBoldCache: string | null = null;

/**
 * Fetch a font file and convert to base64 string.
 * Uses ArrayBuffer for reliable binary-to-base64 conversion.
 */
async function fetchFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Font fetch failed: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Full TTF files from Google Fonts GitHub (unsubsetted, with proper cmap tables)
const TAJAWAL_REGULAR_URL =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Regular.ttf';
const TAJAWAL_BOLD_URL =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Bold.ttf';

/**
 * Register the Tajawal font (Regular + Bold) with a jsPDF document instance.
 * Fonts are fetched from GitHub on first call and cached afterwards.
 *
 * If the font loading fails, the function logs a warning and returns false,
 * allowing the caller to fall back to Helvetica.
 */
export async function registerTajawalFont(doc: jsPDF): Promise<boolean> {
  try {
    // Load Regular weight
    if (!tajawalRegularCache) {
      tajawalRegularCache = await fetchFontAsBase64(TAJAWAL_REGULAR_URL);
    }
    doc.addFileToVFS('Tajawal-Regular.ttf', tajawalRegularCache);
    doc.addFont('Tajawal-Regular.ttf', 'Tajawal', 'normal');

    // Load Bold weight
    if (!tajawalBoldCache) {
      tajawalBoldCache = await fetchFontAsBase64(TAJAWAL_BOLD_URL);
    }
    doc.addFileToVFS('Tajawal-Bold.ttf', tajawalBoldCache);
    doc.addFont('Tajawal-Bold.ttf', 'Tajawal', 'bold');

    return true;
  } catch (error) {
    console.warn('Could not load Tajawal font, falling back to Helvetica:', error);
    return false;
  }
}
