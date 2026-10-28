import { useState, useEffect, useCallback } from 'react';
import { StandingTeam } from '../types';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

const STANDINGS_CACHE_KEY = 'halaba_official_epl_standings_v12_real_table';

export interface UseStandingsResult {
  standings: StandingTeam[];
  isOnline: boolean;
  isFetching: boolean;
  isCached: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refresh: () => Promise<void>;
}

// Fallback initial 18 Ethiopian Premier League clubs
const fallbackStandings: StandingTeam[] = [
  { position: 1, teamId: 'cbe_sa', teamName: 'Ethiopia Nigd Bank (CBE SA)', played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 4, goalsAgainst: 1, goalDifference: 3, points: 7, form: ['W', 'D', 'W'], isHalaba: false },
  { position: 2, teamId: 'bahirdar', teamName: 'Bahir Dar Kenema', played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 5, goalsAgainst: 3, goalDifference: 2, points: 7, form: ['W', 'W', 'D'], isHalaba: false },
  { position: 3, teamId: 'defence', teamName: 'Mechal (Defence Force)', played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, points: 6, form: ['L', 'W', 'W'], isHalaba: false },
  { position: 4, teamId: 'negelle', teamName: 'Negele Arsi FC', played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 6, form: ['W', 'L', 'W'], isHalaba: false },
  { position: 5, teamId: 'halaba', teamName: 'Halaba Ketema (በርበሬዎቹ)', played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 5, form: ['D', 'W', 'D'], isHalaba: true },
  { position: 6, teamId: 'fasil', teamName: 'Fasil Kenema', played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 5, form: ['D', 'D', 'W'], isHalaba: false },
  { position: 7, teamId: 'insurance', teamName: 'Ethiopian Medhin (Insurance)', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 4, form: ['W', 'D', 'L'], isHalaba: false },
  { position: 8, teamId: 'adama', teamName: 'Adama Kenema SC', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 4, form: ['D', 'W', 'L'], isHalaba: false },
  { position: 9, teamId: 'shaggar', teamName: 'Shaggar City FC', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 4, form: ['L', 'W', 'D'], isHalaba: false },
  { position: 10, teamId: 'bunna', teamName: 'Ethiopian Coffee SC (Bunna)', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 4, form: ['W', 'L', 'D'], isHalaba: false },
  { position: 11, teamId: 'wolaitta', teamName: 'Wolaitta Dicha', played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3, form: ['L', 'L', 'W'], isHalaba: false },
  { position: 12, teamId: 'welwalo', teamName: 'Welwalo Adigrat Univ.', played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, points: 3, form: ['L', 'W', 'L'], isHalaba: false },
  { position: 13, teamId: 'saintgeorge', teamName: 'Saint George SC (Kidus Giorgis)', played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 2, form: ['D', 'L', 'D'], isHalaba: false },
  { position: 14, teamId: 'hawassa', teamName: 'Hawassa Kenema SC', played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 1, goalsAgainst: 2, goalDifference: -1, points: 2, form: ['D', 'D', 'L'], isHalaba: false },
  { position: 15, teamId: 'hosaena', teamName: 'Hadiya Hossana', played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 2, form: ['L', 'D', 'D'], isHalaba: false },
  { position: 16, teamId: 'sidama', teamName: 'Sidama Coffee SC', played: 3, won: 0, drawn: 1, lost: 2, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 1, form: ['L', 'D', 'L'], isHalaba: false },
  { position: 17, teamId: 'electric', teamName: 'Ethio Electric', played: 3, won: 0, drawn: 1, lost: 2, goalsFor: 1, goalsAgainst: 4, goalDifference: -3, points: 1, form: ['L', 'L', 'D'], isHalaba: false },
  { position: 18, teamId: 'gamochencha', teamName: 'Gamo Chencha', played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 0, goalsAgainst: 3, goalDifference: -3, points: 0, form: ['L', 'L', 'L'], isHalaba: false },
];

/**
 * Loads standings immediately from localStorage cache on initial render.
 * When online, fetches fresh data from API/Firestore in the background,
 * updates state, and overwrites localStorage.
 * Listens for online/offline events to gracefully present cached data.
 */
export function useStandings(): UseStandingsResult {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [standings, setStandings] = useState<StandingTeam[]>(() => {
    // Instant synchronous cache retrieval on initial mount
    try {
      const cached = localStorage.getItem(STANDINGS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 18) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[useStandings] Could not parse localStorage cache:', e);
    }
    return fallbackStandings;
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
      const standingsRef = collection(db, 'standings');
      const snapshot = await getDocs(standingsRef);

      if (!snapshot.empty) {
        const remoteStandings: StandingTeam[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const goalsFor = Number(data.goalsFor) || 0;
          const goalsAgainst = Number(data.goalsAgainst) || 0;
          return {
            position: Number(data.position) || 1,
            teamId: docSnap.id,
            teamName: data.teamName || 'Team',
            played: Number(data.played) || 0,
            won: Number(data.won) || 0,
            drawn: Number(data.drawn) || 0,
            lost: Number(data.lost) || 0,
            goalsFor,
            goalsAgainst,
            goalDifference: goalsFor - goalsAgainst,
            points: Number(data.points) || 0,
            form: Array.isArray(data.form) && data.form.length > 0 ? data.form : ['D', 'W', 'D'],
            isHalaba: docSnap.id === 'halaba' || Boolean(data.isHalaba),
            badgeUrl: data.badgeUrl,
          };
        });

        // Ensure all 18 clubs are accounted for
        fallbackStandings.forEach((fallbackTeam) => {
          if (!remoteStandings.some((t) => t.teamId === fallbackTeam.teamId)) {
            remoteStandings.push({ ...fallbackTeam });
          }
        });

        remoteStandings.sort(
          (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
        );
        const reordered = remoteStandings.map((t, idx) => ({ ...t, position: idx + 1 }));

        // Update state and overwrite localStorage cache with fresh payload
        setStandings(reordered);
        setIsCached(false);
        setLastUpdated(new Date());

        try {
          localStorage.setItem(STANDINGS_CACHE_KEY, JSON.stringify(reordered));
        } catch (storageErr) {
          console.warn('[useStandings] localStorage write quota warning:', storageErr);
        }
      }
    } catch (fetchErr) {
      // If network fails, gracefully log and keep cached data without breaking UI
      console.warn('[useStandings] Background fetch notice (serving cache):', fetchErr);
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
      const standingsRef = collection(db, 'standings');
      unsubscribeFirestore = onSnapshot(
        standingsRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: StandingTeam[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              const goalsFor = Number(data.goalsFor) || 0;
              const goalsAgainst = Number(data.goalsAgainst) || 0;
              return {
                position: Number(data.position) || 1,
                teamId: docSnap.id,
                teamName: data.teamName || 'Team',
                played: Number(data.played) || 0,
                won: Number(data.won) || 0,
                drawn: Number(data.drawn) || 0,
                lost: Number(data.lost) || 0,
                goalsFor,
                goalsAgainst,
                goalDifference: goalsFor - goalsAgainst,
                points: Number(data.points) || 0,
                form: Array.isArray(data.form) && data.form.length > 0 ? data.form : ['D', 'W', 'D'],
                isHalaba: docSnap.id === 'halaba' || Boolean(data.isHalaba),
                badgeUrl: data.badgeUrl,
              };
            });

            fallbackStandings.forEach((fallbackTeam) => {
              if (!list.some((t) => t.teamId === fallbackTeam.teamId)) {
                list.push({ ...fallbackTeam });
              }
            });

            list.sort(
              (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
            );
            const reordered = list.map((t, idx) => ({ ...t, position: idx + 1 }));

            setStandings(reordered);
            setIsCached(false);
            setLastUpdated(new Date());

            try {
              localStorage.setItem(STANDINGS_CACHE_KEY, JSON.stringify(reordered));
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
          console.debug('[useStandings] Snapshot listener notice:', error);
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
    standings,
    isOnline,
    isFetching,
    isCached,
    lastUpdated,
    error,
    refresh: fetchFreshData,
  };
}
