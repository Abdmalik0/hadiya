import { Language } from '../types';

/**
 * Clean short names mapping for Ethiopian Premier League and general clubs.
 * Specifically tuned for small mobile displays (e.g., Samsung Galaxy Note 8 ~360px wide).
 */
export const SHORT_TEAM_NAMES: Record<string, Record<Language, string>> = {
  halaba: {
    en: 'Halaba City',
    am: 'ሀላባ ከተማ',
    om: 'Halaba City',
  },
  cbe_sa: {
    en: 'CBE SA',
    am: 'ንግድ ባንክ',
    om: 'CBE SA',
  },
  insurance: {
    en: 'Eth. Medhin',
    am: 'ኢትዮጵያ መድን',
    om: 'Eth. Medhin',
  },
  medhin: {
    en: 'Eth. Medhin',
    am: 'ኢትዮጵያ መድን',
    om: 'Eth. Medhin',
  },
  fasil: {
    en: 'Fasil Kenema',
    am: 'ፋሲል ከነማ',
    om: 'Faasiil',
  },
  adama: {
    en: 'Adama City',
    am: 'አዳማ ከነማ',
    om: 'Adaamaa',
  },
  electric: {
    en: 'Eth. Electric',
    am: 'መብራት ኃይል',
    om: 'Elektiriik',
  },
  bahirdar: {
    en: 'Bahir Dar',
    am: 'ባሕር ዳር',
    om: 'Baahir Daar',
  },
  bunna: {
    en: 'Eth. Coffee',
    am: 'ኢትዮጵያ ቡና',
    om: 'Buna Itoophiyaa',
  },
  saintgeorge: {
    en: 'St. George',
    am: 'ቅዱስ ጊዮርጊስ',
    om: 'St. George',
  },
  giorgis: {
    en: 'St. George',
    am: 'ቅዱስ ጊዮርጊስ',
    om: 'St. George',
  },
  defence: {
    en: 'Defence Force',
    am: 'መከላከያ',
    om: 'Raayyaa Ittisaa',
  },
  mekelakeya: {
    en: 'Defence Force',
    am: 'መከላከያ',
    om: 'Raayyaa Ittisaa',
  },
  sidama: {
    en: 'Sidama Coffee',
    am: 'ሲዳማ ቡና',
    om: 'Buna Sidaamaa',
  },
  wolaitta: {
    en: 'Wolaitta Dicha',
    am: 'ወላይታ ድቻ',
    om: 'Wolaitta Dicha',
  },
  dicha: {
    en: 'Wolaitta Dicha',
    am: 'ወላይታ ድቻ',
    om: 'Wolaitta Dicha',
  },
  hosaena: {
    en: 'Hadiya Hossana',
    am: 'ሀዲያ ሆሳዕና',
    om: 'Hadiya Hossana',
  },
  hossana: {
    en: 'Hadiya Hossana',
    am: 'ሀዲያ ሆሳዕና',
    om: 'Hadiya Hossana',
  },
  diredawa: {
    en: 'Dire Dawa',
    am: 'ድሬዳዋ ከነማ',
    om: 'Dirre Dhawaa',
  },
  gamochencha: {
    en: 'Gamo Chencha',
    am: 'ጋሞ ጬንቻ',
    om: 'Gamo Chencha',
  },
  welwalo: {
    en: 'Welwalo',
    am: 'ወልዋሎ',
    om: 'Walwaaloo',
  },
  hawassa: {
    en: 'Hawassa City',
    am: 'ሀዋሳ ከነማ',
    om: 'Hawaasaa',
  },
  shaggar: {
    en: 'Shaggar City',
    am: 'ሻገር ከተማ',
    om: 'Magaalaa Shaggar',
  },
  negelle: {
    en: 'Negelle Arsi',
    am: 'ነገሌ አርሲ',
    om: 'Nageellee Arsii',
  },
  shire: {
    en: 'Suhul Shire',
    am: 'ሱሁል ሽሬ',
    om: 'Suhul Shire',
  },
};

/**
 * Normalizes any club key or ID
 */
function normalizeTeamKey(id?: string, name?: string): string {
  const combined = `${id || ''} ${name || ''}`.toLowerCase();
  if (combined.includes('halaba')) return 'halaba';
  if (combined.includes('cbe') || combined.includes('nigd') || combined.includes('commercial bank')) return 'cbe_sa';
  if (combined.includes('insurance') || combined.includes('medhin')) return 'insurance';
  if (combined.includes('fasil')) return 'fasil';
  if (combined.includes('adama')) return 'adama';
  if (combined.includes('electric') || combined.includes('mebrat')) return 'electric';
  if (combined.includes('bahir')) return 'bahirdar';
  if (combined.includes('saint') || combined.includes('george') || combined.includes('giorgis')) return 'saintgeorge';
  if (combined.includes('defence') || combined.includes('defense') || combined.includes('mekelakeya') || combined.includes('mechal')) return 'defence';
  if (combined.includes('sidama')) return 'sidama';
  if (combined.includes('bunna') || combined.includes('coffee')) return 'bunna';
  if (combined.includes('wolaitta') || combined.includes('dicha')) return 'wolaitta';
  if (combined.includes('hosaena') || combined.includes('hossana') || combined.includes('hadiya')) return 'hosaena';
  if (combined.includes('dire')) return 'diredawa';
  if (combined.includes('gamo') || combined.includes('chencha')) return 'gamochencha';
  if (combined.includes('welwalo') || combined.includes('adigrat')) return 'welwalo';
  if (combined.includes('hawassa') || combined.includes('awassa')) return 'hawassa';
  if (combined.includes('shaggar')) return 'shaggar';
  if (combined.includes('negelle')) return 'negelle';
  if (combined.includes('shire')) return 'shire';
  return (id || '').toLowerCase().trim();
}

/**
 * Returns a mobile-friendly short team name.
 * Automatically cleans trailing SC, FC, Football Club, parenthesized nicknames,
 * or resolves known short localized names for Ethiopian Premier League teams.
 */
export function formatTeamName(
  teamId?: string,
  teamName?: string,
  language: Language = 'en'
): string {
  const key = normalizeTeamKey(teamId, teamName);

  if (SHORT_TEAM_NAMES[key]) {
    return SHORT_TEAM_NAMES[key][language] || SHORT_TEAM_NAMES[key].en;
  }

  // Fallback string sanitization for other/unlisted teams
  let clean = (teamName || teamId || 'Club').trim();

  // Strip parenthesized nicknames like (Berberewochu) or (Kidus Giorgis)
  clean = clean.replace(/\(.*?\)/g, '').trim();

  // Strip common verbose club suffixes in English
  clean = clean
    .replace(/\bFootball Club\b/gi, '')
    .replace(/\bSport Club\b/gi, '')
    .replace(/\bSports Club\b/gi, '')
    .replace(/\bFC\b/g, '')
    .replace(/\bSC\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return clean || teamName || 'Club';
}

export const getShortTeamName = formatTeamName;
export default formatTeamName;
