import { useState, useEffect, useCallback } from 'react';
import { Match } from '../types';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

const FIXTURES_CACHE_KEY = 'halaba_matches_epl_2026_27_v18';

export interface UseFixturesResult {
  fixtures: Match[];
  matches: Match[];
  isOnline: boolean;
  isFetching: boolean;
  isCached: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refresh: () => Promise<void>;
}

// Fallback initial matches
const fallbackMatches: Match[] = [
  {
    id: 'm-epl-rd3',
    competition: 'ETHIOPIAN_PREMIER_LEAGUE',
    competitionName: 'Ethiopian Premier League',
    date: '2026-10-24',
    kickoffTime: '15:00',
    venue: 'Halaba Stadium',
    homeTeam: { id: 'halaba', name: 'Halaba Ketema', isHalaba: true },
    awayTeam: { id: 'gamochencha', name: 'Gamo Chencha', isHalaba: false },
    status: 'FINISHED',
    score: { home: 1, away: 0 },
    halftimeScore: { home: 1, away: 0 },
    round: 'Round 3',
    attendance: '16,800',
    referee: 'Tewodros Marcos',
    summary: 'Captain header in the 42nd minute secured an undefeated Round 3 victory for the Red Peppers.',
  },
  {
    id: 'm-epl-rd4',
    competition: 'ETHIOPIAN_PREMIER_LEAGUE',
    competitionName: 'Ethiopian Premier League',
    date: '2026-11-01',
    kickoffTime: '15:00',
    venue: 'Bahir Dar International Stadium',
    homeTeam: { id: 'bahirdar', name: 'Bahir Dar Kenema', isHalaba: false },
    awayTeam: { id: 'halaba', name: 'Halaba Ketema', isHalaba: true },
    status: 'UPCOMING',
    round: 'Round 4',
  },
  {
    id: 'm-epl-rd5',
    competition: 'ETHIOPIAN_PREMIER_LEAGUE',
    competitionName: 'Ethiopian Premier League',
    date: '2026-11-08',
    kickoffTime: '15:00',
    venue: 'Halaba Stadium',
    homeTeam: { id: 'halaba', name: 'Halaba Ketema', isHalaba: true },
    awayTeam: { id: 'bunna', name: 'Ethiopian Coffee SC', isHalaba: false },
    status: 'UPCOMING',
    round: 'Round 5',
  },
  {
    id: 'm-epl-rd2',
    competition: 'ETHIOPIAN_PREMIER_LEAGUE',
    competitionName: 'Ethiopian Premier League',
    date: '2026-10-18',
    kickoffTime: '15:00',
    venue: 'Abebe Bikila Stadium',
    homeTeam: { id: 'saintgeorge', name: 'Saint George SC', isHalaba: false },
    awayTeam: { id: 'halaba', name: 'Halaba Ketema', isHalaba: true },
    status: 'FINISHED',
    score: { home: 1, away: 1 },
    halftimeScore: { home: 1, away: 0 },
    round: 'Round 2',
    summary: 'A resilient second-half equalizer earned Halaba a hard-fought away point in Addis Ababa.',
  },
  {
    id: 'm-epl-rd1',
    competition: 'ETHIOPIAN_PREMIER_LEAGUE',
    competitionName: 'Ethiopian Premier League',
    date: '2026-10-11',
    kickoffTime: '15:00',
    venue: 'Halaba Stadium',
    homeTeam: { id: 'halaba', name: 'Halaba Ketema', isHalaba: true },
    awayTeam: { id: 'fasil', name: 'Fasil Kenema', isHalaba: false },
    status: 'FINISHED',
    score: { home: 1, away: 1 },
    halftimeScore: { home: 0, away: 1 },
    round: 'Round 1',
    summary: 'Season opener: Halaba shared the spoils in front of a packed home crowd at Halaba Stadium.',
  },
];

/**
 * Loads fixtures immediately from localStorage cache on initial render.
 * When online, fetches fresh data from API/Firestore in the background,
 * updates state, and overwrites localStorage.
 * Listens for online/offline events to gracefully present cached data without throwing errors.
 */
export function useFixtures(): UseFixturesResult {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [fixtures, setFixtures] = useState<Match[]>(() => {
    // Instant synchronous cache retrieval on initial mount
    try {
      const cached = localStorage.getItem(FIXTURES_CACHE_KEY);
      if (cached) {
        const parsed: Match[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[useFixtures] Could not parse localStorage cache:', e);
    }
    return fallbackMatches;
  });

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isCached, setIsCached] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => new Date());
  const [error, setError] = useState<string | null>(null);

  // Background fetch function that safely updates state and overwrites localStorage
  const fetchFreshData = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Gracefully serve cached data without network error
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const matchesRef = collection(db, 'matches');
      const snapshot = await getDocs(matchesRef);

      if (!snapshot.empty) {
        const remoteMatches: Match[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            competition: data.competition || 'ETHIOPIAN_PREMIER_LEAGUE',
            competitionName: data.competitionName || 'Ethiopian Premier League',
            date: data.date || '',
            kickoffTime: data.kickoffTime || '15:00',
            venue: data.venue || 'Halaba Stadium',
            homeTeam: data.homeTeam || { id: 'halaba', name: 'Halaba Ketema', isHalaba: true },
            awayTeam: data.awayTeam || { id: 'away', name: 'Away Team', isHalaba: false },
            status: data.status || 'UPCOMING',
            score: data.score,
            halftimeScore: data.halftimeScore,
            round: data.round,
            attendance: data.attendance,
            referee: data.referee,
            scorers: data.scorers,
            summary: data.summary || '',
            liveMinute: data.liveMinute,
            livePeriod: data.livePeriod,
            liveEvents: data.liveEvents,
          } as Match;
        });

        // Ensure canonical round matches are present
        fallbackMatches.forEach((fbMatch) => {
          if (!remoteMatches.some((m) => m.id === fbMatch.id)) {
            remoteMatches.push({ ...fbMatch });
          }
        });

        // Sort priority
        const halabaPriority = ['m-epl-rd3', 'm-epl-rd4', 'm-epl-rd5', 'm-epl-rd2', 'm-epl-rd1'];
        remoteMatches.sort((a, b) => {
          const aIdx = halabaPriority.indexOf(a.id);
          const bIdx = halabaPriority.indexOf(b.id);
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
          if (aIdx !== -1) return -1;
          if (bIdx !== -1) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // Update state and overwrite localStorage cache with fresh payload
        setFixtures(remoteMatches);
        setIsCached(false);
        setLastUpdated(new Date());

        try {
          localStorage.setItem(FIXTURES_CACHE_KEY, JSON.stringify(remoteMatches));
        } catch (storageErr) {
          console.warn('[useFixtures] localStorage write quota warning:', storageErr);
        }
      }
    } catch (fetchErr) {
      // If network fails, gracefully log and keep cached data without breaking UI
      console.warn('[useFixtures] Background fetch notice (serving cache):', fetchErr);
      setError(fetchErr instanceof Error ? fetchErr.message : 'Network error');
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Online / offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
      // Fetch fresh data in the background when connectivity is restored
      fetchFreshData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsFetching(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial background fetch upon mounting if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      fetchFreshData();
    }

    // Also subscribe to real-time updates when online
    let unsubscribeFirestore: (() => void) | undefined;
    try {
      const matchesRef = collection(db, 'matches');
      unsubscribeFirestore = onSnapshot(
        matchesRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Match[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                competition: data.competition || 'ETHIOPIAN_PREMIER_LEAGUE',
                competitionName: data.competitionName || 'Ethiopian Premier League',
                date: data.date || '',
                kickoffTime: data.kickoffTime || '15:00',
                venue: data.venue || 'Halaba Stadium',
                homeTeam: data.homeTeam || { id: 'halaba', name: 'Halaba Ketema', isHalaba: true },
                awayTeam: data.awayTeam || { id: 'away', name: 'Away Team', isHalaba: false },
                status: data.status || 'UPCOMING',
                score: data.score,
                halftimeScore: data.halftimeScore,
                round: data.round,
                attendance: data.attendance,
                referee: data.referee,
                scorers: data.scorers,
                summary: data.summary || '',
                liveMinute: data.liveMinute,
                livePeriod: data.livePeriod,
                liveEvents: data.liveEvents,
              } as Match;
            });

            fallbackMatches.forEach((fbMatch) => {
              if (!list.some((m) => m.id === fbMatch.id)) {
                list.push({ ...fbMatch });
              }
            });

            const halabaPriority = ['m-epl-rd3', 'm-epl-rd4', 'm-epl-rd5', 'm-epl-rd2', 'm-epl-rd1'];
            list.sort((a, b) => {
              const aIdx = halabaPriority.indexOf(a.id);
              const bIdx = halabaPriority.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            setFixtures(list);
            setIsCached(false);
            setLastUpdated(new Date());

            try {
              localStorage.setItem(FIXTURES_CACHE_KEY, JSON.stringify(list));
            } catch (err) {
              // ignore
            }
          }
        },
        (error) => {
          // Gracefully handle snapshot errors (e.g. offline) without UI crashes
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return;
          }
          console.debug('[useFixtures] Snapshot listener notice:', error);
        }
      );
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [fetchFreshData]);

  return {
    fixtures,
    matches: fixtures,
    isOnline,
    isFetching,
    isCached,
    lastUpdated,
    error,
    refresh: fetchFreshData,
  };
}
