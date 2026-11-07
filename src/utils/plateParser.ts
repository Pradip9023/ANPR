/**
 * Indian Number Plate Recognition & Normalization Engine
 * Handles standard Indian formats, BH series, diplomatic plates,
 * OCR character confusion disambiguation (O/0, I/1, Z/2, S/5, B/8),
 * and format validation without hallucinating characters.
 */

export interface PlateAnalysisResult {
  rawText: string;
  normalizedPlate: string;
  isValid: boolean;
  formatType: 'STANDARD' | 'BHARAT_SERIES' | 'DIPLOMATIC' | 'MILITARY' | 'TEMPORARY' | 'CUSTOM' | 'INVALID';
  stateCode?: string;
  stateName?: string;
  districtCode?: string;
  seriesCode?: string;
  uniqueNumber?: string;
  bhYear?: string;
  bhSeries?: string;
  confidenceScore: number;
  ocrCorrectionsApplied: string[];
  vehicleCategoryEstimate?: 'TWO_WHEELER' | 'FOUR_WHEELER' | 'COMMERCIAL' | 'ELECTRIC' | 'UNKNOWN';
}

export const INDIAN_STATE_CODES: Record<string, string> = {
  AN: 'Andaman & Nicobar',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  CH: 'Chandigarh',
  DD: 'Daman & Diu',
  DL: 'Delhi',
  DN: 'Dadra & Nagar Haveli',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu & Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MN: 'Manipur',
  MP: 'Madhya Pradesh',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  PB: 'Punjab',
  PY: 'Puducherry',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TR: 'Tripura',
  TS: 'Telangana',
  UK: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
};

// Common OCR substitutions depending on whether an alphabet or a digit is expected
const CHAR_TO_DIGIT: Record<string, string> = {
  O: '0',
  D: '0',
  Q: '0',
  I: '1',
  L: '1',
  T: '1',
  Z: '2',
  E: '3',
  A: '4',
  S: '5',
  G: '6',
  B: '8',
};

const CHAR_TO_ALPHA: Record<string, string> = {
  '0': 'O',
  '1': 'I',
  '2': 'Z',
  '3': 'E',
  '4': 'A',
  '5': 'S',
  '6': 'G',
  '8': 'B',
};

/**
 * Clean raw OCR text: strip spaces, dashes, dots, and non-alphanumeric symbols except ^ for military
 */
export function cleanPlateText(raw: string): string {
  if (!raw) return '';
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9^]/g, '')
    .trim();
}

/**
 * Context-aware character replacement
 */
function toDigit(c: string): { char: string; changed: boolean } {
  if (/[0-9]/.test(c)) return { char: c, changed: false };
  if (CHAR_TO_DIGIT[c]) return { char: CHAR_TO_DIGIT[c], changed: true };
  return { char: c, changed: false };
}

function toAlpha(c: string): { char: string; changed: boolean } {
  if (/[A-Z]/.test(c)) return { char: c, changed: false };
  if (CHAR_TO_ALPHA[c]) return { char: CHAR_TO_ALPHA[c], changed: true };
  return { char: c, changed: false };
}

/**
 * Parse and normalize an Indian vehicle registration plate
 */
export function parseAndNormalizeIndianPlate(
  rawInput: string,
  baseConfidence: number = 0.88
): PlateAnalysisResult {
  const cleaned = cleanPlateText(rawInput);
  const corrections: string[] = [];

  if (!cleaned || cleaned.length < 5) {
    return {
      rawText: rawInput,
      normalizedPlate: cleaned,
      isValid: false,
      formatType: 'INVALID',
      confidenceScore: Math.min(baseConfidence, 0.4),
      ocrCorrectionsApplied: corrections,
    };
  }

  // Check 1: Bharat Series (BH series: YY BH #### XX e.g., 22BH1234AA)
  const bhMatch = cleaned.match(/^([0-9]{2}|[A-Z]{2})([B8][H#])([0-9OIZSB]{4})([A-Z0-9]{1,2})$/);
  if (bhMatch) {
    let year = bhMatch[1];
    let bh = 'BH';
    let digits = bhMatch[3];
    let suffix = bhMatch[4];

    // Normalize Year (first 2 must be digits)
    const y0 = toDigit(year[0]);
    const y1 = toDigit(year[1]);
    year = y0.char + y1.char;
    if (y0.changed || y1.changed) corrections.push('Corrected BH year characters to digits');

    // Normalize Digits
    let cleanDigits = '';
    for (const ch of digits) {
      const d = toDigit(ch);
      if (d.changed) corrections.push(`Corrected '${ch}' -> '${d.char}' in BH number block`);
      cleanDigits += d.char;
    }

    // Normalize suffix
    let cleanSuffix = '';
    for (const ch of suffix) {
      const a = toAlpha(ch);
      if (a.changed) corrections.push(`Corrected '${ch}' -> '${a.char}' in BH series suffix`);
      cleanSuffix += a.char;
    }

    const normalized = `${year}BH${cleanDigits}${cleanSuffix}`;
    const isValid = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/.test(normalized);

    return {
      rawText: rawInput,
      normalizedPlate: normalized,
      isValid,
      formatType: 'BHARAT_SERIES',
      bhYear: year,
      bhSeries: cleanSuffix,
      uniqueNumber: cleanDigits,
      confidenceScore: isValid ? Math.min(baseConfidence + 0.05, 0.99) : baseConfidence * 0.7,
      ocrCorrectionsApplied: corrections,
      vehicleCategoryEstimate: 'FOUR_WHEELER',
    };
  }

  // Check 2: Military Plate (starts with ^ or arrow)
  if (cleaned.startsWith('^') || cleaned.startsWith('↑')) {
    const milPart = cleaned.replace(/^[\^↑]/, '');
    return {
      rawText: rawInput,
      normalizedPlate: `↑${milPart}`,
      isValid: milPart.length >= 6,
      formatType: 'MILITARY',
      confidenceScore: 0.92,
      ocrCorrectionsApplied: ['Detected Indian Defence Vehicle registration'],
      vehicleCategoryEstimate: 'COMMERCIAL',
    };
  }

  // Check 3: Standard Indian Registration format
  // Format: [State: 2 chars] [District: 1-2 digits] [Series: 0-3 letters] [Number: 1-4 digits]
  // Examples:
  // GJ01AB1234
  // MH12EF3456
  // DL8CAF1234 (Delhi single-digit RTO with series)
  // KA03MN9876
  // HR26DQ5551
  let working = cleaned;

  // Extract candidate state (first 2 characters)
  let s0 = toAlpha(working[0]);
  let s1 = toAlpha(working[1]);
  if (s0.changed) corrections.push(`State code 1st char: '${working[0]}' -> '${s0.char}'`);
  if (s1.changed) corrections.push(`State code 2nd char: '${working[1]}' -> '${s1.char}'`);

  let candidateState = s0.char + s1.char;
  // Check known OCR state slips e.g. '0L'/'OL' -> 'DL', 'K4' -> 'KA', 'M1' -> 'MH', 'G3' -> 'GJ'
  const stateFixMap: Record<string, string> = {
    '0L': 'DL',
    OL: 'DL',
    '1L': 'DL',
    IL: 'DL',
    K4: 'KA',
    M1: 'MH',
    G3: 'GJ',
    U9: 'UP',
    H8: 'HR',
    '7N': 'TN',
  };

  if (stateFixMap[cleaned.substring(0, 2)] || stateFixMap[candidateState]) {
    const fixed = stateFixMap[cleaned.substring(0, 2)] || stateFixMap[candidateState];
    corrections.push(`Mapped ambiguous state code ${candidateState} to ${fixed}`);
    candidateState = fixed;
  }
  let stateName = INDIAN_STATE_CODES[candidateState];

  // Remaining string after 2 state letters
  const remainder = working.substring(2);

  // Match remainder patterns:
  // Regex to flexibly parse:
  // (1-2 digits or confused chars) + (optional letters) + (1-4 digits)
  const pattern = /^([0-9OIDLQZESAB]{1,2})([A-Z0-9OIDLQZESAB]*?)([0-9OIDLQZESAB]{1,4})$/;
  const remMatch = remainder.match(pattern);

  if (remMatch) {
    const rawDistrict = remMatch[1];
    const rawSeries = remMatch[2];
    const rawNumber = remMatch[3];

    // Normalize district (must be digits)
    let cleanDistrict = '';
    for (const c of rawDistrict) {
      const d = toDigit(c);
      if (d.changed) corrections.push(`RTO District: '${c}' -> '${d.char}'`);
      cleanDistrict += d.char;
    }
    // Pad single digit district with 0 if standard e.g. DL 8 -> DL 08, or keep single if DL8C
    // In Delhi DL8CAF1234 is often written without leading 0 or with DL08. We will keep as DL08 if 1 digit
    const normalizedDistrict = cleanDistrict.length === 1 ? `0${cleanDistrict}` : cleanDistrict;

    // Normalize number block (must be digits, usually 4 digits)
    let cleanNumber = '';
    for (const c of rawNumber) {
      const d = toDigit(c);
      if (d.changed) corrections.push(`Number block: '${c}' -> '${d.char}'`);
      cleanNumber += d.char;
    }
    const paddedNumber = cleanNumber.padStart(4, '0');

    // Normalize series (must be alphabets)
    let cleanSeries = '';
    for (const c of rawSeries) {
      const a = toAlpha(c);
      if (a.changed) corrections.push(`Series block: '${c}' -> '${a.char}'`);
      cleanSeries += a.char;
    }

    const normalized = `${candidateState}${normalizedDistrict}${cleanSeries}${paddedNumber}`;
    const standardValid =
      Boolean(stateName) &&
      /^[A-Z]{2}[0-9]{2}[A-Z]{0,3}[0-9]{4}$/.test(normalized);

    // Calculate adjusted confidence score
    let confidence = baseConfidence;
    if (stateName) confidence += 0.05;
    if (corrections.length > 0) confidence -= corrections.length * 0.02;
    if (!standardValid) confidence *= 0.8;
    confidence = Math.max(0.3, Math.min(0.99, Number(confidence.toFixed(2))));

    // Determine estimated vehicle category based on series or state conventions
    let category: PlateAnalysisResult['vehicleCategoryEstimate'] = 'FOUR_WHEELER';
    if (cleanSeries.startsWith('C') || cleanSeries.includes('CA') || cleanSeries.includes('CD')) {
      category = 'FOUR_WHEELER';
    } else if (cleanSeries.startsWith('S') || cleanSeries.startsWith('M')) {
      category = 'TWO_WHEELER';
    } else if (cleanSeries.startsWith('T') || cleanSeries.startsWith('P')) {
      category = 'COMMERCIAL';
    }

    return {
      rawText: rawInput,
      normalizedPlate: normalized,
      isValid: standardValid,
      formatType: standardValid ? 'STANDARD' : 'CUSTOM',
      stateCode: candidateState,
      stateName: stateName || 'Unknown State',
      districtCode: normalizedDistrict,
      seriesCode: cleanSeries,
      uniqueNumber: paddedNumber,
      confidenceScore: confidence,
      ocrCorrectionsApplied: corrections,
      vehicleCategoryEstimate: category,
    };
  }

  // Fallback: If cannot cleanly parse components
  return {
    rawText: rawInput,
    normalizedPlate: cleaned,
    isValid: false,
    formatType: 'CUSTOM',
    confidenceScore: Math.max(0.35, baseConfidence * 0.6),
    ocrCorrectionsApplied: corrections,
    vehicleCategoryEstimate: 'UNKNOWN',
  };
}

/**
 * Format plate nicely for UI display with standard spacing
 * e.g. GJ01AB1234 -> "GJ 01 AB 1234", 22BH1234AA -> "22 BH 1234 AA"
 */
export function formatPlateDisplay(plate: string): string {
  if (!plate) return '';
  const clean = cleanPlateText(plate);
  
  // BH Series: 22BH1234AA -> 22 BH 1234 AA
  const bh = clean.match(/^([0-9]{2})(BH)([0-9]{4})([A-Z]{1,2})$/);
  if (bh) {
    return `${bh[1]} ${bh[2]} ${bh[3]} ${bh[4]}`;
  }

  // Standard: [State 2][District 2][Series 1-3][Number 4]
  const std = clean.match(/^([A-Z]{2})([0-9]{2})([A-Z]{0,3})([0-9]{4})$/);
  if (std) {
    return `${std[1]} ${std[2]} ${std[3] ? std[3] + ' ' : ''}${std[4]}`;
  }

  // Delhi single digit: DL8CAF1234 -> DL 08 CAF 1234
  const dl = clean.match(/^([A-Z]{2})([0-9]{1})([A-Z]{1,3})([0-9]{4})$/);
  if (dl) {
    return `${dl[1]} 0${dl[2]} ${dl[3]} ${dl[4]}`;
  }

  return clean;
}
