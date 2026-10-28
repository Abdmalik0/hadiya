import React, { useState, useEffect } from 'react';

// Official TheSportsDB API strBadge values for Ethiopian Premier League clubs
// Directly sourced from TheSportsDB (League ID 4959)
export const OFFICIAL_SPORTSDB_BADGES: Record<string, string> = {
  halaba: 'https://r2.thesportsdb.com/images/media/team/badge/ol9g9y1790265506.png',
  cbe_sa: 'https://r2.thesportsdb.com/images/media/team/badge/fn7am21727368578.png',
  insurance: 'https://r2.thesportsdb.com/images/media/team/badge/oboroa1776295149.png',
  medhin: 'https://r2.thesportsdb.com/images/media/team/badge/oboroa1776295149.png',
  fasil: 'https://r2.thesportsdb.com/images/media/team/badge/xivgrb1790265423.png',
  adama: 'https://r2.thesportsdb.com/images/media/team/badge/4yijrk1615830040.png',
  electric: 'https://r2.thesportsdb.com/images/media/team/badge/nywmq91790265280.png',
  bunna: 'https://r2.thesportsdb.com/images/media/team/badge/welkj51790265316.png',
  bahirdar: 'https://r2.thesportsdb.com/images/media/team/badge/o25wvi1790265058.png',
  saintgeorge: 'https://r2.thesportsdb.com/images/media/team/badge/r5orqa1615830067.png',
  giorgis: 'https://r2.thesportsdb.com/images/media/team/badge/r5orqa1615830067.png',
  defence: 'https://r2.thesportsdb.com/images/media/team/badge/o1ig4m1760893133.png',
  mekelakeya: 'https://r2.thesportsdb.com/images/media/team/badge/o1ig4m1760893133.png',
  welwalo: 'https://r2.thesportsdb.com/images/media/team/badge/x1aihm1727368029.png',
  wolaitta: 'https://r2.thesportsdb.com/images/media/team/badge/zveh4e1615830076.png',
  dicha: 'https://r2.thesportsdb.com/images/media/team/badge/zveh4e1615830076.png',
  hosaena: '/assets/aistudio/Hossana_c1744e20.png',
  hossana: '/assets/aistudio/Hossana_c1744e20.png',
  hadiya: '/assets/aistudio/Hossana_c1744e20.png',
  diredawa: 'https://r2.thesportsdb.com/images/media/team/badge/70017i1615830053.png',
  gamochencha: 'https://r2.thesportsdb.com/images/media/team/badge/o3yz391790265452.png',
  sidama: 'https://r2.thesportsdb.com/images/media/team/badge/45f96b1790265577.png',
  hawassa: 'https://r2.thesportsdb.com/images/media/team/badge/hawassa_city_sc.png',
  shaggar: 'https://r2.thesportsdb.com/images/media/team/badge/shaggar_city_epl.png',
  negelle: 'https://r2.thesportsdb.com/images/media/team/badge/negele_arsi_fc.png',
};

// Canonical English search names for TheSportsDB API
const CANONICAL_SEARCH_NAMES: Record<string, string> = {
  halaba: 'Halaba Ketema',
  fasil: 'Fasil Kenema',
  wolaitta: 'Wolaitta Dicha',
  dicha: 'Wolaitta Dicha',
  bahirdar: 'Bahir Dar Kenema',
  cbe_sa: 'Commercial Bank of Ethiopia',
  insurance: 'Ethiopian Medhin',
  medhin: 'Ethiopian Medhin',
  adama: 'Adama Kenema',
  electric: 'Ethio Electric',
  bunna: 'Ethiopian Coffee',
  saintgeorge: 'Kidus Giorgis',
  giorgis: 'Kidus Giorgis',
  defence: 'Mechal',
  mekelakeya: 'Mechal',
  welwalo: 'Welwalo Adigrat University',
  hosaena: 'Hadiya Hossana',
  hossana: 'Hadiya Hossana',
  diredawa: 'Dire Dawa Kenema',
  gamochencha: 'Gamo Chencha',
  sidama: 'Sidama Bunna',
  hawassa: 'Hawassa Kenema',
  shaggar: 'Shaggar City',
  negelle: 'Negelle Arsi',
};

// Persistent badge storage helper
const STORAGE_KEY = 'thesportsdb_badges_v2';

function loadPersistedBadges(): Map<string, string | null> {
  const map = new Map<string, string | null>();
  // Pre-seed with official verified TheSportsDB badges
  Object.entries(OFFICIAL_SPORTSDB_BADGES).forEach(([k, v]) => {
    map.set(k.toLowerCase().trim(), v);
  });

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        Object.entries(parsed).forEach(([k, v]) => {
          if (typeof v === 'string' || v === null) {
            map.set(k.toLowerCase().trim(), v as string | null);
          }
        });
      }
    }
  } catch {
    // Ignore localStorage read errors in private browsing/restricted webviews
  }
  return map;
}

function persistBadge(key: string, badge: string | null) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[key] = badge;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // Ignore quota or privacy mode errors
  }
}

// In-memory badge cache initialized with pre-seeded & persisted entries
const badgeCache = loadPersistedBadges();

export interface EthiopianClubLogoProps {
  teamId?: string;
  teamName?: string;
  clubId?: string;
  clubName?: string;
  size?: number;
  badgeUrl?: string;
  priority?: boolean;
  className?: string;
}

export const EthiopianClubLogo: React.FC<EthiopianClubLogoProps> = ({
  teamId,
  teamName,
  clubId,
  clubName,
  size = 36,
  badgeUrl,
  priority = false,
  className = '',
}) => {
  const effectiveTeamId = teamId || clubId || '';
  const effectiveTeamName = teamName || clubName || '';
  // Normalize lookup key
  const normalizedKey = (effectiveTeamId || effectiveTeamName).toLowerCase().trim();

  // Instant synchronous lookup for zero delay on initial render
  const initialBadge = (): string | null => {
    if (badgeUrl) return badgeUrl;
    if (badgeCache.has(normalizedKey)) {
      return badgeCache.get(normalizedKey) || null;
    }
    // Check canonical dictionary
    if (OFFICIAL_SPORTSDB_BADGES[normalizedKey]) {
      return OFFICIAL_SPORTSDB_BADGES[normalizedKey];
    }
    // Check partial matches (e.g. 'halaba' in teamId)
    for (const [key, val] of Object.entries(OFFICIAL_SPORTSDB_BADGES)) {
      if (normalizedKey.includes(key)) {
        return val;
      }
    }
    return null;
  };

  const [badge, setBadge] = useState<string | null>(initialBadge);
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (badgeUrl) {
      setBadge(badgeUrl);
      setImgError(false);
      return;
    }

    // If already cached or found in official dictionary, use it immediately
    const cached = badgeCache.get(normalizedKey);
    if (cached !== undefined) {
      setBadge(cached);
      return;
    }

    for (const [key, val] of Object.entries(OFFICIAL_SPORTSDB_BADGES)) {
      if (normalizedKey.includes(key)) {
        badgeCache.set(normalizedKey, val);
        setBadge(val);
        return;
      }
    }

    // Direct asynchronous fetch from TheSportsDB API
    let isMounted = true;

    const fetchBadge = async () => {
      try {
        const isNumericId = /^\d+$/.test(teamId);
        let url: string;

        if (isNumericId) {
          url = `https://www.thesportsdb.com/api/v1/json/123/lookupteam.php?id=${teamId}`;
        } else {
          // Resolve canonical English search term to prevent issues with localized/Amharic names
          const canonicalEnglish =
            CANONICAL_SEARCH_NAMES[normalizedKey] ||
            teamName
              .replace(/\(.*?\)/g, '')
              .replace(/\[.*?\]/g, '')
              .replace(/[^\x00-\x7F]/g, '') // remove non-ascii/ethiopic chars for TheSportsDB search
              .trim();

          const searchTerm = canonicalEnglish || teamId || teamName;
          url = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const teamObj = data?.teams?.[0];
        const fetchedBadge = teamObj?.strBadge || teamObj?.strTeamBadge || null;
        const normalizedBadge = fetchedBadge ? fetchedBadge.replace('/tiny', '') : null;

        badgeCache.set(normalizedKey, normalizedBadge);
        persistBadge(normalizedKey, normalizedBadge);

        if (isMounted) {
          setBadge(normalizedBadge);
        }
      } catch {
        badgeCache.set(normalizedKey, null);
        persistBadge(normalizedKey, null);
        if (isMounted) {
          setBadge(null);
        }
      }
    };

    fetchBadge();

    return () => {
      isMounted = false;
    };
  }, [teamId, teamName, badgeUrl, normalizedKey]);

  // If badge exists and image has not failed, render standard <img>
  if (badge && !imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative rounded-full bg-neutral-900 border border-neutral-700/80 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden select-none transition-transform duration-200 ${className}`}
        title={teamName}
      >
        <img
          src={badge}
          alt={teamName}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-80'
          }`}
          onError={() => setImgError(true)}
          onLoad={() => setIsLoaded(true)}
          loading={priority || size >= 48 ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Clean text fallback with the team name (no local images or design placeholder icons)
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-neutral-800/90 border border-neutral-700/80 p-1 flex items-center justify-center text-center shrink-0 overflow-hidden select-none text-neutral-300 font-semibold shadow-sm ${className}`}
      title={teamName}
    >
      <span
        className="truncate max-w-full leading-tight text-center px-0.5 tracking-tight font-medium"
        style={{ fontSize: Math.max(9, Math.floor(size * 0.24)) }}
      >
        {teamName}
      </span>
    </div>
  );
};

export const TeamLogo = EthiopianClubLogo;
export default EthiopianClubLogo;
