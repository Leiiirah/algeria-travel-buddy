import jsPDF from 'jspdf';

// Cache for loaded font data
let tajawalRegularCache: string | null = null;
let tajawalBoldCache: string | null = null;

/**
 * Fetch a font from Google Fonts CDN and convert to base64.
 * Results are cached in memory to avoid repeated downloads.
 */
async function fetchFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Strip the data URL prefix to get raw base64
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Google Fonts static CDN URLs for Tajawal
const TAJAWAL_REGULAR_URL =
  'https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzGBCw.ttf';
const TAJAWAL_BOLD_URL =
  'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l_6gHrRpiYlJ.ttf';

/**
 * Register the Tajawal font (Regular + Bold) with a jsPDF document instance.
 * Fonts are fetched from Google Fonts CDN on first call and cached afterwards.
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
