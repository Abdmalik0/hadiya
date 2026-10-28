import { Language } from '../types';

type LocalizedMap = Record<string, Partial<Record<Language, string>>>;

export const teamTranslations: LocalizedMap = {
  hossana: {
    en: 'Hadiya Hossana FC (The Tigers)',
    am: 'ሀዲያ ሆሳዕና (ነብሮቹ)',
    om: 'Hadiya Hossana FC',
  },
  hosaena: {
    en: 'Hadiya Hossana FC (The Tigers)',
    am: 'ሀዲያ ሆሳዕና (ነብሮቹ)',
    om: 'Hadiya Hossana FC',
  },
  halaba: {
    en: 'Halaba Ketema',
    am: 'ሀላባ ከተማ',
    om: 'Halaba Ketema',
  },
  cbe_sa: {
    en: 'Ethiopia Nigd Bank (CBE SA)',
    am: 'ኢትዮጵያ ንግድ ባንክ',
    om: 'Baankii Daldala Itoophiyaa (CBE)',
  },
  insurance: {
    en: 'Ethiopian Medhin (Insurance)',
    am: 'ኢትዮጵያ መድን',
    om: 'Inshuraansii Itoophiyaa (Medhin)',
  },
  fasil: {
    en: 'Fasil Kenema',
    am: 'ፋሲል ከነማ',
    om: 'Faasiil Kanamaa',
  },
  adama: {
    en: 'Adama Kenema SC',
    am: 'አዳማ ከነማ',
    om: 'Adaamaa Kanamaa',
  },
  electric: {
    en: 'Ethio Electric',
    am: 'ኢትዮ ኤሌክትሪክ',
    om: 'Ityoo Elektiriik',
  },
  bahirdar: {
    en: 'Bahir Dar Kenema',
    am: 'ባሕር ዳር ከነማ',
    om: 'Baahir Daar Kanamaa',
  },
  bunna: {
    en: 'Ethiopian Coffee SC',
    am: 'የኢትዮጵያ ቡና',
    om: 'Buna Itoophiyaa',
  },
  saintgeorge: {
    en: 'Saint George SC (Kidus Giorgis)',
    am: 'ቅዱስ ጊዮርጊስ',
    om: 'Qulqulluu Giyoorgis',
  },
  defence: {
    en: 'Defence Force SC (Mekelakeya)',
    am: 'መከላከያ',
    om: 'Raayyaa Ittisaa',
  },
  welwalo: {
    en: 'Welwalo Adigrat University',
    am: 'ወልዋሎ አዲግራት ዩኒቨርሲቲ',
    om: 'Walwaaloo Adigiraat',
  },
  wolaitta: {
    en: 'Wolaitta Dicha',
    am: 'ወላይታ ድቻ (የጦና ንቦች)',
    om: 'Wolaitta Dicha',
  },
  diredawa: {
    en: 'Dire Dawa Kenema',
    am: 'ድሬዳዋ ከነማ',
    om: 'Dirree Dhawaa Kanamaa',
  },
  gamochencha: {
    en: 'Gamo Chencha',
    am: 'ጋሞ ጬንቻ',
    om: 'Gaamoo Cencaa',
  },
  sidama: {
    en: 'Sidama Bunna',
    am: 'ሲዳማ ቡና',
    om: 'Sidaamaa Buna',
  },
  hawassa: {
    en: 'Hawassa Kenema',
    am: 'ሀዋሳ ከነማ',
    om: 'Hawaasaa Kanamaa',
  },
  shaggar: {
    en: 'Shaggar City SC',
    am: 'ሻገር ከተማ',
    om: 'Magaalaa Shaggar',
  },
  negelle: {
    en: 'Negelle Arsi FC',
    am: 'ነገሌ አርሲ',
    om: 'Nageellee Arsii',
  },
};

export const getLocalizedTeamName = (teamId?: string, defaultName: string = '', lang: Language = 'en'): string => {
  if (!teamId && !defaultName) return defaultName;
  const key = (teamId || defaultName).toLowerCase();
  
  if (key.includes('hossana') || key.includes('hosaena') || key.includes('hadiya')) {
    return teamTranslations.hossana?.[lang] || teamTranslations.hossana?.en || 'Hadiya Hossana FC';
  }
  if (teamTranslations[key]?.[lang]) return teamTranslations[key]![lang]!;
  if (teamTranslations[key]?.en) return teamTranslations[key]!.en!;

  for (const [tKey, trans] of Object.entries(teamTranslations)) {
    if (key.includes(tKey)) {
      return trans[lang] || trans.en || defaultName;
    }
  }

  return defaultName;
};

export const playerTranslations: LocalizedMap = {
  'Sintayehu Tamirat': { en: 'Sintayehu Tamirat', am: 'ስንታየሁ ታምራት', om: 'Sintayehu Tamirat' },
  'Suleiman Hamid': { en: 'Suleiman Hamid', am: 'ሱለይማን ሃሚድ', om: 'Suleiman Hamid' },
  'Temesgen Birhanu': { en: 'Temesgen Birhanu', am: 'ተመስገን ብርሃኑ', om: 'Temesgen Birhanu' },
  'Baye Gezahegn': { en: 'Baye Gezahegn', am: 'ባዬ ገዛኸኝ', om: 'Baye Gezahegn' },
  'Bizuayehu Endeshaw': { en: 'Bizuayehu Endeshaw', am: 'ብዙአየሁ እንደሻው', om: 'Bizuayehu Endeshaw' },
  'Henok Arficho': { en: 'Henok Arficho', am: 'ሄኖክ አርፊጮ', om: 'Henok Arficho' },
  'Dula Mulatu': { en: 'Dula Mulatu', am: 'ዱላ ሙላቱ', om: 'Dula Mulatu' },
  'Girma Habtetemariam': { en: 'Girma Habtetemariam', am: 'ግርማ ሀብተማሪያም', om: 'Girma Habtetemariam' },
};

export const getLocalizedPersonName = (name: string, lang: Language = 'en'): string => {
  return playerTranslations[name]?.[lang] || playerTranslations[name]?.en || name;
};

export const positionTranslations: LocalizedMap = {
  Goalkeeper: { en: 'Goalkeeper', am: 'ግብ ጠባቂ', om: 'Eegduu Galchii' },
  Defender: { en: 'Defender', am: 'ተከላካይ', om: 'Ittisaa' },
  Midfielder: { en: 'Midfielder', am: 'አማካኝ', om: 'Giddu-galeessa' },
  Forward: { en: 'Forward', am: 'አጥቂ', om: 'Fuuldura' },
  GOALKEEPER: { en: 'Goalkeeper', am: 'ግብ ጠባቂ', om: 'Eegduu Galchii' },
  DEFENDER: { en: 'Defender', am: 'ተከላካይ', om: 'Ittisaa' },
  MIDFIELDER: { en: 'Midfielder', am: 'አማካኝ', om: 'Giddu-galeessa' },
  FORWARD: { en: 'Forward', am: 'አጥቂ', om: 'Fuuldura' },
  ALL: { en: 'All Positions', am: 'ሁሉም ቦታዎች', om: 'Bakka Hunda' },
};

export const getLocalizedPosition = (pos: string, lang: Language = 'en'): string => {
  return positionTranslations[pos]?.[lang] || positionTranslations[pos]?.en || pos;
};

export const roleTranslations: LocalizedMap = {
  'Club President': { en: 'Club President', am: 'የክለቡ ፕሬዝዳንት', om: 'Pirezidaantii Kilabichaa' },
  'Head Coach': { en: 'Head Coach', am: 'ዋና አሰልጣኝ', om: 'Leenjisaa Ol’aanaa' },
  'Assistant Coach': { en: 'Assistant Coach', am: 'ረዳት አሰልጣኝ', om: 'Gargaaraa Leenjisaa' },
  'Goalkeeping Coach': { en: 'Goalkeeping Coach', am: 'የግብ ጠባቂዎች አሰልጣኝ', om: 'Leenjisaa Eegdota Galchii' },
  'Chief Medical Officer': { en: 'Chief Medical Officer', am: 'ዋና የህክምና ባለሙያ', om: 'Ogeessa Fayyaa' },
  'Technical Director': { en: 'Technical Director', am: 'ቴክኒካል ዳይሬክተር', om: 'Daayrektara Teeknikaa' },
};

export const getLocalizedRole = (role: string, lang: Language = 'en'): string => {
  return roleTranslations[role]?.[lang] || roleTranslations[role]?.en || role;
};

export const departmentTranslations: LocalizedMap = {
  Management: { en: 'Management', am: 'አመራር', om: 'Hoggansa' },
  Coaching: { en: 'Coaching', am: 'አሰልጣኝ ቡድን', om: 'Leenjii' },
  Medical: { en: 'Medical', am: 'ህክምና ክፍል', om: 'Kutaa Fayyaa' },
  TECHNICAL: { en: 'Technical', am: 'ቴክኒክ', om: 'Teeknika' },
  ADMINISTRATION: { en: 'Administration', am: 'አስተዳደር', om: 'Bulchiinsa' },
};

export const getLocalizedDepartment = (dept: string, lang: Language = 'en'): string => {
  return departmentTranslations[dept]?.[lang] || departmentTranslations[dept]?.en || dept;
};

export const venueTranslations: LocalizedMap = {
  'Abiyo Ermias Stadium, Hossana': { en: 'Abiyo Ermias Stadium, Hossana', am: 'አብዮ ኤርሚያስ ስታዲየም፣ ሆሳዕና', om: 'Istaadiyeemii Abiyoo Ermiyaas, Hosaana' },
  'Abiyo Ermias Stadium': { en: 'Abiyo Ermias Stadium', am: 'አብዮ ኤርሚያስ ስታዲየም', om: 'Istaadiyeemii Abiyoo Ermiyaas' },
  'Bahir Dar International Stadium': { en: 'Bahir Dar International Stadium', am: 'ባህር ዳር አለም አቀፍ ስታዲየም', om: 'Istaadiyeemii Idil-addunyaa Baahir Daar' },
  'Wolaita Sodo Stadium, Wolaita Sodo': { en: 'Wolaita Sodo Stadium, Wolaita Sodo', am: 'ወላይታ ሶዶ ስታዲየም፣ ወላይታ ሶዶ', om: 'Istaadiyeemii Walaayittaa Soddoo' },
  'Abebe Bikila Stadium, Addis Ababa': { en: 'Abebe Bikila Stadium, Addis Ababa', am: 'አበበ ቢቂላ ስታዲየም፣ አዲስ አበባ', om: 'Istaadiyeemii Abbabaa Biqilaa, Finfinnee' },
};

export const getLocalizedVenue = (venue: string, lang: Language = 'en'): string => {
  if (venueTranslations[venue]?.[lang]) return venueTranslations[venue]![lang]!;
  if (venueTranslations[venue]?.en) return venueTranslations[venue]!.en!;
  for (const [key, val] of Object.entries(venueTranslations)) {
    if (venue.includes(key)) return val[lang] || val.en || venue;
  }
  return venue;
};

export const roundTranslations: LocalizedMap = {
  'Round 1': { en: 'Round 1', am: 'ሳምንት 1', om: 'Marsaa 1' },
  'Round 2': { en: 'Round 2', am: 'ሳምንት 2', om: 'Marsaa 2' },
  'Round 3': { en: 'Round 3', am: 'ሳምንት 3', om: 'Marsaa 3' },
  'Round 4': { en: 'Round 4', am: 'ሳምንት 4', om: 'Marsaa 4' },
  'Round 5': { en: 'Round 5', am: 'ሳምንት 5', om: 'Marsaa 5' },
  'Round 6': { en: 'Round 6', am: 'ሳምንት 6', om: 'Marsaa 6' },
  'Round 7': { en: 'Round 7', am: 'ሳምንት 7', om: 'Marsaa 7' },
};

export const getLocalizedRound = (round?: string, lang: Language = 'en'): string => {
  if (!round) return '';
  if (roundTranslations[round]?.[lang]) return roundTranslations[round]![lang]!;
  if (roundTranslations[round]?.en) return roundTranslations[round]!.en!;
  const num = round.replace(/[^\d]/g, '');
  if (num) {
    if (lang === 'am') return `ሳምንት ${num}`;
    if (lang === 'om') return `Marsaa ${num}`;
  }
  return round;
};

export const competitionTranslations: LocalizedMap = {
  ETHIOPIAN_PREMIER_LEAGUE: { en: 'Ethiopian Premier League', am: 'የኢትዮጵያ ፕሪሚየር ሊግ', om: 'Liigii Piriimeeraa Itoophiyaa' },
  'Ethiopian Premier League': { en: 'Ethiopian Premier League', am: 'የኢትዮጵያ ፕሪሚየር ሊግ', om: 'Liigii Piriimeeraa Itoophiyaa' },
  ETHIOPIAN_CUP: { en: 'Ethiopian Cup', am: 'የኢትዮጵያ ዋንጫ', om: 'Waancaa Itoophiyaa' },
};

export const getLocalizedCompetition = (comp: string, lang: Language = 'en'): string => {
  if (competitionTranslations[comp]?.[lang]) return competitionTranslations[comp]![lang]!;
  if (competitionTranslations[comp]?.en) return competitionTranslations[comp]!.en!;
  return comp;
};

export const statusTranslations: LocalizedMap = {
  FINISHED: { en: 'Full Time', am: 'ሙሉ ጊዜ', om: 'Xumurameera' },
  UPCOMING: { en: 'Upcoming', am: 'የሚመጣ', om: 'Kanneen Dhufan' },
  LIVE: { en: 'Live Now', am: 'በቀጥታ', om: 'Kallattiin' },
  POSTPONED: { en: 'Postponed', am: 'የተላለፈ', om: 'Dabarfameera' },
};

export const getLocalizedStatus = (status: string, lang: Language = 'en'): string => {
  return statusTranslations[status]?.[lang] || statusTranslations[status]?.en || status;
};

export const categoryTranslations: LocalizedMap = {
  ALL: { en: 'All Stories', am: 'ሁሉም ዜናዎች', om: 'Oduu Hunda' },
  CLUB_NEWS: { en: 'Club News', am: 'የክለብ ዜና', om: 'Oduu Kilabii' },
  MATCH_REPORT: { en: 'Match Reports', am: 'የጨዋታ ሪፖርት', om: 'Gabaasa Taphaa' },
  MATCH_REPORTS: { en: 'Match Reports', am: 'የጨዋታ ሪፖርት', om: 'Gabaasa Taphaa' },
  TRANSFERS: { en: 'Transfers', am: 'ዝውውሮች', om: 'Jijjiirraa' },
  COMMUNITY: { en: 'Community & Fans', am: 'ደጋፊዎችና ማህበረሰብ', om: 'Hawaasa & Deeggartoota' },
};

export const getLocalizedCategory = (cat: string, lang: Language = 'en'): string => {
  return categoryTranslations[cat]?.[lang] || categoryTranslations[cat]?.en || cat.replace(/_/g, ' ');
};

export const shopCategoryTranslations: LocalizedMap = {
  ALL: { en: 'All Merchandise', am: 'ሁሉም እቃዎች', om: 'Meeshaalee Hunda' },
  JERSEY: { en: 'Match Jerseys', am: 'የጨዋታ ማሊያዎች', om: 'Jeersiiwwan Taphaa' },
  KIT: { en: 'Jackets & Training', am: 'ጃኬቶችና የስልጠና ልብሶች', om: 'Uffata Shaakalaa' },
  ACCESSORY: { en: 'Accessories & Scarves', am: 'የደጋፊዎች ሻርፕና ቁሳቁስ', om: 'Meeshaalee Deggartootaa' },
  ACCESSORIES: { en: 'Accessories & Scarves', am: 'የደጋፊዎች ሻርፕና ቁሳቁስ', om: 'Meeshaalee Deggartootaa' },
};

export const getLocalizedShopCategory = (cat: string, lang: Language = 'en'): string => {
  return shopCategoryTranslations[cat]?.[lang] || shopCategoryTranslations[cat]?.en || cat;
};

export const getFormBadgeLocalized = (formChar: string, lang: Language = 'en'): string => {
  if (lang === 'am') {
    if (formChar === 'W') return 'አ';
    if (formChar === 'D') return 'አቻ';
    if (formChar === 'L') return 'ተ';
  }
  if (lang === 'om') {
    if (formChar === 'W') return 'M';
    if (formChar === 'D') return 'Q';
    if (formChar === 'L') return 'A';
  }
  return formChar;
};
