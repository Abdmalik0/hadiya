export type Language = 'en' | 'am' | 'om';

export interface ClubInfo {
  name: string;
  shortName: string;
  nickname: {
    en: string;
    am: string;
    had?: string;
    om: string;
  };
  founded: number;
  stadium: {
    name: string;
    capacity: string;
    city: string;
    region: string;
    surface: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    mediaEmail: string;
    ticketOffice: string;
    hours: string;
  };
  socials: {
    facebook: string;
    telegram: string;
    youtube: string;
    twitter: string;
  };
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED';
export type Competition = 'ETHIOPIAN_HIGHER_LEAGUE' | 'ETHIOPIAN_PREMIER_LEAGUE' | 'ETHIOPIAN_CUP' | 'REGIONAL_CUP' | 'FRIENDLY';

export interface Match {
  id: string;
  competition: Competition;
  competitionName: string;
  date: string;
  kickoffTime: string;
  venue: string;
  homeTeam: {
    id: string;
    name: string;
    isHalaba?: boolean;
    isHossana?: boolean;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    isHalaba?: boolean;
    isHossana?: boolean;
    logo?: string;
  };
  status: MatchStatus;
  score?: {
    home: number;
    away: number;
  };
  halftimeScore?: {
    home: number;
    away: number;
  };
  round?: string;
  attendance?: string;
  referee?: string;
  liveMinute?: number;
  livePeriod?: '1H' | 'HT' | '2H' | 'FT';
  liveEvents?: Array<{
    id: string;
    minute: number;
    text: string;
    type: 'goal' | 'card' | 'sub' | 'whistle';
    team?: 'home' | 'away';
  }>;
  scorers?: Array<{
    player: string;
    minute: number;
    team: 'home' | 'away';
    isPenalty?: boolean;
    isOwnGoal?: boolean;
  }>;
  summary?: string;
}

export interface LiveNotification {
  id: string;
  type: 'goal' | 'standings' | 'match_start' | 'match_end' | 'sync';
  title: string;
  message: string;
  timestamp: string;
}

export interface StandingTeam {
  position: number;
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: Array<'W' | 'D' | 'L'>;
  isHalaba: boolean;
  badgeUrl?: string;
}

export type NewsCategory = 'CLUB_NEWS' | 'MATCH_REPORTS' | 'MATCH_REPORT' | 'TRANSFERS' | 'INTERVIEWS' | 'ACADEMY' | 'COMMUNITY';

export interface NewsArticle {
  id: string;
  title: {
    en: string;
    am: string;
    om?: string;
  };
  summary: {
    en: string;
    am: string;
    om?: string;
  } | string;
  excerpt?: {
    en: string;
    am: string;
    om?: string;
  };
  content: {
    en: string;
    am: string;
    om?: string;
  } | string;
  category: NewsCategory;
  date: string;
  author: string;
  imageUrl: string;
  isFeatured?: boolean;
  featured?: boolean;
  readTime: string;
}

export type MembershipTier = 'SUPPORTER' | 'STANDARD' | 'PREMIUM';

export interface MembershipApplication {
  id: string;
  referenceNumber?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phone: string;
  email?: string;
  cityOrRegion: string;
  membershipType?: MembershipTier;
  tier?: string;
  preferredLanguage?: Language;
  registeredAt?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'ACTIVE';
  amountPaid?: number | string;
  tx_ref?: string;
  paymentStatus?: 'PAID' | 'PENDING' | 'FAILED';
  paymentMethod?: string;
  paymentDate?: string;
  appliedDate?: string;
  verifiedDate?: string;
  expiryDate?: string;
  membershipFee?: number;
  cardNumber?: string;
  photoUrl?: string;
  notes?: string;
}

export interface Player {
  id: string;
  number: number;
  name: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
  nationality: string;
  birthYear?: number;
  age?: number;
  appearances: number;
  goals: number;
  assists?: number;
  cleanSheets?: number;
  yellowCards?: number;
  redCards?: number;
  isCaptain?: boolean;
  image?: string;
  biography?: string;
  height?: string;
  preferredFoot?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: 'Coaching' | 'Medical' | 'Management' | 'TECHNICAL' | 'ADMINISTRATION' | 'MEDICAL' | 'COACHING' | 'MANAGEMENT';
  nationality: string;
  biography?: string;
  joinedYear?: number;
}

export interface ShopItem {
  id: string;
  name: {
    en: string;
    am: string;
    om?: string;
  } | string;
  description: {
    en: string;
    am: string;
    om?: string;
  } | string;
  price: number; // in ETB
  originalPrice?: number;
  imageUrl: string;
  availableSizes?: string[];
  sizes?: string[];
  category?: 'JERSEY' | 'KIT' | 'ACCESSORY' | 'ACCESSORIES' | 'MEMORABILIA';
  inStock?: boolean;
  stock?: number;
  featured?: boolean;
  badge?: string;
}

export interface ShopOrder {
  id: string;
  orderNumber: string;
  itemId: string;
  itemName: string;
  size: string;
  amount: number;
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  subcityOrRegion: string;
  createdAt: string;
  status: 'PENDING' | 'PAID' | 'DELIVERED';
  tx_ref: string;
  paymentMethod?: string;
  verifiedAt?: string;
}

export interface DonationRecord {
  id: string;
  donationNumber: string;
  fullName: string;
  email?: string;
  phone: string;
  amount: number;
  purpose: string;
  tx_ref: string;
  createdAt: string;
  status: 'PENDING' | 'COMPLETED';
  verifiedAt?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  nameAm?: string;
  nameOm?: string;
  tier: string;
  tierAm?: string;
  imageUrl?: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  descriptionAm?: string;
  active?: boolean;
  order?: number;
  sinceYear?: number;
}
