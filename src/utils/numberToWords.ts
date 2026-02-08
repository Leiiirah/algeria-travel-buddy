/**
 * Convert a number to its French written representation.
 *
 * Examples:
 *   numberToWords(0)        → "Zéro"
 *   numberToWords(21)       → "Vingt et un"
 *   numberToWords(80)       → "Quatre-vingts"
 *   numberToWords(200)      → "Deux cents"
 *   numberToWords(1000)     → "Mille"
 *   numberToWords(12973.18) → "Douze mille neuf cent soixante-treize virgule dix-huit"
 */

const UNITS = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix-sept', 'dix-huit', 'dix-neuf',
];

const TENS = [
  '', 'dix', 'vingt', 'trente', 'quarante', 'cinquante',
  'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt',
];

function convertHundreds(n: number): string {
  if (n === 0) return '';

  let result = '';

  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;

  if (hundreds > 0) {
    if (hundreds === 1) {
      result = 'cent';
    } else {
      result = UNITS[hundreds] + ' cent';
    }
    // French rule: "deux cents" (with s) only when nothing follows
    if (remainder === 0 && hundreds > 1) {
      result += 's';
    }
    if (remainder > 0) {
      result += ' ';
    }
  }

  if (remainder > 0) {
    if (remainder < 20) {
      result += UNITS[remainder];
    } else {
      const tensIndex = Math.floor(remainder / 10);
      const unit = remainder % 10;

      if (tensIndex === 7 || tensIndex === 9) {
        // 70-79 → soixante-dix..., 90-99 → quatre-vingt-dix...
        const base = TENS[tensIndex];
        const subUnit = (tensIndex === 7 ? 10 : 10) + unit;
        if (tensIndex === 7 && unit === 1) {
          result += base + ' et onze';
        } else {
          result += base + '-' + UNITS[subUnit];
        }
      } else if (tensIndex === 8) {
        // 80 → "quatre-vingts", 81-89 → "quatre-vingt-..."
        if (unit === 0) {
          result += 'quatre-vingts';
        } else {
          result += 'quatre-vingt-' + UNITS[unit];
        }
      } else {
        result += TENS[tensIndex];
        if (unit === 1) {
          result += ' et un';
        } else if (unit > 0) {
          result += '-' + UNITS[unit];
        }
      }
    }
  }

  return result;
}

function convertWholeNumber(n: number): string {
  if (n === 0) return 'zéro';
  if (n < 0) return 'moins ' + convertWholeNumber(-n);

  let result = '';

  // Millions
  const millions = Math.floor(n / 1_000_000);
  if (millions > 0) {
    if (millions === 1) {
      result += 'un million';
    } else {
      result += convertHundreds(millions) + ' millions';
    }
    n %= 1_000_000;
    if (n > 0) result += ' ';
  }

  // Thousands
  const thousands = Math.floor(n / 1_000);
  if (thousands > 0) {
    if (thousands === 1) {
      result += 'mille';
    } else {
      result += convertHundreds(thousands) + ' mille';
    }
    n %= 1_000;
    if (n > 0) result += ' ';
  }

  // Hundreds, tens, units
  if (n > 0) {
    result += convertHundreds(n);
  }

  return result;
}

export function numberToWords(value: number): string {
  const intPart = Math.floor(Math.abs(value));
  const decimalPart = Math.round((Math.abs(value) - intPart) * 100);

  let result = convertWholeNumber(value < 0 ? -intPart : intPart);

  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  if (decimalPart > 0) {
    result += ' virgule ' + convertWholeNumber(decimalPart);
  }

  return result;
}
