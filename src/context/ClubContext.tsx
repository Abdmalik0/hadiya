import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  Language,
  ClubInfo,
  Match,
  StandingTeam,
  NewsArticle,
  Player,
  StaffMember,
  MembershipApplication,
  MembershipTier,
  LiveNotification,
  ShopItem,
  ShopOrder,
  DonationRecord,
  Sponsor,
} from '../types';
import {
  initialClubInfo,
  initialMatches,
  initialStandings,
  initialNews,
  initialPlayers,
  initialStaff,
  initialMemberships,
  initialShopItems,
  initialSponsors,
} from '../data/mockData';
import { translations } from '../translations';
import { ClubImages } from '../assets/images';
import { calculateStandingsFromMatches } from '../utils/standingsCalculator';
import { getIdbItem, setIdbItem, createThumbnail } from '../utils/idb';

export type PageRoute = 'home' | 'fixtures' | 'standings' | 'news' | 'membership' | 'shop' | 'about' | 'contact' | 'admin';

interface ClubContextType {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];

  // Navigation
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  selectedArticleId: string | null;
  setSelectedArticleId: (id: string | null) => void;
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;

  // Club Dossier
  isDossierOpen: boolean;
  openDossier: () => void;
  closeDossier: () => void;

  // Live Notifications
  liveNotifications: LiveNotification[];
  dismissNotification: (id: string) => void;

  // Live Auto-Update & Simulation Engine
  isAutoSyncEnabled: boolean;
  toggleAutoSync: () => void;
  autoSyncInterval: number;
  setAutoSyncInterval: (interval: number) => void;
  secondsUntilNextSync: number;
  isSyncing: boolean;
  lastSyncTime: Date;
  syncNow: () => void;
  simulateLiveMatchAction: () => void;
  advanceLeagueMatchday: () => void;

  // Club Info
  clubInfo: ClubInfo;
  updateClubInfo: (info: ClubInfo) => void;

  // Matches
  matches: Match[];
  addMatch: (match: Omit<Match, 'id'>) => Promise<void>;
  updateMatch: (id: string, match: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;

  // Standings
  standings: StandingTeam[];
  updateStanding: (teamId: string, updates: Partial<StandingTeam>) => Promise<void>;
  resetStandings: () => Promise<void>;
  recalculateStandingsFromMatches: () => Promise<void>;

  // News
  news: NewsArticle[];
  addNewsArticle: (article: Omit<NewsArticle, 'id'>) => void;
  updateNewsArticle: (id: string, updates: Partial<NewsArticle>) => void;
  deleteNewsArticle: (id: string) => void;

  // Squad & Staff
  players: Player[];
  staff: StaffMember[];
  addPlayer: (player: Omit<Player, 'id'>) => Promise<void>;
  updatePlayer: (id: string, updates: Partial<Player>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  addStaff: (staffMember: Omit<StaffMember, 'id'>) => Promise<void>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;

  // Memberships
  memberships: MembershipApplication[];
  submitMembership: (data: {
    fullName: string;
    dateOfBirth: string;
    gender?: string;
    phone: string;
    email?: string;
    cityOrRegion: string;
    membershipType: MembershipTier;
    preferredLanguage: Language;
    amountPaid?: number | string;
    tx_ref?: string;
  }) => Promise<{ success: boolean; referenceNumber: string }>;
  recordVerifiedMembership: (data: {
    referenceNumber: string;
    fullName: string;
    dateOfBirth: string;
    gender?: string;
    phone: string;
    email?: string;
    cityOrRegion: string;
    membershipType: MembershipTier;
    preferredLanguage: Language;
    amountPaid: number | string;
    tx_ref: string;
  }) => Promise<MembershipApplication>;
  updateMembershipStatus: (id: string, status: 'APPROVED' | 'PENDING' | 'REJECTED') => Promise<void>;
  deleteMembership: (id: string) => Promise<void>;

  // Shop & Merchandise
  shopItems: ShopItem[];
  addShopItem: (item: Omit<ShopItem, 'id'>) => Promise<string | void> | void;
  updateShopItem: (id: string, updates: Partial<ShopItem>) => Promise<void> | void;
  deleteShopItem: (id: string) => Promise<void> | void;
  resetShopItems: () => Promise<void> | void;
  isProductsLoading: boolean;
  productsSyncError: string | null;
  shopOrders: ShopOrder[];
  recordShopOrder: (order: ShopOrder) => void;
  updateShopOrderStatus: (id: string, status: 'PENDING' | 'PAID' | 'DELIVERED') => void;

  // Checkout Modal
  isCheckoutModalOpen: boolean;
  checkoutItem: ShopItem | null;
  openCheckoutModal: (item: ShopItem) => void;
  closeCheckoutModal: () => void;

  // Donations
  donations: DonationRecord[];
  recordDonation: (donation: DonationRecord) => void;
  isDonationModalOpen: boolean;
  openDonationModal: () => void;
  closeDonationModal: () => void;

  // Admin Auth (Firebase Authentication)
  isAdminLoggedIn: boolean;
  adminUsername: string | null;
  adminUser: User | null;
  isAuthChecking: boolean;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;

  // Sponsors & Partner Posters (Firebase Firestore Connected)
  sponsors: Sponsor[];
  addSponsor: (sponsor: Omit<Sponsor, 'id'>) => Promise<string | void> | string | void;
  updateSponsor: (id: string, updates: Partial<Sponsor>) => Promise<void> | void;
  deleteSponsor: (id: string) => Promise<void> | void;
  resetSponsors: () => Promise<void> | void;
  isSponsorsLoading: boolean;
  sponsorsSyncError: string | null;

  // Utility & Offline Resilience
  isOnline: boolean;
  resetAllDataToDefault: () => void;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('halaba_official_epl_standings_v7_canonical');
    localStorage.removeItem('halaba_official_epl_standings_v3');
    localStorage.removeItem('halaba_official_epl_standings_v2');
    localStorage.removeItem('halaba_official_epl_standings');
    localStorage.removeItem('halaba_standings_epl_2026_27');
    localStorage.removeItem('halaba_standings_sportsdb_v2');
    localStorage.removeItem('hcfc_firestore_standings_seeded');
    localStorage.removeItem('hcfc_firestore_standings_seeded_v2');
    localStorage.removeItem('hcfc_firestore_standings_seeded_v3');
  }
} catch (e) {
  // Ignore storage access errors
}

export const normalizeEplTeamId = (rawId?: string, rawName?: string): string => {
  const str = `${rawId || ''} ${rawName || ''}`.toLowerCase();
  if (str.includes('halaba')) return 'halaba';
  if (str.includes('cbe') || str.includes('nigd') || rawId === '149377') return 'cbe_sa';
  if (str.includes('medhin') || str.includes('insurance') || rawId === '146921') return 'insurance';
  if (str.includes('adama') || rawId === '141024') return 'adama';
  if (str.includes('electric') || rawId === '146920') return 'electric';
  if (str.includes('fasil') || rawId === '141026') return 'fasil';
  if (str.includes('bahir') || rawId === '141025') return 'bahirdar';
  if (str.includes('bunna') || (str.includes('coffee') && !str.includes('sidama'))) return 'bunna';
  if (str.includes('george') || str.includes('giorgis')) return 'saintgeorge';
  if (str.includes('defence') || str.includes('mekelakeya') || str.includes('mechal') || rawId === '143767') return 'defence';
  if (str.includes('welwalo')) return 'welwalo';
  if (str.includes('dicha') || str.includes('wolaitta')) return 'wolaitta';
  if (str.includes('hosaena') || str.includes('hossana')) return 'hosaena';
  if (str.includes('diredawa') || str.includes('dire dawa')) return 'diredawa';
  if (str.includes('chencha') || str.includes('gamo')) return 'gamochencha';
  if (str.includes('sidama')) return 'sidama';
  if (str.includes('hawassa')) return 'hawassa';
  if (str.includes('shaggar') || str.includes('sheger')) return 'shaggar';
  if (str.includes('negelle') || str.includes('negele')) return 'negelle';
  return (rawId || '').replace(/[^a-z0-9]/g, '') || 'unknown';
};

const STORAGE_KEYS = {
  LANG: 'halaba_lang',
  CLUB: 'halaba_club_info_epl_26_27',
  MATCHES: 'halaba_matches_epl_2026_27_v18',
  STANDINGS: 'halaba_official_epl_standings_v12_real_table',
  NEWS: 'halaba_news_epl_2026_27',
  PLAYERS: 'halaba_players',
  STAFF: 'halaba_staff',
  MEMBERSHIPS: 'halaba_memberships',
  SHOP_ITEMS: 'halaba_shop_items_2026',
  SHOP_ORDERS: 'halaba_shop_orders_2026',
  DONATIONS: 'halaba_donations_2026',
  ADMIN_AUTH: 'halaba_admin_auth',
  SPONSORS: 'halaba_sponsors_v2',
};

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    if (saved === 'en' || saved === 'am' || saved === 'om') return saved;
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  };

  const t = translations[language];

  // Network & Offline Connectivity Listener
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.info('[ClubContext] Network online: background sync active');
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.info('[ClubContext] Network offline: seamlessly serving cached data');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Routing (Hash / Memory Routing for local WebViews and PWAs)
  const getInitialPage = (): PageRoute => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase() as PageRoute;
      const validPages: PageRoute[] = ['home', 'fixtures', 'standings', 'news', 'membership', 'shop', 'about', 'contact', 'admin'];
      if (validPages.includes(hash)) return hash;
    }
    return 'home';
  };

  const [currentPage, setCurrentPageState] = useState<PageRoute>(getInitialPage);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const setCurrentPage = (page: PageRoute) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      if (page === 'home') {
        if (window.location.hash) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        window.location.hash = page;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase() as PageRoute;
      const validPages: PageRoute[] = ['home', 'fixtures', 'standings', 'news', 'membership', 'shop', 'about', 'contact', 'admin'];
      if (validPages.includes(hash)) {
        setCurrentPageState(hash);
      } else if (!hash) {
        setCurrentPageState('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Club Info
  const [clubInfo, setClubInfo] = useState<ClubInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLUB);
    return saved ? JSON.parse(saved) : initialClubInfo;
  });

  const updateClubInfo = (info: ClubInfo) => {
    setClubInfo(info);
    localStorage.setItem(STORAGE_KEYS.CLUB, JSON.stringify(info));
  };

  // Matches State & Real-Time Firebase Firestore Integration
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (!saved) return initialMatches;
    try {
      const parsed: Match[] = JSON.parse(saved);
      const hasHalaba = parsed.some(
        (m) =>
          m.homeTeam?.isHalaba ||
          m.awayTeam?.isHalaba ||
          m.homeTeam?.name?.toLowerCase().includes('halaba') ||
          m.awayTeam?.name?.toLowerCase().includes('halaba')
      );
      if (!hasHalaba) {
        return initialMatches;
      }
      return parsed;
    } catch {
      return initialMatches;
    }
  });

  useEffect(() => {
    const matchesRef = collection(db, 'matches');
    const unsubscribe = onSnapshot(matchesRef, async (snapshot) => {
      if (snapshot.empty) {
        const seeded = localStorage.getItem('hcfc_firestore_matches_seeded');
        if (!seeded) {
          try {
            for (const m of initialMatches) {
              await setDoc(doc(db, 'matches', m.id), { ...m, updatedAt: serverTimestamp() });
            }
            localStorage.setItem('hcfc_firestore_matches_seeded', 'true');
          } catch (err) {
            console.warn('Could not seed matches:', err);
          }
        }
        return;
      }
      const liveMatches: Match[] = snapshot.docs.map((docSnap) => {
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
      // Guarantee all official league fixtures (including all Round 3 matches) are present
      initialMatches.forEach((initM) => {
        if (!liveMatches.some((m) => m.id === initM.id)) {
          liveMatches.push({ ...initM });
        }
      });

      if (liveMatches.length > 0) {
        // Sort matches canonically so order is rock-solid and never jumps on load
        const halabaPriority = ['m-epl-rd3', 'm-epl-rd4', 'm-epl-rd5', 'm-epl-rd2', 'm-epl-rd1'];
        liveMatches.sort((a, b) => {
          const aIdx = halabaPriority.indexOf(a.id);
          const bIdx = halabaPriority.indexOf(b.id);
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
          if (aIdx !== -1) return -1;
          if (bIdx !== -1) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setMatches(liveMatches);
        try {
          localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(liveMatches));
        } catch (e) {
          console.warn('LocalStorage error caching matches:', e);
        }
        localStorage.setItem('hcfc_firestore_matches_seeded', 'true');

        // Automatically sync standings from matches if any teams are lagging behind Round 3
        const autoComputed = calculateStandingsFromMatches(liveMatches, initialStandings);
        setStandings((prev) => {
          const hasLaggingTeam = prev.some((t) => t.played < 3);
          if (hasLaggingTeam) {
            localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(autoComputed));
            return autoComputed;
          }
          return prev;
        });
      }
    }, (error) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Offline: gracefully serve local cache without throwing UI errors
        return;
      }
      console.warn('Firebase real-time matches note (serving cache):', error);
      handleFirestoreError(error, OperationType.LIST, 'matches');
    });
    return () => unsubscribe();
  }, []);

  const addMatch = async (matchData: Omit<Match, 'id'>) => {
    const matchId = `match-${Date.now()}`;
    const newMatch: Match = {
      ...matchData,
      id: matchId,
    };
    const updated = [newMatch, ...matches];
    setMatches(updated);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));

    // Automatically recalculate standings from the updated matches
    const updatedStandings = calculateStandingsFromMatches(updated, standings);
    setStandings(updatedStandings);
    localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(updatedStandings));

    try {
      await setDoc(doc(db, 'matches', matchId), {
        ...newMatch,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      for (const st of updatedStandings) {
        await setDoc(doc(db, 'standings', st.teamId), { ...st, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (error) {
      console.error('Firestore add match error:', error);
      handleFirestoreError(error, OperationType.CREATE, `matches/${matchId}`);
    }
  };

  const updateMatch = async (id: string, updates: Partial<Match>) => {
    const updated = matches.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMatches(updated);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));

    // Automatically recalculate standings whenever a match result or score updates
    const updatedStandings = calculateStandingsFromMatches(updated, standings);
    setStandings(updatedStandings);
    localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(updatedStandings));

    try {
      const cleanUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      }
      await setDoc(doc(db, 'matches', id), {
        ...cleanUpdates,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      for (const st of updatedStandings) {
        await setDoc(doc(db, 'standings', st.teamId), { ...st, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (error) {
      console.error('Firestore update match error:', error);
      handleFirestoreError(error, OperationType.UPDATE, `matches/${id}`);
    }
  };

  const deleteMatch = async (id: string) => {
    const updated = matches.filter((m) => m.id !== id);
    setMatches(updated);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));

    const updatedStandings = calculateStandingsFromMatches(updated, standings);
    setStandings(updatedStandings);
    localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(updatedStandings));

    try {
      await deleteDoc(doc(db, 'matches', id));
    } catch (error) {
      console.error('Firestore delete match error:', error);
      handleFirestoreError(error, OperationType.DELETE, `matches/${id}`);
    }
  };

  // Standings State & Real-Time Firebase Firestore Integration
  const [standings, setStandings] = useState<StandingTeam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STANDINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 18) {
          const hasHalaba = parsed.some((t) => t.isHalaba || t.teamId === 'halaba');
          const hasCbe = parsed.some((t) => t.teamId === 'cbe_sa');
          if (hasHalaba && hasCbe) {
            return parsed;
          }
        }
      }
    } catch (e) {
      // Ignore
    }
    return initialStandings;
  });

  useEffect(() => {
    const standingsRef = collection(db, 'standings');
    const unsubscribe = onSnapshot(standingsRef, async (snapshot) => {
      const canonicalMap = new Map<string, StandingTeam>();

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const canonicalId = normalizeEplTeamId(docSnap.id, data.teamName || data.teamId);

        // Delete obsolete, non-canonical or duplicate doc IDs from Firestore
        if (docSnap.id !== canonicalId) {
          deleteDoc(doc(db, 'standings', docSnap.id)).catch(() => {});
        }

        const teamItem: StandingTeam = {
          position: data.position || 1,
          teamId: canonicalId,
          teamName: canonicalId === 'cbe_sa'
            ? 'Ethiopia Nigd Bank (CBE SA)'
            : canonicalId === 'halaba'
            ? 'Halaba Ketema (በርበሬዎቹ)'
            : canonicalId === 'insurance'
            ? 'Ethiopian Medhin (Insurance)'
            : canonicalId === 'adama'
            ? 'Adama Kenema SC'
            : canonicalId === 'electric'
            ? 'Ethio Electric'
            : canonicalId === 'shaggar'
            ? 'Shaggar City FC'
            : canonicalId === 'negelle'
            ? 'Negele Arsi FC'
            : canonicalId === 'hawassa'
            ? 'Hawassa Kenema SC'
            : (data.teamName || 'Team'),
          played: Number(data.played) || 0,
          won: Number(data.won) || 0,
          drawn: Number(data.drawn) || 0,
          lost: Number(data.lost) || 0,
          goalsFor: Number(data.goalsFor) || 0,
          goalsAgainst: Number(data.goalsAgainst) || 0,
          goalDifference: (Number(data.goalsFor) || 0) - (Number(data.goalsAgainst) || 0),
          points: Number(data.points) || 0,
          form: Array.isArray(data.form) && data.form.length > 0 ? data.form : ['D', 'W', 'D'],
          isHalaba: canonicalId === 'halaba',
          badgeUrl: data.badgeUrl || undefined,
        };

        if (!canonicalMap.has(canonicalId)) {
          canonicalMap.set(canonicalId, teamItem);
        }
      });

      // Guarantee all 18 Ethiopian Premier League clubs are present
      initialStandings.forEach((initT) => {
        if (!canonicalMap.has(initT.teamId)) {
          canonicalMap.set(initT.teamId, { ...initT });
        }
      });

      const list = Array.from(canonicalMap.values());
      list.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
      const reordered = list.map((t, idx) => ({ ...t, position: idx + 1 }));

      if (reordered.length >= 18) {
        setStandings(reordered);
        localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(reordered));
      }
    }, (error) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Offline: gracefully serve local cache without throwing UI errors
        return;
      }
      console.warn('Firebase real-time standings note:', error);
    });
    return () => unsubscribe();
  }, []);

  const updateStanding = async (teamId: string, updates: Partial<StandingTeam>) => {
    const updated = standings.map((item) => {
      if (item.teamId === teamId) {
        const next = { ...item, ...updates };
        next.goalDifference = next.goalsFor - next.goalsAgainst;
        return next;
      }
      return item;
    });
    updated.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
    const reordered = updated.map((t, idx) => ({ ...t, position: idx + 1 }));
    setStandings(reordered);
    localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(reordered));
    try {
      const targetTeam = reordered.find((t) => t.teamId === teamId);
      if (targetTeam) {
        await setDoc(doc(db, 'standings', teamId), {
          ...targetTeam,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.error('Firestore update standing error:', error);
      handleFirestoreError(error, OperationType.UPDATE, `standings/${teamId}`);
    }
  };

  const resetStandings = async () => {
    localStorage.removeItem(STORAGE_KEYS.STANDINGS);
    setStandings(initialStandings);
    localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(initialStandings));
    try {
      for (const item of initialStandings) {
        await setDoc(doc(db, 'standings', item.teamId), {
          ...item,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.error('Firestore reset standings error:', error);
    }
  };

  const recalculateStandingsFromMatches = async () => {
    const computed = calculateStandingsFromMatches(matches, standings);
    setStandings(computed);
    localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(computed));
    try {
      for (const item of computed) {
        await setDoc(doc(db, 'standings', item.teamId), {
          ...item,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.warn('Firestore recalculate standings warning:', error);
    }
  };


  // Real-time Firestore sync listener status
  useEffect(() => {
    // Keep local cache in sync and ensure authoritative Firestore data persists
    if (matches.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    }
  }, [matches]);


  // News State & Real-Time Firebase Firestore Integration with Instant Offline Cache
  const getCategoryFallbackImage = (category?: string): string => {
    switch (category) {
      case 'MATCH_REPORTS':
        return ClubImages.newsBahirDarWin || ClubImages.matchAction;
      case 'INTERVIEWS':
        return ClubImages.newsCoachInterview;
      case 'ACADEMY':
        return ClubImages.academyTraining;
      case 'TRANSFERS':
        return ClubImages.squadLineup;
      case 'CLUB_NEWS':
      case 'COMMUNITY':
      default:
        return ClubImages.heroStadium;
    }
  };

  const [news, setNews] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NEWS);
      if (saved) {
        const parsed: NewsArticle[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => {
            const initialMatch = initialNews.find((n) => n.id === item.id);
            return {
              ...item,
              imageUrl: item.imageUrl || initialMatch?.imageUrl || getCategoryFallbackImage(item.category),
            };
          });
        }
      }
    } catch (e) {
      // ignore
    }
    return initialNews;
  });

  // Rapidly hydrate full-resolution news & images from IndexedDB (runs in ~10ms on startup)
  useEffect(() => {
    getIdbItem<NewsArticle[]>('halaba_news_full_cache_v2')
      .then((cached) => {
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setNews((currentNews) => {
            const currentMap = new Map(currentNews.map((n) => [n.id, n]));
            let hasChanges = false;

            const merged = cached.map((c) => {
              const live = currentMap.get(c.id);
              if (!live) {
                hasChanges = true;
                return c;
              }
              // If live item is missing image or only has low-res thumbnail, adopt cached full image
              if (!live.imageUrl || (live.imageUrl.length < 5000 && c.imageUrl && c.imageUrl.length > 5000)) {
                hasChanges = true;
                return { ...live, imageUrl: c.imageUrl };
              }
              return live;
            });

            currentNews.forEach((n) => {
              if (!merged.some((m) => m.id === n.id)) {
                merged.unshift(n);
                hasChanges = true;
              }
            });

            return hasChanges ? merged : currentNews;
          });
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        return;
      }

      const liveArticles: NewsArticle[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const initialMatch = initialNews.find((n) => n.id === docSnap.id);
        const resolvedImage = data.imageUrl || initialMatch?.imageUrl || getCategoryFallbackImage(data.category);

        return {
          id: docSnap.id,
          title: typeof data.title === 'object' && data.title !== null
            ? { en: data.title.en || '', am: data.title.am || data.title.en || '', om: data.title.om || data.title.en || '' }
            : (initialMatch ? initialMatch.title : { en: String(data.title || ''), am: String(data.title || ''), om: String(data.title || '') }),
          summary: typeof data.summary === 'object' && data.summary !== null
            ? { en: data.summary.en || '', am: data.summary.am || data.summary.en || '', om: data.summary.om || data.summary.en || '' }
            : (initialMatch ? initialMatch.summary : { en: String(data.summary || ''), am: String(data.summary || ''), om: String(data.summary || '') }),
          content: typeof data.content === 'object' && data.content !== null
            ? { en: data.content.en || '', am: data.content.am || data.content.en || '', om: data.content.om || data.content.en || '' }
            : (initialMatch ? initialMatch.content : { en: String(data.content || ''), am: String(data.content || ''), om: String(data.content || '') }),
          category: data.category || initialMatch?.category || 'CLUB_NEWS',
          date: data.date || initialMatch?.date || new Date().toISOString().slice(0, 10),
          author: data.author || initialMatch?.author || 'Club Administration',
          imageUrl: resolvedImage,
          readTime: data.readTime || initialMatch?.readTime || '3 min read',
          isFeatured: docSnap.id === 'news-1793126013273' || docSnap.id === 'sxRTmExguBl4NTz4RYjR' || Boolean(data.isFeatured || initialMatch?.isFeatured),
        } as NewsArticle;
      });

      // Keep supplementary membership and academy stories present
      initialNews.forEach((initArt) => {
        if (!liveArticles.some((a) => a.id === initArt.id)) {
          liveArticles.push({ ...initArt });
        }
      });

      if (liveArticles.length > 0) {
        setNews(liveArticles);

        // 1. Asynchronously cache full-resolution payload in IndexedDB (no 5MB quota limit)
        setIdbItem('halaba_news_full_cache_v2', liveArticles);

        // 2. Persist compressed thumbnails to localStorage for synchronous 0ms startup
        Promise.all(
          liveArticles.map(async (art) => {
            if (art.imageUrl && art.imageUrl.startsWith('data:')) {
              try {
                const thumb = await createThumbnail(art.imageUrl, 360, 0.55);
                return { ...art, imageUrl: thumb };
              } catch {
                return art;
              }
            }
            return art;
          })
        ).then((thumbnailArticles) => {
          try {
            localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(thumbnailArticles));
          } catch (e) {
            console.warn('Could not cache news thumbnails in localStorage:', e);
          }
        }).catch(() => {
          // ignore
        });
      }
    }, (error) => {
      console.error("Firebase real-time news error:", error);
      handleFirestoreError(error, OperationType.LIST, 'news');
    });

    return () => unsubscribe();
  }, []);

  const addNewsArticle = async (art: Omit<NewsArticle, 'id'>) => {
    const newId = `news-${Date.now()}`;
    const newArticle: NewsArticle = {
      ...art,
      id: newId,
      imageUrl: art.imageUrl || getCategoryFallbackImage(art.category),
    };
    const updated = [newArticle, ...news];
    setNews(updated);
    setIdbItem('halaba_news_full_cache_v2', updated);

    createThumbnail(newArticle.imageUrl || '', 360, 0.55).then((thumb) => {
      try {
        const cached = updated.map((a) => (a.id === newId ? { ...a, imageUrl: thumb } : a));
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(cached));
      } catch {
        // ignore
      }
    });

    try {
      await setDoc(doc(db, "news", newId), {
        ...art,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Could not sync added article to Firestore:', e);
    }
  };

  const updateNewsArticle = async (id: string, updates: Partial<NewsArticle>) => {
    const updated = news.map((n) => (n.id === id ? { ...n, ...updates } : n));
    setNews(updated);
    setIdbItem('halaba_news_full_cache_v2', updated);

    try {
      await setDoc(doc(db, "news", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn('Could not sync updated article to Firestore:', e);
    }
  };

  const deleteNewsArticle = async (id: string) => {
    try {
      await deleteDoc(doc(db, "news", id));
    } catch (error) {
      console.warn("Could not delete news article from Firebase Cloud:", error);
    }
    const updated = news.filter((n) => n.id !== id);
    setNews(updated);
    setIdbItem('halaba_news_full_cache_v2', updated);
    try {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Players & Staff State & Real-Time Firebase Firestore Integration
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return saved ? JSON.parse(saved) : initialPlayers;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : initialStaff;
  });

  useEffect(() => {
    const playersRef = collection(db, 'players');
    const unsubscribe = onSnapshot(playersRef, async (snapshot) => {
      if (snapshot.empty) {
        const seeded = localStorage.getItem('hcfc_firestore_players_seeded');
        if (!seeded) {
          try {
            for (const p of initialPlayers) {
              await setDoc(doc(db, 'players', p.id), { ...p, updatedAt: serverTimestamp() });
            }
            localStorage.setItem('hcfc_firestore_players_seeded', 'true');
          } catch (err) {
            console.warn('Could not seed players:', err);
          }
        }
        return;
      }
      const livePlayers: Player[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          number: data.number || 10,
          name: data.name || 'Player',
          position: data.position || 'Midfielder',
          nationality: data.nationality || 'Ethiopian',
          birthYear: data.birthYear || 2000,
          appearances: data.appearances || 0,
          goals: data.goals || 0,
          assists: data.assists || 0,
          cleanSheets: data.cleanSheets || 0,
          isCaptain: Boolean(data.isCaptain),
          photoUrl: data.photoUrl,
        } as Player;
      });
      if (livePlayers.length > 0) {
        setPlayers(livePlayers);
        localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(livePlayers));
        localStorage.setItem('hcfc_firestore_players_seeded', 'true');
      }
    }, (error) => {
      console.error('Firebase real-time players error:', error);
      handleFirestoreError(error, OperationType.LIST, 'players');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const staffRef = collection(db, 'staff');
    const unsubscribe = onSnapshot(staffRef, async (snapshot) => {
      if (snapshot.empty) {
        const seeded = localStorage.getItem('hcfc_firestore_staff_seeded');
        if (!seeded) {
          try {
            for (const s of initialStaff) {
              await setDoc(doc(db, 'staff', s.id), { ...s, updatedAt: serverTimestamp() });
            }
            localStorage.setItem('hcfc_firestore_staff_seeded', 'true');
          } catch (err) {
            console.warn('Could not seed staff:', err);
          }
        }
        return;
      }
      const liveStaff: StaffMember[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Staff',
          role: data.role || 'Coach',
          department: data.department || 'Coaching',
          nationality: data.nationality || 'Ethiopian',
          photoUrl: data.photoUrl,
        } as StaffMember;
      });
      if (liveStaff.length > 0) {
        setStaff(liveStaff);
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(liveStaff));
        localStorage.setItem('hcfc_firestore_staff_seeded', 'true');
      }
    }, (error) => {
      console.error('Firebase real-time staff error:', error);
      handleFirestoreError(error, OperationType.LIST, 'staff');
    });
    return () => unsubscribe();
  }, []);

  const addPlayer = async (p: Omit<Player, 'id'>) => {
    const id = `p-${Date.now()}`;
    const newP: Player = { ...p, id };
    const updated = [...players, newP];
    setPlayers(updated);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'players', id), { ...newP, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error('Firestore add player error:', error);
      handleFirestoreError(error, OperationType.CREATE, `players/${id}`);
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    const updated = players.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPlayers(updated);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'players', id), { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error('Firestore update player error:', error);
      handleFirestoreError(error, OperationType.UPDATE, `players/${id}`);
    }
  };

  const deletePlayer = async (id: string) => {
    const updated = players.filter((p) => p.id !== id);
    setPlayers(updated);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'players', id));
    } catch (error) {
      console.error('Firestore delete player error:', error);
      handleFirestoreError(error, OperationType.DELETE, `players/${id}`);
    }
  };

  const addStaff = async (s: Omit<StaffMember, 'id'>) => {
    const id = `s-${Date.now()}`;
    const newS: StaffMember = { ...s, id };
    const updated = [...staff, newS];
    setStaff(updated);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'staff', id), { ...newS, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error('Firestore add staff error:', error);
      handleFirestoreError(error, OperationType.CREATE, `staff/${id}`);
    }
  };

  const updateStaff = async (id: string, updates: Partial<StaffMember>) => {
    const updated = staff.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStaff(updated);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'staff', id), { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error('Firestore update staff error:', error);
      handleFirestoreError(error, OperationType.UPDATE, `staff/${id}`);
    }
  };

  const deleteStaff = async (id: string) => {
    const updated = staff.filter((s) => s.id !== id);
    setStaff(updated);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'staff', id));
    } catch (error) {
      console.error('Firestore delete staff error:', error);
      handleFirestoreError(error, OperationType.DELETE, `staff/${id}`);
    }
  };

  // Memberships State & Real-Time Firebase Firestore Integration
  const [memberships, setMemberships] = useState<MembershipApplication[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS);
    return saved ? JSON.parse(saved) : initialMemberships;
  });

  useEffect(() => {
    const membershipsRef = collection(db, 'memberships');
    const unsubscribe = onSnapshot(membershipsRef, async (snapshot) => {
      if (snapshot.empty) {
        const seeded = localStorage.getItem('hcfc_firestore_memberships_seeded');
        if (!seeded) {
          try {
            for (const m of initialMemberships) {
              await setDoc(doc(db, 'memberships', m.id), { ...m, updatedAt: serverTimestamp() });
            }
            localStorage.setItem('hcfc_firestore_memberships_seeded', 'true');
          } catch (err) {
            console.warn('Could not seed memberships:', err);
          }
        }
        return;
      }
      const liveMemberships: MembershipApplication[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          referenceNumber: data.referenceNumber || 'HCFC-M1234',
          fullName: data.fullName || 'Supporter',
          dateOfBirth: data.dateOfBirth || '2000-01-01',
          gender: data.gender,
          phone: data.phone || '',
          email: data.email,
          cityOrRegion: data.cityOrRegion || 'Halaba',
          membershipType: data.membershipType || 'STANDARD',
          preferredLanguage: data.preferredLanguage || 'en',
          registeredAt: data.registeredAt || new Date().toISOString(),
          status: data.status || 'APPROVED',
          amountPaid: data.amountPaid,
          tx_ref: data.tx_ref,
          paymentStatus: data.paymentStatus,
          paymentDate: data.paymentDate,
          notes: data.notes,
        } as MembershipApplication;
      });
      if (liveMemberships.length > 0) {
        setMemberships(liveMemberships);
        localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(liveMemberships));
        localStorage.setItem('hcfc_firestore_memberships_seeded', 'true');
      }
    }, (error) => {
      console.error('Firebase real-time memberships error:', error);
      handleFirestoreError(error, OperationType.LIST, 'memberships');
    });
    return () => unsubscribe();
  }, []);

  const submitMembership = async (data: {
    fullName: string;
    dateOfBirth: string;
    gender?: string;
    phone: string;
    email?: string;
    cityOrRegion: string;
    membershipType: MembershipTier;
    preferredLanguage: Language;
    amountPaid?: number | string;
    tx_ref?: string;
  }): Promise<{ success: boolean; referenceNumber: string }> => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `HCFC-2026-M${randNum}`;
    const id = `mem-${Date.now()}`;

    const newApplication: MembershipApplication = {
      id,
      referenceNumber,
      fullName: data.fullName.trim(),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      cityOrRegion: data.cityOrRegion.trim(),
      membershipType: data.membershipType,
      preferredLanguage: data.preferredLanguage,
      registeredAt: new Date().toISOString(),
      status: 'APPROVED',
      amountPaid: data.amountPaid,
      tx_ref: data.tx_ref,
      paymentStatus: 'PAID',
      paymentDate: new Date().toISOString(),
    };

    await new Promise((resolve) => setTimeout(resolve, 400));

    const updated = [newApplication, ...memberships];
    setMemberships(updated);
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'memberships', id), {
        ...newApplication,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Firestore submit membership error:', error);
      handleFirestoreError(error, OperationType.CREATE, `memberships/${id}`);
    }

    return { success: true, referenceNumber };
  };

  const recordVerifiedMembership = async (data: {
    referenceNumber: string;
    fullName: string;
    dateOfBirth: string;
    gender?: string;
    phone: string;
    email?: string;
    cityOrRegion: string;
    membershipType: MembershipTier;
    preferredLanguage: Language;
    amountPaid: number | string;
    tx_ref: string;
  }): Promise<MembershipApplication> => {
    const id = `mem-${Date.now()}`;
    const newApplication: MembershipApplication = {
      id,
      referenceNumber: data.referenceNumber,
      fullName: data.fullName.trim(),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      cityOrRegion: data.cityOrRegion.trim(),
      membershipType: data.membershipType,
      preferredLanguage: data.preferredLanguage,
      registeredAt: new Date().toISOString(),
      status: 'APPROVED',
      amountPaid: data.amountPaid,
      tx_ref: data.tx_ref,
      paymentStatus: 'PAID',
      paymentDate: new Date().toISOString(),
    };

    const updated = [newApplication, ...memberships.filter((m) => m.referenceNumber !== data.referenceNumber && m.tx_ref !== data.tx_ref)];
    setMemberships(updated);
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'memberships', id), {
        ...newApplication,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Firestore record verified membership error:', error);
      handleFirestoreError(error, OperationType.CREATE, `memberships/${id}`);
    }

    return newApplication;
  };

  const updateMembershipStatus = async (id: string, status: 'APPROVED' | 'PENDING' | 'REJECTED') => {
    const updated = memberships.map((m) => (m.id === id ? { ...m, status } : m));
    setMemberships(updated);
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'memberships', id), {
        status,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Firestore update membership status error:', error);
      handleFirestoreError(error, OperationType.UPDATE, `memberships/${id}`);
    }
  };

  const deleteMembership = async (id: string) => {
    const updated = memberships.filter((m) => m.id !== id);
    setMemberships(updated);
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'memberships', id));
    } catch (error) {
      console.error('Firestore delete membership error:', error);
      handleFirestoreError(error, OperationType.DELETE, `memberships/${id}`);
    }
  };

  // Shop Items State & Real-Time Firebase Firestore Integration
  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => {
            const initialMatch = initialShopItems.find((i) => i.id === item.id);
            return {
              ...item,
              imageUrl: item.imageUrl || initialMatch?.imageUrl || ClubImages.jerseyHomeReal,
            };
          });
        }
      }
    } catch (e) {
      // ignore
    }
    return initialShopItems;
  });
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(false);
  const [productsSyncError, setProductsSyncError] = useState<string | null>(null);

  useEffect(() => {
    const productsRef = collection(db, 'products');

    const unsubscribe = onSnapshot(productsRef, async (snapshot) => {
      setIsProductsLoading(false);
      setProductsSyncError(null);

      if (snapshot.empty) {
        const hasSeeded = localStorage.getItem('hcfc_firestore_products_seeded');
        if (!hasSeeded) {
          try {
            for (const item of initialShopItems) {
              await setDoc(doc(db, 'products', item.id), {
                name: item.name,
                description: item.description,
                price: item.price,
                imageUrl: item.imageUrl,
                availableSizes: item.availableSizes,
                category: item.category || 'JERSEY',
                inStock: item.inStock !== undefined ? item.inStock : true,
                featured: item.featured !== undefined ? item.featured : false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
            localStorage.setItem('hcfc_firestore_products_seeded', 'true');
          } catch (seedErr) {
            console.warn('Could not auto-seed default products to Firestore:', seedErr);
          }
        } else {
          setShopItems(initialShopItems);
          localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(initialShopItems));
        }
        return;
      }

      const liveProducts: ShopItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const initialMatch = initialShopItems.find((i) => i.id === docSnap.id);
        const resolvedImage = initialMatch?.imageUrl || data.imageUrl || ClubImages.jerseyHomeReal;

        return {
          id: docSnap.id,
          name: typeof data.name === 'object' && data.name !== null
            ? { en: data.name.en || '', am: data.name.am || data.name.en || '', om: data.name.om || data.name.en || '' }
            : (initialMatch ? initialMatch.name : { en: String(data.name || ''), am: String(data.name || ''), om: String(data.name || '') }),
          description: typeof data.description === 'object' && data.description !== null
            ? { en: data.description.en || '', am: data.description.am || data.description.en || '', om: data.description.om || data.description.en || '' }
            : (initialMatch ? initialMatch.description : { en: String(data.description || ''), am: String(data.description || ''), om: String(data.description || '') }),
          price: typeof data.price === 'number' ? data.price : (initialMatch ? initialMatch.price : (parseFloat(data.price) || 0)),
          imageUrl: resolvedImage,
          availableSizes: Array.isArray(data.availableSizes) && data.availableSizes.length > 0 ? data.availableSizes : (initialMatch ? initialMatch.availableSizes : ['S', 'M', 'L', 'XL']),
          category: (data.category as 'JERSEY' | 'KIT' | 'ACCESSORY') || (initialMatch ? initialMatch.category : 'JERSEY'),
          inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
          featured: Boolean(data.featured) || (initialMatch ? initialMatch.featured : false),
        };
      });

      // Retain full 5 products catalog if any standard item is absent from cloud collection
      initialShopItems.forEach((initItem) => {
        if (!liveProducts.some((p) => p.id === initItem.id)) {
          liveProducts.push({ ...initItem });
        }
      });

      liveProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

      setShopItems(liveProducts);
      try {
        const cacheSafeProds = liveProducts.map((p) => ({
          ...p,
          imageUrl: p.imageUrl?.startsWith('data:') ? '' : p.imageUrl,
        }));
        localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(cacheSafeProds));
      } catch (e) {
        console.warn('Could not cache shop items in localStorage:', e);
      }
      localStorage.setItem('hcfc_firestore_products_seeded', 'true');
    }, (error) => {
      console.error('Firebase real-time products sync error:', error);
      setProductsSyncError(error.message);
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribe();
  }, []);

  const addShopItem = async (item: Omit<ShopItem, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        availableSizes: item.availableSizes,
        category: item.category || 'JERSEY',
        inStock: item.inStock !== undefined ? item.inStock : true,
        featured: Boolean(item.featured),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newItem: ShopItem = {
        ...item,
        id: docRef.id,
      };
      setShopItems((prev) => [newItem, ...prev.filter((p) => p.id !== docRef.id)]);
      localStorage.setItem('hcfc_firestore_products_seeded', 'true');
      return docRef.id;
    } catch (error) {
      console.error('Firestore add product error, falling back locally:', error);
      handleFirestoreError(error, OperationType.CREATE, 'products');
      const fallbackId = `shop-${Date.now()}`;
      const newItem: ShopItem = { ...item, id: fallbackId };
      const updated = [newItem, ...shopItems];
      setShopItems(updated);
      localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(updated));
      return fallbackId;
    }
  };

  const updateShopItem = async (id: string, updates: Partial<ShopItem>) => {
    try {
      const productRef = doc(db, 'products', id);
      await setDoc(productRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const updated = shopItems.map((item) => (item.id === id ? { ...item, ...updates } : item));
      setShopItems(updated);
      localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(updated));
    } catch (error) {
      console.error('Firestore update product error, falling back locally:', error);
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
      const updated = shopItems.map((item) => (item.id === id ? { ...item, ...updates } : item));
      setShopItems(updated);
      localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(updated));
    }
  };

  const deleteShopItem = async (id: string) => {
    try {
      const productRef = doc(db, 'products', id);
      await deleteDoc(productRef);

      const updated = shopItems.filter((item) => item.id !== id);
      setShopItems(updated);
      localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(updated));
    } catch (error) {
      console.error('Firestore delete product error, falling back locally:', error);
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      const updated = shopItems.filter((item) => item.id !== id);
      setShopItems(updated);
      localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(updated));
    }
  };

  const resetShopItems = async () => {
    try {
      for (const item of initialShopItems) {
        await setDoc(doc(db, 'products', item.id), {
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          availableSizes: item.availableSizes,
          category: item.category || 'JERSEY',
          inStock: item.inStock !== undefined ? item.inStock : true,
          featured: item.featured !== undefined ? item.featured : false,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      localStorage.setItem('hcfc_firestore_products_seeded', 'true');
    } catch (error) {
      console.error('Firestore reset products catalog error:', error);
    }
    setShopItems(initialShopItems);
    localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(initialShopItems));
  };

  // Shop Orders State
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOP_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const recordShopOrder = (order: ShopOrder) => {
    const updated = [order, ...shopOrders.filter((o) => o.orderNumber !== order.orderNumber && o.tx_ref !== order.tx_ref)];
    setShopOrders(updated);
    localStorage.setItem(STORAGE_KEYS.SHOP_ORDERS, JSON.stringify(updated));
  };

  const updateShopOrderStatus = (id: string, status: 'PENDING' | 'PAID' | 'DELIVERED') => {
    const updated = shopOrders.map((o) => (o.id === id || o.orderNumber === id ? { ...o, status } : o));
    setShopOrders(updated);
    localStorage.setItem(STORAGE_KEYS.SHOP_ORDERS, JSON.stringify(updated));
  };

  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<ShopItem | null>(null);

  const openCheckoutModal = (item: ShopItem) => {
    setCheckoutItem(item);
    setIsCheckoutModalOpen(true);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutItem(null);
  };

  // Supporter Donations State
  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DONATIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const recordDonation = (donation: DonationRecord) => {
    const updated = [donation, ...donations.filter((d) => d.donationNumber !== donation.donationNumber && d.tx_ref !== donation.tx_ref)];
    setDonations(updated);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(updated));
  };

  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const openDonationModal = () => setIsDonationModalOpen(true);
  const closeDonationModal = () => setIsDonationModalOpen(false);

  // Admin Auth using Firebase Authentication
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUser(user);
        setIsAdminLoggedIn(true);
        setAdminUsername(user.displayName || user.email || 'Admin');
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      } else {
        setAdminUser(null);
        setIsAdminLoggedIn(false);
        setAdminUsername(null);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = userCredential.user;
      setAdminUser(user);
      setIsAdminLoggedIn(true);
      setAdminUsername(user.displayName || user.email || 'Admin');
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      return { success: true };
    } catch (error: any) {
      console.error("Firebase signInWithEmailAndPassword error:", error);
      let errorMsg = 'Invalid email or password.';
      const code = error?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        errorMsg = 'Invalid email or password. Please verify your administrator credentials.';
      } else if (code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (code === 'auth/user-disabled') {
        errorMsg = 'This administrator account has been disabled.';
      } else if (code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Access temporarily restricted. Please try again later.';
      } else if (code === 'auth/network-request-failed') {
        errorMsg = 'Network error. Please check your internet connection.';
      } else if (error?.message) {
        errorMsg = error.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase signOut error:", error);
    } finally {
      setAdminUser(null);
      setIsAdminLoggedIn(false);
      setAdminUsername(null);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  };

  // Club Dossier Modal
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const openDossier = () => setIsDossierOpen(true);
  const closeDossier = () => setIsDossierOpen(false);

  // Live Notifications
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);
  const dismissNotification = (id: string) => {
    setLiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Live Auto-Sync & Simulation Engine
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [autoSyncInterval, setAutoSyncIntervalState] = useState(30);
  const [secondsUntilNextSync, setSecondsUntilNextSync] = useState(30);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(() => new Date());

  const toggleAutoSync = () => setIsAutoSyncEnabled((prev) => !prev);
  const setAutoSyncInterval = (interval: number) => {
    setAutoSyncIntervalState(interval);
    setSecondsUntilNextSync(interval);
  };

  const syncNow = async () => {
    setIsSyncing(true);
    let freshStandings: StandingTeam[] | null = null;
    let syncSource = 'TheSportsDB Official EPL Feed';

    try {
      // 1. Try backend endpoint
      try {
        const res = await fetch('/api/standings/sportsdb');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.standings) && json.standings.length > 0) {
            const canonicalMap = new Map<string, StandingTeam>();
            initialStandings.forEach((initT) => canonicalMap.set(initT.teamId, { ...initT }));

            json.standings.forEach((t: any) => {
              const canonicalId = normalizeEplTeamId(t.teamId, t.teamName);
              const isHalaba = canonicalId === 'halaba';
              const existing = canonicalMap.get(canonicalId);
              canonicalMap.set(canonicalId, {
                position: t.position || 1,
                teamId: canonicalId,
                teamName: canonicalId === 'cbe_sa'
                  ? 'Ethiopia Nigd Bank (CBE SA)'
                  : canonicalId === 'halaba'
                  ? 'Halaba Ketema (በርበሬዎቹ)'
                  : canonicalId === 'insurance'
                  ? 'Ethiopian Medhin (Insurance)'
                  : canonicalId === 'adama'
                  ? 'Adama Kenema SC'
                  : canonicalId === 'electric'
                  ? 'Ethio Electric'
                  : (t.teamName || existing?.teamName || 'Team'),
                played: Number(t.played) || existing?.played || 0,
                won: Number(t.won) || existing?.won || 0,
                drawn: Number(t.drawn) || existing?.drawn || 0,
                lost: Number(t.lost) || existing?.lost || 0,
                goalsFor: Number(t.goalsFor) || existing?.goalsFor || 0,
                goalsAgainst: Number(t.goalsAgainst) || existing?.goalsAgainst || 0,
                goalDifference: (Number(t.goalsFor) || 0) - (Number(t.goalsAgainst) || 0),
                points: Number(t.points) || existing?.points || 0,
                form: Array.isArray(t.form) && t.form.length > 0 ? t.form : (existing?.form || ['D', 'W', 'D']),
                isHalaba,
                badgeUrl: t.badgeUrl || existing?.badgeUrl,
              });
            });

            const list = Array.from(canonicalMap.values());
            list.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
            freshStandings = list.map((st, i) => ({ ...st, position: i + 1 }));
          }
        }
      } catch (err) {
        console.warn('Backend proxy fetch failed, trying direct SportsDB...', err);
      }

      // 2. Direct fetch fallback from TheSportsDB
      if (!freshStandings || freshStandings.length !== 16) {
        try {
          const directRes = await fetch('https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4959&s=2026-2027');
          if (directRes.ok) {
            const data = await directRes.json();
            const canonicalMap = new Map<string, StandingTeam>();

            initialStandings.forEach((initT) => canonicalMap.set(initT.teamId, { ...initT }));

            if (data?.table && Array.isArray(data.table) && data.table.length > 0) {
              data.table.forEach((item: any) => {
                const canonicalId = normalizeEplTeamId(item.idTeam, item.strTeam);
                const isHalaba = canonicalId === 'halaba';
                const formArr = (item.strForm || 'DWD').split('').filter((c: string) => ['W', 'D', 'L'].includes(c));
                const existing = canonicalMap.get(canonicalId);

                canonicalMap.set(canonicalId, {
                  position: parseInt(item.intRank, 10) || 1,
                  teamId: canonicalId,
                  teamName: canonicalId === 'cbe_sa'
                    ? 'Ethiopia Nigd Bank (CBE SA)'
                    : canonicalId === 'halaba'
                    ? 'Halaba Ketema (በርበሬዎቹ)'
                    : canonicalId === 'insurance'
                    ? 'Ethiopian Medhin (Insurance)'
                    : canonicalId === 'adama'
                    ? 'Adama Kenema SC'
                    : canonicalId === 'electric'
                    ? 'Ethio Electric'
                    : (item.strTeam || existing?.teamName || 'Team'),
                  played: parseInt(item.intPlayed, 10) || existing?.played || 0,
                  won: parseInt(item.intWin, 10) || existing?.won || 0,
                  drawn: parseInt(item.intDraw, 10) || existing?.drawn || 0,
                  lost: parseInt(item.intLoss, 10) || existing?.lost || 0,
                  goalsFor: parseInt(item.intGoalsFor, 10) || existing?.goalsFor || 0,
                  goalsAgainst: parseInt(item.intGoalsAgainst, 10) || existing?.goalsAgainst || 0,
                  goalDifference: parseInt(item.intGoalDifference, 10) || existing?.goalDifference || 0,
                  points: parseInt(item.intPoints, 10) || existing?.points || 0,
                  form: (formArr.length > 0 ? formArr : (existing?.form || ['D', 'W', 'D'])) as ('W' | 'D' | 'L')[],
                  isHalaba,
                  badgeUrl: item.strBadge ? item.strBadge.replace('/tiny', '') : existing?.badgeUrl,
                });
              });
            }

            const mergedList = Array.from(canonicalMap.values());
            mergedList.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
            freshStandings = mergedList.map((st, i) => ({ ...st, position: i + 1 }));
          }
        } catch (err) {
          console.warn('Direct SportsDB fetch failed:', err);
        }
      }

      if (!freshStandings || freshStandings.length !== 16) {
        freshStandings = initialStandings;
        syncSource = 'Official SportsDB Seed';
      }

      // Overwrite local standings
      setStandings(freshStandings);
      localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(freshStandings));

      // Overwrite Firestore collection so all devices receive the latest data
      try {
        for (const item of freshStandings) {
          await setDoc(doc(db, 'standings', item.teamId), {
            ...item,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      } catch (fsErr) {
        console.warn('Firestore write warning:', fsErr);
      }

      setLastSyncTime(new Date());
      setSecondsUntilNextSync(autoSyncInterval);

      const syncNotif: LiveNotification = {
        id: `sync-${Date.now()}`,
        type: 'sync',
        title: 'TheSportsDB Official Feed Synced',
        message: `Official Ethiopian Premier League table synchronized from ${syncSource}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setLiveNotifications((prev) => [syncNotif, ...prev.slice(0, 9)]);
    } catch (error: any) {
      console.error('Error in syncNow:', error);
    } finally {
      setIsSyncing(false);
    }
  };


  const simulateLiveMatchAction = () => {
    setMatches((prevMatches) => {
      let live = prevMatches.find((m) => m.status === 'LIVE');
      const updatedMatches = [...prevMatches];

      if (!live) {
        const upcomingIdx = updatedMatches.findIndex((m) => m.status === 'UPCOMING');
        if (upcomingIdx >= 0) {
          const m = updatedMatches[upcomingIdx];
          const newLiveMatch: Match = {
            ...m,
            status: 'LIVE',
            liveMinute: 54,
            livePeriod: '2H',
            score: { home: 1, away: 0 },
            scorers: [
              { player: 'Dawit Fekadu', minute: 34, team: 'home' }
            ],
            liveEvents: [
              { id: `evt-${Date.now()}-1`, minute: 34, text: 'GOAL! Dawit Fekadu scores with a curled effort into the top corner!', type: 'goal', team: 'home' },
              { id: `evt-${Date.now()}-2`, minute: 46, text: 'Second half underway under the roaring Halaba crowd.', type: 'whistle' }
            ]
          };
          updatedMatches[upcomingIdx] = newLiveMatch;
          live = newLiveMatch;

          const notif: LiveNotification = {
            id: `notif-${Date.now()}`,
            type: 'match_start',
            title: `🔴 LIVE NOW: ${m.homeTeam.name} vs ${m.awayTeam.name}`,
            message: 'Halaba Stadium lights up as second half action kicks off!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          };
          setLiveNotifications((prev) => [notif, ...prev.slice(0, 9)]);
        }
      } else {
        const liveIdx = updatedMatches.findIndex((m) => m.id === live!.id);
        const currentMin = live.liveMinute || 55;
        const nextMin = Math.min(90, currentMin + Math.floor(Math.random() * 8) + 4);
        const isHalabaGoal = Math.random() > 0.35;
        const currentScore = live.score || { home: 1, away: 0 };
        const newScore = {
          home: isHalabaGoal ? currentScore.home + 1 : currentScore.home,
          away: !isHalabaGoal ? currentScore.away + 1 : currentScore.away,
        };
        const scorerName = isHalabaGoal
          ? ['Dawit Fekadu', 'Mulugeta Wolde', 'Biniam Fikre', 'Yared Bayeh'][Math.floor(Math.random() * 4)]
          : 'Opponent Striker';

        const newEvents = [
          ...(live.liveEvents || []),
          {
            id: `evt-${Date.now()}`,
            minute: nextMin,
            text: `GOAL! (${nextMin}') - ${scorerName} scores for ${isHalabaGoal ? live.homeTeam.name : live.awayTeam.name}!`,
            type: 'goal' as const,
            team: (isHalabaGoal ? 'home' : 'away') as 'home' | 'away'
          }
        ];

        const updatedLiveMatch: Match = {
          ...live,
          liveMinute: nextMin,
          score: newScore,
          liveEvents: newEvents,
          status: nextMin >= 90 ? 'FINISHED' : 'LIVE',
          scorers: [
            ...(live.scorers || []),
            {
              player: scorerName,
              minute: nextMin,
              team: isHalabaGoal ? 'home' : 'away',
            }
          ]
        };

        updatedMatches[liveIdx] = updatedLiveMatch;

        const notif: LiveNotification = {
          id: `notif-${Date.now()}`,
          type: nextMin >= 90 ? 'match_end' : 'goal',
          title: nextMin >= 90 ? `🏁 FULL TIME: ${newScore.home} - ${newScore.away}` : `⚽ GOAL! (${nextMin}') ${scorerName}`,
          message: `${live.homeTeam.name} ${newScore.home} - ${newScore.away} ${live.awayTeam.name}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setLiveNotifications((prev) => [notif, ...prev.slice(0, 9)]);

      }

      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updatedMatches));
      return updatedMatches;
    });
  };

  const advanceLeagueMatchday = async () => {
    await syncNow();
  };

  useEffect(() => {
    if (!isAutoSyncEnabled) return;

    const timer = setInterval(() => {
      setSecondsUntilNextSync((prev) => {
        if (prev <= 1) {
          setLastSyncTime(new Date());
          return autoSyncInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoSyncEnabled, autoSyncInterval]);

  // Sponsors & Partner Posters State with Real-Time Firebase Firestore Integration
  const [sponsors, setSponsors] = useState<Sponsor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPONSORS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore
    }
    return initialSponsors;
  });

  const [isSponsorsLoading, setIsSponsorsLoading] = useState<boolean>(true);
  const [sponsorsSyncError, setSponsorsSyncError] = useState<string | null>(null);

  useEffect(() => {
    const sponsorsRef = collection(db, 'sponsors');
    const unsubscribe = onSnapshot(
      sponsorsRef,
      async (snapshot) => {
        setIsSponsorsLoading(false);
        setSponsorsSyncError(null);

        // If Firestore collection is empty, seed initial official sponsors so they persist in Firebase Cloud
        if (snapshot.empty) {
          console.info('[Firebase Firestore] Initializing sponsors collection in Cloud Firestore...');
          try {
            for (const initSponsor of initialSponsors) {
              await setDoc(doc(db, 'sponsors', initSponsor.id), {
                name: initSponsor.name,
                nameAm: initSponsor.nameAm || '',
                nameOm: initSponsor.nameOm || '',
                tier: initSponsor.tier,
                tierAm: initSponsor.tierAm || '',
                imageUrl: initSponsor.imageUrl,
                websiteUrl: initSponsor.websiteUrl || '',
                description: initSponsor.description || '',
                descriptionAm: initSponsor.descriptionAm || '',
                active: initSponsor.active,
                order: initSponsor.order,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          } catch (seedErr) {
            console.warn('[Firebase Firestore] Could not auto-seed sponsors:', seedErr);
          }
          return;
        }

        const liveSponsors: Sponsor[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          liveSponsors.push({
            id: docSnap.id,
            name: data.name || 'Sponsor',
            nameAm: data.nameAm || undefined,
            nameOm: data.nameOm || undefined,
            tier: data.tier || 'Official Partner',
            tierAm: data.tierAm || undefined,
            imageUrl: data.imageUrl || '',
            websiteUrl: data.websiteUrl || undefined,
            description: data.description || undefined,
            descriptionAm: data.descriptionAm || undefined,
            active: data.active !== undefined ? Boolean(data.active) : true,
            order: typeof data.order === 'number' ? data.order : 10,
          });
        });

        // Sort by order ascending
        liveSponsors.sort((a, b) => (a.order || 0) - (b.order || 0));

        setSponsors(liveSponsors);
        try {
          localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(liveSponsors));
        } catch (e) {
          console.warn('Could not cache sponsors in localStorage:', e);
        }
      },
      (error) => {
        console.error('Firebase real-time sponsors sync error:', error);
        setIsSponsorsLoading(false);
        setSponsorsSyncError(error.message);
        handleFirestoreError(error, OperationType.LIST, 'sponsors');
      }
    );

    return () => unsubscribe();
  }, []);

  const addSponsor = async (sponsorData: Omit<Sponsor, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'sponsors'), {
        name: sponsorData.name,
        nameAm: sponsorData.nameAm || '',
        nameOm: sponsorData.nameOm || '',
        tier: sponsorData.tier,
        tierAm: sponsorData.tierAm || '',
        imageUrl: sponsorData.imageUrl,
        websiteUrl: sponsorData.websiteUrl || '',
        description: sponsorData.description || '',
        descriptionAm: sponsorData.descriptionAm || '',
        active: sponsorData.active !== undefined ? sponsorData.active : true,
        order: sponsorData.order ?? (sponsors.length + 1),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newSponsor: Sponsor = {
        ...sponsorData,
        id: docRef.id,
        order: sponsorData.order ?? (sponsors.length + 1),
        active: sponsorData.active !== undefined ? sponsorData.active : true,
      };
      const updated = [...sponsors, newSponsor].sort((a, b) => (a.order || 0) - (b.order || 0));
      setSponsors(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not cache updated sponsors in localStorage:', e);
      }
      return docRef.id;
    } catch (error) {
      console.error('Firestore add sponsor error, falling back locally:', error);
      handleFirestoreError(error, OperationType.CREATE, 'sponsors');
      const fallbackId = `sponsor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newSponsor: Sponsor = {
        ...sponsorData,
        id: fallbackId,
        order: sponsorData.order ?? (sponsors.length + 1),
        active: sponsorData.active ?? true,
      };
      const updated = [...sponsors, newSponsor];
      setSponsors(updated);
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(updated));
      return fallbackId;
    }
  };

  const updateSponsor = async (id: string, updates: Partial<Sponsor>): Promise<void> => {
    try {
      const sponsorRef = doc(db, 'sponsors', id);
      await setDoc(sponsorRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const updated = sponsors.map((s) => (s.id === id ? { ...s, ...updates } : s));
      setSponsors(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not cache updated sponsors in localStorage:', e);
      }
    } catch (error) {
      console.error('Firestore update sponsor error, falling back locally:', error);
      handleFirestoreError(error, OperationType.UPDATE, `sponsors/${id}`);
      const updated = sponsors.map((s) => (s.id === id ? { ...s, ...updates } : s));
      setSponsors(updated);
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(updated));
    }
  };

  const deleteSponsor = async (id: string): Promise<void> => {
    try {
      const sponsorRef = doc(db, 'sponsors', id);
      await deleteDoc(sponsorRef);

      const updated = sponsors.filter((s) => s.id !== id);
      setSponsors(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not cache sponsors after deletion:', e);
      }
    } catch (error) {
      console.error('Firestore delete sponsor error, falling back locally:', error);
      handleFirestoreError(error, OperationType.DELETE, `sponsors/${id}`);
      const updated = sponsors.filter((s) => s.id !== id);
      setSponsors(updated);
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(updated));
    }
  };

  const resetSponsors = async (): Promise<void> => {
    try {
      for (const initS of initialSponsors) {
        await setDoc(doc(db, 'sponsors', initS.id), {
          name: initS.name,
          nameAm: initS.nameAm || '',
          nameOm: initS.nameOm || '',
          tier: initS.tier,
          tierAm: initS.tierAm || '',
          imageUrl: initS.imageUrl,
          websiteUrl: initS.websiteUrl || '',
          description: initS.description || '',
          descriptionAm: initS.descriptionAm || '',
          active: initS.active,
          order: initS.order,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      setSponsors(initialSponsors);
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(initialSponsors));
    } catch (error) {
      console.error('Firestore reset sponsors error, falling back locally:', error);
      handleFirestoreError(error, OperationType.WRITE, 'sponsors');
      setSponsors(initialSponsors);
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(initialSponsors));
    }
  };

  const resetAllDataToDefault = () => {
    localStorage.clear();
    setMatches(initialMatches);
    setStandings(initialStandings);
    setNews(initialNews);
    setPlayers(initialPlayers);
    setStaff(initialStaff);
    setMemberships(initialMemberships);
    setShopItems(initialShopItems);
    setShopOrders([]);
    setDonations([]);
    setClubInfo(initialClubInfo);
    setSponsors(initialSponsors);
    setIsAdminLoggedIn(false);
  };

  return (
    <ClubContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentPage,
        setCurrentPage,
        selectedArticleId,
        setSelectedArticleId,
        selectedMatchId,
        setSelectedMatchId,
        isDossierOpen,
        openDossier,
        closeDossier,
        liveNotifications,
        dismissNotification,
        isAutoSyncEnabled,
        toggleAutoSync,
        autoSyncInterval,
        setAutoSyncInterval,
        secondsUntilNextSync,
        isSyncing,
        lastSyncTime,
        syncNow,
        simulateLiveMatchAction,
        advanceLeagueMatchday,
        clubInfo,
        updateClubInfo,
        matches,
        addMatch,
        updateMatch,
        deleteMatch,
        standings,
        updateStanding,
        resetStandings,
        recalculateStandingsFromMatches,
        news,
        addNewsArticle,
        updateNewsArticle,
        deleteNewsArticle,
        players,
        staff,
        addPlayer,
        updatePlayer,
        deletePlayer,
        addStaff,
        updateStaff,
        deleteStaff,
        memberships,
        submitMembership,
        recordVerifiedMembership,
        updateMembershipStatus,
        deleteMembership,
        shopItems,
        addShopItem,
        updateShopItem,
        deleteShopItem,
        resetShopItems,
        isProductsLoading,
        productsSyncError,
        shopOrders,
        recordShopOrder,
        updateShopOrderStatus,
        isCheckoutModalOpen,
        checkoutItem,
        openCheckoutModal,
        closeCheckoutModal,
        donations,
        recordDonation,
        isDonationModalOpen,
        openDonationModal,
        closeDonationModal,
        isAdminLoggedIn,
        adminUsername,
        adminUser,
        isAuthChecking,
        loginAdmin,
        logoutAdmin,
        sponsors,
        addSponsor,
        updateSponsor,
        deleteSponsor,
        resetSponsors,
        isSponsorsLoading,
        sponsorsSyncError,
        isOnline,
        resetAllDataToDefault,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
