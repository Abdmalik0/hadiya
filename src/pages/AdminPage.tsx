import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { HalabaCrest } from '../components/HalabaCrest';
import { ClubImages } from '../assets/images';
import {
  Match,
  NewsArticle,
  Player,
  StaffMember,
  StandingTeam,
  NewsCategory,
  Competition,
  ShopItem,
} from '../types';
import {
  Lock,
  LogOut,
  Users,
  Newspaper,
  Calendar,
  Trophy,
  Settings,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Download,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Database,
  Zap,
  Radio,
  Clock,
  Play,
  Pause,
  Upload,
  Link,
  Image as ImageIcon,
  ShoppingBag,
  Heart,
  Package,
  Truck,
  Sparkles,
  Loader2,
  ShieldCheck,
  Mail,
  Calculator,
  Minus,
  Award,
} from 'lucide-react';
import { SponsorManager } from '../components/admin/SponsorManager';

export const AdminPage: React.FC = () => {
  const {
    t,
    language,
    isAdminLoggedIn,
    adminUsername,
    adminUser,
    isAuthChecking,
    loginAdmin,
    logoutAdmin,
    setCurrentPage,
    memberships,
    updateMembershipStatus,
    deleteMembership,
    news,
    addNewsArticle,
    updateNewsArticle,
    deleteNewsArticle,
    matches,
    addMatch,
    updateMatch,
    deleteMatch,
    standings,
    updateStanding,
    resetStandings,
    recalculateStandingsFromMatches,
    players,
    staff,
    addPlayer,
    updatePlayer,
    deletePlayer,
    clubInfo,
    updateClubInfo,
    resetAllDataToDefault,
    shopItems,
    addShopItem,
    updateShopItem,
    deleteShopItem,
    resetShopItems,
    shopOrders,
    updateShopOrderStatus,
    donations,
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
    liveNotifications,
    sponsors,
  } = useClub();

  // Strict Firebase Admin Login form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Active admin tab
  const [adminTab, setAdminTab] = useState<
    'memberships' | 'shop' | 'news' | 'fixtures' | 'standings' | 'squad' | 'sponsors' | 'sync' | 'settings'
  >('memberships');

  // Shop admin sub-tab & modal states
  const [shopSubTab, setShopSubTab] = useState<'items' | 'orders' | 'donations'>('items');
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [editingShopItemId, setEditingShopItemId] = useState<string | null>(null);
  const [shopNameEn, setShopNameEn] = useState('');
  const [shopNameAm, setShopNameAm] = useState('');
  const [shopNameOm, setShopNameOm] = useState('');
  const [shopDescEn, setShopDescEn] = useState('');
  const [shopDescAm, setShopDescAm] = useState('');
  const [shopDescOm, setShopDescOm] = useState('');
  const [shopPrice, setShopPrice] = useState<number | string>(1800);
  const [shopImageUrl, setShopImageUrl] = useState('');
  const [shopSizes, setShopSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [shopCategory, setShopCategory] = useState<'JERSEY' | 'KIT' | 'ACCESSORY' | 'ACCESSORIES' | 'MEMORABILIA'>('JERSEY');
  const [shopInStock, setShopInStock] = useState(true);
  const [shopFeatured, setShopFeatured] = useState(false);
  const [shopUploadError, setShopUploadError] = useState<string | null>(null);
  const [isShopUploading, setIsShopUploading] = useState(false);
  const [isSavingShopToFirestore, setIsSavingShopToFirestore] = useState(false);
  const [deletingShopId, setDeletingShopId] = useState<string | null>(null);
  const [shopStatusToast, setShopStatusToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Standings Team Editing Modal State
  const [editingStandingTeam, setEditingStandingTeam] = useState<StandingTeam | null>(null);
  const [standingFormData, setStandingFormData] = useState({
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  });

  const openEditStanding = (team: StandingTeam) => {
    setEditingStandingTeam(team);
    setStandingFormData({
      played: team.played,
      won: team.won,
      drawn: team.drawn,
      lost: team.lost,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      points: team.points,
    });
  };

  const handleSaveStanding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStandingTeam) return;
    await updateStanding(editingStandingTeam.teamId, {
      played: Math.max(0, Number(standingFormData.played)),
      won: Math.max(0, Number(standingFormData.won)),
      drawn: Math.max(0, Number(standingFormData.drawn)),
      lost: Math.max(0, Number(standingFormData.lost)),
      goalsFor: Math.max(0, Number(standingFormData.goalsFor)),
      goalsAgainst: Math.max(0, Number(standingFormData.goalsAgainst)),
      points: Math.max(0, Number(standingFormData.points)),
    });
    setEditingStandingTeam(null);
  };

  // Compress & resize uploaded image to prevent exceeding browser storage quotas
  const processImageFileToDataUrl = (file: File, maxDim = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(readerEvent.target?.result as string);
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleShopImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setShopUploadError('File size exceeds 15MB limit. Please select a smaller photo file.');
        return;
      }
      setShopUploadError(null);
      setIsShopUploading(true);
      try {
        const dataUrl = await processImageFileToDataUrl(file);
        setShopImageUrl(dataUrl);
      } catch {
        setShopUploadError('Failed to read image file. Please try another image.');
      } finally {
        setIsShopUploading(false);
      }
    }
  };

  const handleShopImageDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setShopUploadError('File size exceeds 15MB limit. Please select a smaller photo file.');
        return;
      }
      setShopUploadError(null);
      setIsShopUploading(true);
      try {
        const dataUrl = await processImageFileToDataUrl(file);
        setShopImageUrl(dataUrl);
      } catch {
        setShopUploadError('Failed to read image file. Please try another image.');
      } finally {
        setIsShopUploading(false);
      }
    }
  };

  // Search & filter states
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  // News Modal state
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [newsTitleEn, setNewsTitleEn] = useState('');
  const [newsTitleAm, setNewsTitleAm] = useState('');
  const [newsTitleOm, setNewsTitleOm] = useState('');
  const [newsSummaryEn, setNewsSummaryEn] = useState('');
  const [newsSummaryAm, setNewsSummaryAm] = useState('');
  const [newsSummaryOm, setNewsSummaryOm] = useState('');
  const [newsContentEn, setNewsContentEn] = useState('');
  const [newsCategory, setNewsCategory] = useState<NewsCategory>('CLUB_NEWS');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [imageSourceMode, setImageSourceMode] = useState<'url' | 'upload'>('url');
  const [newsUploadError, setNewsUploadError] = useState<string | null>(null);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNewsUploadError('File size exceeds 5MB limit. Please select a smaller photo file.');
        return;
      }
      setNewsUploadError(null);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setNewsImageUrl(loadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Match Modal state
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('15:00');
  const [matchVenue, setMatchVenue] = useState('Halaba Stadium, Halaba Kulito');
  const [matchHomeTeam, setMatchHomeTeam] = useState('HALABA City FC');
  const [matchAwayTeam, setMatchAwayTeam] = useState('');
  const [matchComp, setMatchComp] = useState<Competition>('ETHIOPIAN_HIGHER_LEAGUE');
  const [matchStatus, setMatchStatus] = useState<'UPCOMING' | 'LIVE' | 'FINISHED'>('UPCOMING');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Player state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState(10);
  const [newPlayerPos, setNewPlayerPos] = useState<'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'>('Midfielder');

  // Firebase Authentication Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!emailInput.trim() || !passwordInput) {
      setLoginError('Please enter both your administrator email and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await loginAdmin(emailInput.trim(), passwordInput);
      if (!res.success) {
        setLoginError(res.error || 'Invalid email or password.');
      } else {
        setLoginError(null);
        setPasswordInput('');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Prominent Firebase SignOut Handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAdmin();
      setEmailInput('');
      setPasswordInput('');
      setLoginError(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Reference', 'FullName', 'DOB', 'Gender', 'Phone', 'Email', 'CityRegion', 'Tier', 'Status', 'RegisteredAt'];
    const rows = memberships.map((m) => [
      m.referenceNumber,
      `"${m.fullName}"`,
      m.dateOfBirth,
      m.gender || '',
      m.phone,
      m.email || '',
      `"${m.cityOrRegion}"`,
      m.membershipType,
      m.status,
      m.registeredAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `halaba_fc_memberships_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save News Article (Connected to Firebase Cloud)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitleEn.trim()) return;

    try {
      if (editingArticleId) {
        await updateNewsArticle(editingArticleId, {
          title: { en: newsTitleEn, am: newsTitleAm || newsTitleEn, om: newsTitleOm || newsTitleEn },
          summary: { en: newsSummaryEn, am: newsSummaryAm || newsSummaryEn, om: newsSummaryOm || newsSummaryEn },
          content: { en: newsContentEn, am: newsContentEn, om: newsContentEn },
          category: newsCategory,
          imageUrl: newsImageUrl || ClubImages.newsCoachInterview,
        });
      } else {
        await addNewsArticle({
          title: { en: newsTitleEn, am: newsTitleAm || newsTitleEn, om: newsTitleOm || newsTitleEn },
          summary: { en: newsSummaryEn, am: newsSummaryAm || newsSummaryEn, om: newsSummaryOm || newsSummaryEn },
          content: { en: newsContentEn, am: newsContentEn, om: newsContentEn },
          category: newsCategory,
          date: new Date().toISOString().slice(0, 10),
          author: 'Club Administration',
          imageUrl: newsImageUrl || ClubImages.newsCoachInterview,
          readTime: '3 min read',
        });
      }

      // Reset modal state
      setIsNewsModalOpen(false);
      setEditingArticleId(null);
      setNewsTitleEn('');
      setNewsTitleAm('');
      setNewsTitleOm('');
      setNewsSummaryEn('');
      setNewsSummaryAm('');
      setNewsSummaryOm('');
      setNewsContentEn('');
      setNewsImageUrl('');
    } catch (error) {
      console.error("Error saving article: ", error);
    }
  };
  // Save Match
  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchAwayTeam.trim() || !matchDate) return;

    const isHome = matchHomeTeam.toLowerCase().includes('halaba');

    if (editingMatchId) {
      const matchUpdates: Partial<Match> = {
        date: matchDate,
        kickoffTime: matchTime,
        venue: matchVenue,
        status: matchStatus,
        homeTeam: {
          id: isHome ? 'halaba' : 'opponent',
          name: matchHomeTeam,
          isHalaba: isHome,
        },
        awayTeam: {
          id: !isHome ? 'halaba' : 'opponent',
          name: matchAwayTeam,
          isHalaba: !isHome,
        },
        competition: matchComp,
        competitionName: matchComp.replace(/_/g, ' '),
      };
      if (matchStatus === 'FINISHED' || matchStatus === 'LIVE') {
        matchUpdates.score = { home: Number(homeScore), away: Number(awayScore) };
      }
      updateMatch(editingMatchId, matchUpdates);
    } else {
      addMatch({
        competition: matchComp,
        competitionName: matchComp.replace(/_/g, ' '),
        date: matchDate,
        kickoffTime: matchTime,
        venue: matchVenue,
        homeTeam: {
          id: isHome ? 'halaba' : 'opponent',
          name: matchHomeTeam,
          isHalaba: isHome,
        },
        awayTeam: {
          id: !isHome ? 'halaba' : 'opponent',
          name: matchAwayTeam,
          isHalaba: !isHome,
        },
        status: matchStatus,
        score: matchStatus === 'FINISHED' || matchStatus === 'LIVE' ? { home: Number(homeScore), away: Number(awayScore) } : undefined,
        round: 'Official League Match',
      });
    }

    setIsMatchModalOpen(false);
    setEditingMatchId(null);
  };

  // Add Player
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addPlayer({
      name: newPlayerName.trim(),
      number: Number(newPlayerNumber),
      position: newPlayerPos,
      nationality: 'Ethiopian',
      birthYear: 2002,
      appearances: 0,
      goals: 0,
    });
    setNewPlayerName('');
    setNewPlayerNumber(newPlayerNumber + 1);
  };

  // Shop Item Handlers
  const handleOpenAddShopItem = () => {
    setEditingShopItemId(null);
    setShopNameEn('');
    setShopNameAm('');
    setShopNameOm('');
    setShopDescEn('');
    setShopDescAm('');
    setShopDescOm('');
    setShopPrice(1800);
    setShopImageUrl('https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=800&q=80');
    setShopSizes(['S', 'M', 'L', 'XL']);
    setShopCategory('JERSEY');
    setShopInStock(true);
    setShopFeatured(false);
    setShopUploadError(null);
    setIsShopUploading(false);
    setIsShopModalOpen(true);
  };

  const handleOpenEditShopItem = (item: ShopItem) => {
    setEditingShopItemId(item.id);
    const nEn = typeof item.name === 'object' ? item.name.en : item.name;
    const nAm = typeof item.name === 'object' ? item.name.am : item.name;
    const nOm = typeof item.name === 'object' ? item.name.om : item.name;
    const dEn = typeof item.description === 'object' ? item.description.en : item.description;
    const dAm = typeof item.description === 'object' ? item.description.am : item.description;
    const dOm = typeof item.description === 'object' ? item.description.om : item.description;

    setShopNameEn(nEn);
    setShopNameAm(nAm);
    setShopNameOm(nOm);
    setShopDescEn(dEn);
    setShopDescAm(dAm);
    setShopDescOm(dOm);
    setShopPrice(item.price);
    setShopImageUrl(item.imageUrl);
    setShopSizes(item.availableSizes || ['M', 'L']);
    setShopCategory(item.category || 'JERSEY');
    setShopInStock(item.inStock !== false);
    setShopFeatured(Boolean(item.featured));
    setShopUploadError(null);
    setIsShopUploading(false);
    setIsShopModalOpen(true);
  };

  const handleSaveShopItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopNameEn.trim()) return;

    setIsSavingShopToFirestore(true);
    setShopUploadError(null);

    const payload = {
      name: {
        en: shopNameEn.trim(),
        am: shopNameAm.trim() || shopNameEn.trim(),
        om: shopNameOm.trim() || shopNameEn.trim(),
      },
      description: {
        en: shopDescEn.trim(),
        am: shopDescAm.trim() || shopDescEn.trim(),
        om: shopDescOm.trim() || shopDescEn.trim(),
      },
      price: Number(shopPrice) || 1000,
      imageUrl: shopImageUrl.trim() || 'https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=800&q=80',
      availableSizes: shopSizes.length > 0 ? shopSizes : ['S', 'M', 'L', 'XL'],
      category: shopCategory,
      inStock: shopInStock,
      featured: shopFeatured,
    };

    try {
      if (editingShopItemId) {
        await updateShopItem(editingShopItemId, payload);
        setShopStatusToast({
          message: `Product "${payload.name.en}" successfully updated in Firebase Firestore!`,
          type: 'success',
        });
      } else {
        await addShopItem(payload);
        setShopStatusToast({
          message: `"${payload.name.en}" published to Firebase Firestore and is live on the store!`,
          type: 'success',
        });
      }
      setTimeout(() => setShopStatusToast(null), 4500);
      setIsShopModalOpen(false);
      setEditingShopItemId(null);
    } catch (err: any) {
      console.error("Firestore shop error:", err);
      setShopUploadError(err?.message || "Failed to persist product to Firebase Firestore.");
    } finally {
      setIsSavingShopToFirestore(false);
    }
  };

  const handleDeleteShopItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from Firebase Firestore?`)) {
      return;
    }
    setDeletingShopId(id);
    try {
      await deleteShopItem(id);
      setShopStatusToast({
        message: `Product "${name}" was permanently removed from Firebase Firestore.`,
        type: 'success',
      });
      setTimeout(() => setShopStatusToast(null), 4000);
    } catch (err: any) {
      setShopStatusToast({
        message: err?.message || 'Failed to delete product from Firestore.',
        type: 'error',
      });
    } finally {
      setDeletingShopId(null);
    }
  };

  const handleResetCatalog = async () => {
    if (!window.confirm("This will synchronize and restore all official Halaba jerseys and merchandise in Firebase Firestore. Continue?")) {
      return;
    }
    try {
      await resetShopItems();
      setShopStatusToast({
        message: 'Official Halaba merchandise catalog restored and synced in Firebase Firestore.',
        type: 'success',
      });
      setTimeout(() => setShopStatusToast(null), 4500);
    } catch (err: any) {
      setShopStatusToast({
        message: err?.message || 'Failed to restore default catalog.',
        type: 'error',
      });
    }
  };

  const handleToggleShopSize = (size: string) => {
    if (shopSizes.includes(size)) {
      if (shopSizes.length > 1) {
        setShopSizes(shopSizes.filter((s) => s !== size));
      }
    } else {
      setShopSizes([...shopSizes, size]);
    }
  };

  /* SESSION VERIFICATION LOADING SCREEN */
  if (isAuthChecking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <HalabaCrest size={72} showGlow />
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-sports font-bold text-xs uppercase tracking-widest">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Verifying Firebase Authentication Session...</span>
        </div>
      </div>
    );
  }

  /* STRICT LOGIN-ONLY GATE USING FIREBASE AUTHENTICATION */
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="flex justify-center">
            <HalabaCrest size={72} showGlow />
          </div>

          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 text-xxs font-bold uppercase tracking-wider mb-1">
              <Lock className="w-3 h-3" />
              <span>{language === 'am' ? 'ይፋዊ የአስተዳዳሪ ፖርታል' : 'Official Administrator Portal'}</span>
            </div>
            <h1 className="font-sports font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
              {language === 'am' ? 'የአስተዳዳሪ መግቢያ' : 'Admin Sign In'}
            </h1>
            <p className="text-neutral-400 text-xs">
              {language === 'am'
                ? 'ለተፈቀደላቸው የሀላባ ከተማ እግር ኳስ ክለብ አመራሮች ብቻ የተፈቀደ።'
                : 'Authorized HALABA City FC management and club IT personnel only.'}
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                {language === 'am' ? 'የአስተዳዳሪ ኢሜይል *' : 'Admin Email *'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value.trim())}
                  placeholder="admin@halabafc.et"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-sm text-white focus:outline-none focus:border-red-500 placeholder-neutral-600 transition-colors"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                {language === 'am' ? 'የይለፍ ቃል *' : 'Password *'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-sm text-white focus:outline-none focus:border-red-500 placeholder-neutral-600 transition-colors"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm uppercase tracking-wider font-sports shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              style={{
                backgroundColor: '#dc2626',
                backgroundImage: 'linear-gradient(to right, #dc2626, #ef4444)',
                color: '#ffffff',
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'am' ? 'በፈርቤዝ በመግባት ላይ...' : 'Signing In with Firebase...'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{language === 'am' ? 'ወደ ዳሽቦርድ ግባ' : 'Sign In to Dashboard'}</span>
                </>
              )}
            </button>
          </form>

          {/* Strict Security Policy: Login-Only Workflow */}
          <div className="pt-4 border-t border-neutral-800/80 space-y-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-neutral-400 text-xxs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'am' ? 'በፈርቤዝ የተጠበቀ • አስተዳዳሪ ብቻ' : 'Firebase Auth Protected • Login-Only Workflow'}</span>
            </div>
            <p className="text-neutral-500 text-xxs">
              {language === 'am'
                ? 'የይለፍ ቃል ለመቀየር ወይም አዲስ መለያ ለማግኘት የክለቡን አስተዳደር ያነጋግሩ።'
                : 'Self-service registration and password reset are strictly disabled. Contact club administration for access credentials.'}
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="text-neutral-400 hover:text-white text-xs underline underline-offset-4 pt-1 transition-colors cursor-pointer"
            >
              {language === 'am' ? 'ወደ ክለቡ ድረ-ገጽ ተመለስ' : 'Return to Public Club Website'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* LOGGED IN DASHBOARD */
  const filteredMemberships = memberships.filter((m) => {
    if (memberStatusFilter !== 'ALL' && m.status !== memberStatusFilter) return false;
    if (memberSearch.trim() !== '') {
      const q = memberSearch.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.referenceNumber.toLowerCase().includes(q) ||
        m.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Admin Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <HalabaCrest size={48} />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xxs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firebase Authenticated Session
              </span>
              <span className="text-xs font-sports font-semibold text-neutral-300">
                {adminUser?.email || adminUsername}
              </span>
            </div>
            <h1 className="font-sports font-black text-2xl sm:text-4xl text-white uppercase tracking-wider">
              {t.adminTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider font-sports transition-colors cursor-pointer"
          >
            {language === 'am' ? 'የክለቡ ድረ-ገጽ' : 'Club Website'}
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 hover:text-white text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            title={language === 'am' ? 'ከአስተዳዳሪ ውጣ' : 'Sign out of Firebase Admin'}
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
            ) : (
              <LogOut className="w-4 h-4 text-red-400" />
            )}
            <span>{language === 'am' ? 'ውጣ' : 'Log Out'}</span>
          </button>
        </div>
      </div>

      {/* Firebase Cloud Live Notice Banner */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="block text-white font-sports font-bold tracking-wide uppercase">
            {language === 'am'
              ? 'የፈርቤዝ ማረጋገጫ እና ቋሚ የክላውድ ዳታቤዝ ነቅቷል'
              : 'Firebase Authentication & Firestore Persistent Storage Active'}
          </strong>
          <span className="text-neutral-400">
            {language === 'am'
              ? 'በሱቁ፣ በዜናዎች እና በጨዋታዎች ላይ የሚደረጉ ለውጦች በሙሉ በቀጥታ በፈርቤዝ ይቀመጣሉ።'
              : 'All additions, updates, and removals of shop merchandise, news, and club schedules persist permanently in Firebase Cloud and synchronize in real-time.'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-bold uppercase block">
            {language === 'am' ? 'የተመዘገቡ አባላት' : 'Registered Members'}
          </span>
          <span className="font-sports font-black text-3xl text-emerald-400 mt-1 block">
            {memberships.length}
          </span>
          <span className="text-xxs text-neutral-500">
            {language === 'am' ? 'የደጋፊዎች ምዝገባዎች' : 'Live fan registrations'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-bold uppercase block">
            {language === 'am' ? 'የዜና መጣጥፎች' : 'News Articles'}
          </span>
          <span className="font-sports font-black text-3xl text-white mt-1 block">
            {news.length}
          </span>
          <span className="text-xxs text-neutral-500">
            {language === 'am' ? 'የታተሙ ዜናዎች' : 'Published stories'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-bold uppercase block">
            {language === 'am' ? 'የተያዙ ጨዋታዎች' : 'Matches Scheduled'}
          </span>
          <span className="font-sports font-black text-3xl text-amber-400 mt-1 block">
            {matches.length}
          </span>
          <span className="text-xxs text-neutral-500">
            {language === 'am' ? 'የተደረጉና የሚደረጉ' : 'Fixtures & completed'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-bold uppercase block">
            {language === 'am' ? 'የተጫዋቾች ስብስብ' : 'Squad Roster'}
          </span>
          <span className="font-sports font-black text-3xl text-red-400 mt-1 block">
            {players.length}
          </span>
          <span className="text-xxs text-neutral-500">
            {language === 'am' ? 'የዋናው ቡድን ተጫዋቾች' : 'First team players'}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setAdminTab('memberships')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all cursor-pointer ${
            adminTab === 'memberships'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.adminTabMembers} ({memberships.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('shop')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all cursor-pointer ${
            adminTab === 'shop'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>{language === 'am' ? 'የማሊያ ሱቅና ልገሳ' : 'Jersey Shop & Donations'} ({shopItems.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('news')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all ${
            adminTab === 'news'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>{t.adminTabNews} ({news.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('fixtures')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all ${
            adminTab === 'fixtures'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.adminTabFixtures}</span>
        </button>

        <button
          onClick={() => setAdminTab('standings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all ${
            adminTab === 'standings'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{t.adminTabStandings}</span>
        </button>

        <button
          onClick={() => setAdminTab('squad')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all ${
            adminTab === 'squad'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.adminTabSquad}</span>
        </button>

        <button
          onClick={() => setAdminTab('sponsors')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all cursor-pointer ${
            adminTab === 'sponsors'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>{language === 'am' ? 'ስፖንሰሮችና ፖስተሮች' : 'Sponsors & Posters'} ({sponsors.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('sync')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all ${
            adminTab === 'sync'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Auto-Update Engine</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all ${
            adminTab === 'settings'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t.adminTabSettings}</span>
        </button>
      </div>

      {/* TAB CONTENT 1: MEMBERSHIPS */}
      {adminTab === 'memberships' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
                Official Membership Applications
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Verify supporter registrations, change statuses, and export database records.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-2 self-start sm:self-auto transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportCsv}</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name, ref, phone..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setMemberStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sports transition-all ${
                    memberStatusFilter === st
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-neutral-800 uppercase text-neutral-400 font-sports tracking-wider">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Region</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredMemberships.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {m.referenceNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">{m.fullName}</td>
                    <td className="py-3 px-3 text-neutral-300 font-mono">{m.phone}</td>
                    <td className="py-3 px-3 text-neutral-400">{m.cityOrRegion}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-xxs font-bold uppercase bg-neutral-950 text-neutral-200 border border-neutral-800">
                        {m.membershipType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                      {m.amountPaid ? `${m.amountPaid} ETB` : m.membershipType === 'PREMIUM' ? '1000 ETB' : m.membershipType === 'STANDARD' ? '500 ETB' : '200 ETB'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                          m.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : m.status === 'PENDING'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {m.status !== 'APPROVED' && (
                        <button
                          onClick={() => updateMembershipStatus(m.id, 'APPROVED')}
                          className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-xxs font-bold uppercase"
                        >
                          Approve
                        </button>
                      )}
                      {m.status !== 'REJECTED' && (
                        <button
                          onClick={() => updateMembershipStatus(m.id, 'REJECTED')}
                          className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 text-xxs font-bold uppercase"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => deleteMembership(m.id)}
                        className="p-1 rounded text-neutral-500 hover:text-red-400 transition-colors"
                        title="Delete application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: JERSEY SHOP & DONATIONS MANAGEMENT */}
      {adminTab === 'shop' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950 border border-red-800/60 text-red-400 text-xxs font-bold uppercase tracking-wider">
                  <ShoppingBag className="w-3 h-3" />
                  Store & Fund Administration
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xxs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Firestore Persistent Cloud Sync</span>
                </div>
              </div>
              <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
                Jersey Shop & Supporter Contributions
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                All shop items, edits, and deletions persist directly in Firebase Firestore and synchronize in real-time for any site visitor.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleResetCatalog}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-sports font-bold uppercase tracking-wider transition-colors"
                title="Restore and sync official default club products to Firebase Firestore"
              >
                Sync Official Catalog
              </button>
              <button
                onClick={handleOpenAddShopItem}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-1.5 shadow-lg shadow-red-950/50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Real-time Status Notification Toast */}
          {shopStatusToast && (
            <div
              className={`p-3 rounded-xl border text-xs font-sports font-bold flex items-center gap-2.5 transition-all ${
                shopStatusToast.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/70 border-red-500/40 text-red-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{shopStatusToast.message}</span>
            </div>
          )}

          {/* Subtabs for Shop: Items, Orders, Donations */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShopSubTab('items')}
              className={`px-4 py-1.5 rounded-lg text-xs font-sports font-bold uppercase tracking-wider transition-all ${
                shopSubTab === 'items'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Merchandise Products ({shopItems.length})
            </button>
            <button
              onClick={() => setShopSubTab('orders')}
              className={`px-4 py-1.5 rounded-lg text-xs font-sports font-bold uppercase tracking-wider transition-all ${
                shopSubTab === 'orders'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Customer Delivery Orders ({shopOrders.length})
            </button>
            <button
              onClick={() => setShopSubTab('donations')}
              className={`px-4 py-1.5 rounded-lg text-xs font-sports font-bold uppercase tracking-wider transition-all ${
                shopSubTab === 'donations'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Supporter Donations ({donations.length})
            </button>
          </div>

          {/* SUBTAB 1: PRODUCTS LIST */}
          {shopSubTab === 'items' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.map((item) => {
                  const name = typeof item.name === 'object' ? item.name.en : item.name;
                  const desc = typeof item.description === 'object' ? item.description.en : item.description;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.imageUrl}
                          alt={name}
                          className="w-20 h-20 object-cover rounded-xl bg-neutral-900 border border-neutral-800 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xxs px-2 py-0.5 rounded bg-neutral-900 text-amber-400 font-sports font-bold uppercase">
                              {item.category || 'JERSEY'}
                            </span>
                            <span
                              className={`text-xxs px-2 py-0.5 rounded font-bold uppercase ${
                                item.inStock
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                  : 'bg-red-950 text-red-400 border border-red-800/60'
                              }`}
                            >
                              {item.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          <h4 className="font-sports font-bold text-base text-white truncate mt-1">
                            {name}
                          </h4>
                          <span className="font-sports font-black text-lg text-emerald-400 block mt-0.5">
                            {item.price.toLocaleString()} ETB
                          </span>
                        </div>
                      </div>

                      <p className="text-xxs text-neutral-400 line-clamp-2">
                        {desc}
                      </p>

                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-xxs text-neutral-500 uppercase font-bold">Sizes:</span>
                          <span className="text-xxs text-neutral-300 font-mono font-bold">
                            {(item.availableSizes || item.sizes || []).join(', ') || 'Standard / One Size'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditShopItem(item)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteShopItem(item.id, name)}
                            disabled={deletingShopId === item.id}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/60 transition-colors disabled:opacity-50"
                            title="Delete Product from Firestore"
                          >
                            {deletingShopId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUBTAB 2: CUSTOMER JERSEY ORDERS */}
          {shopSubTab === 'orders' && (
            <div className="space-y-4">
              {shopOrders.length === 0 ? (
                <div className="text-center py-12 bg-neutral-950 rounded-2xl border border-neutral-800 p-6 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto" />
                  <h4 className="font-sports font-bold text-lg text-white uppercase">No Customer Orders Yet</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    When supporters purchase jerseys through the shop and complete Chapa payment, their delivery orders appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-neutral-800 uppercase text-neutral-400 font-sports tracking-wider">
                        <th className="py-3 px-3">Order Ref</th>
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Phone</th>
                        <th className="py-3 px-3">Product & Size</th>
                        <th className="py-3 px-3">Delivery Address</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {shopOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-neutral-800/30">
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">
                            {ord.fullName}
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-300">
                            {ord.phone}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-white">{ord.itemName}</span>
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-400 font-sports font-bold uppercase text-xxs">
                              Size {ord.size}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-neutral-300 max-w-xs truncate">
                            {ord.streetAddress}, {ord.city}
                          </td>
                          <td className="py-3 px-3 font-sports font-black text-emerald-400">
                            {ord.amount.toLocaleString()} ETB
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : ord.status === 'PAID'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {ord.status !== 'DELIVERED' ? (
                              <button
                                onClick={() => updateShopOrderStatus(ord.id, 'DELIVERED')}
                                className="px-2.5 py-1 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-xxs font-bold uppercase tracking-wider font-sports transition-colors"
                              >
                                Mark Delivered
                              </button>
                            ) : (
                              <span className="text-xxs text-neutral-500 font-semibold">Complete</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 3: SUPPORTER DONATIONS */}
          {shopSubTab === 'donations' && (
            <div className="space-y-4">
              {donations.length === 0 ? (
                <div className="text-center py-12 bg-neutral-950 rounded-2xl border border-neutral-800 p-6 space-y-2">
                  <Heart className="w-10 h-10 text-neutral-600 mx-auto fill-neutral-800" />
                  <h4 className="font-sports font-bold text-lg text-white uppercase">No Donations Logged Yet</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    When fans make contributions via the homepage Donate button, verified transactions will appear in this ledger.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-neutral-800 uppercase text-neutral-400 font-sports tracking-wider">
                        <th className="py-3 px-3">Receipt / Ref</th>
                        <th className="py-3 px-3">Donor Name</th>
                        <th className="py-3 px-3">Phone</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Purpose</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {donations.map((don) => (
                        <tr key={don.id} className="hover:bg-neutral-800/30">
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">
                            {don.donationNumber}
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">
                            {don.fullName}
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-300">
                            {don.phone}
                          </td>
                          <td className="py-3 px-3 font-sports font-black text-emerald-400 text-sm">
                            {don.amount.toLocaleString()} ETB
                          </td>
                          <td className="py-3 px-3 text-emerald-300">
                            {don.purpose}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                              {don.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-neutral-400 text-xxs">
                            {new Date(don.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: NEWS MANAGEMENT */}
      {adminTab === 'news' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
                News Articles & Press Releases
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Publish new stories with multi-language headings and match reports.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingArticleId(null);
                setNewsTitleEn('');
                setNewsTitleAm('');
                setNewsTitleOm('');
                setNewsSummaryEn('');
                setNewsContentEn('');
                setIsNewsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </button>
          </div>

          <div className="space-y-3">
            {news.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-16 h-12 object-cover rounded-lg shrink-0 border border-neutral-800"
                  />
                  <div>
                    <span className="text-xxs font-bold uppercase text-emerald-400 block font-sports">
                      {item.category.replace('_', ' ')} • {item.date}
                    </span>
                    <h4 className="font-bold text-sm text-white">
                      {typeof item.title === 'string' ? item.title : item.title?.en || ''}
                    </h4>
                    <span className="text-xs text-neutral-500">
                      {typeof item.title === 'object' ? item.title?.am || '' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingArticleId(item.id);
                      setNewsTitleEn(typeof item.title === 'string' ? item.title : item.title?.en || '');
                      setNewsTitleAm(typeof item.title === 'object' ? item.title?.am || '' : '');
                      setNewsTitleOm(typeof item.title === 'object' ? item.title?.om || '' : '');
                      setNewsSummaryEn(typeof item.summary === 'string' ? item.summary : item.summary?.en || '');
                      setNewsContentEn(typeof item.content === 'string' ? item.content : item.content?.en || '');
                      setNewsCategory(item.category);
                      setNewsImageUrl(item.imageUrl);
                      setIsNewsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    title="Edit article"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNewsArticle(item.id)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400"
                    title="Delete article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FIXTURES & RESULTS */}
      {adminTab === 'fixtures' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
                Fixtures & Match Results Management
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Schedule new matches, update live scores, and enter final results.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingMatchId(null);
                setMatchDate(new Date().toISOString().slice(0, 10));
                setMatchAwayTeam('');
                setIsMatchModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fixture</span>
            </button>
          </div>

          <div className="space-y-3">
            {matches.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-sports font-bold uppercase text-amber-400">
                      {m.competitionName}
                    </span>
                    <span className="text-neutral-500">• {m.date}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                        m.status === 'FINISHED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : m.status === 'LIVE'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <h4 className="font-sports font-bold text-lg text-white mt-1">
                    {m.homeTeam.name}{' '}
                    {m.score ? (
                      <span className="text-emerald-400 font-mono">
                        {m.score.home} - {m.score.away}
                      </span>
                    ) : (
                      'vs'
                    )}{' '}
                    {m.awayTeam.name}
                  </h4>
                  <span className="text-xs text-neutral-400">{m.venue}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setEditingMatchId(m.id);
                      setMatchDate(m.date);
                      setMatchTime(m.kickoffTime);
                      setMatchVenue(m.venue);
                      setMatchHomeTeam(m.homeTeam.name);
                      setMatchAwayTeam(m.awayTeam.name);
                      setMatchComp(m.competition);
                      setMatchStatus(m.status as any);
                      if (m.score) {
                        setHomeScore(m.score.home);
                        setAwayScore(m.score.away);
                      }
                      setIsMatchModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    title="Edit match"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMatch(m.id)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400"
                    title="Delete match"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: STANDINGS EDITOR */}
      {adminTab === 'standings' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
                League Standings Table Editor
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Edit team points, wins, draws, and goals. Tables auto-sort immediately.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={recalculateStandingsFromMatches}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Automatically calculate points, goals, and positions from all finished match fixtures"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Auto-Calculate from Fixtures</span>
              </button>

              <button
                onClick={resetStandings}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Standings</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-neutral-800 uppercase text-neutral-400 font-sports tracking-wider">
                  <th className="py-3 px-3">Pos</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-2 text-center" title="Games Played - use buttons or type directly to change">P (Played)</th>
                  <th className="py-3 px-2 text-center">W</th>
                  <th className="py-3 px-2 text-center">D</th>
                  <th className="py-3 px-2 text-center">L</th>
                  <th className="py-3 px-2 text-center">GF</th>
                  <th className="py-3 px-2 text-center">GA</th>
                  <th className="py-3 px-3 text-center">Pts</th>
                  <th className="py-3 px-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {standings.map((st) => (
                  <tr
                    key={st.teamId}
                    className={st.isHalaba ? 'bg-red-950/40 font-bold' : 'hover:bg-neutral-800/40'}
                  >
                    <td className="py-3 px-3">{st.position}</td>
                    <td className="py-3 px-3 text-white font-sports text-sm">{st.teamName}</td>
                    
                    {/* Interactive Games Played (P) Stepper & Direct Input */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="inline-flex items-center justify-center gap-1 bg-neutral-950 px-1.5 py-1 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                        <button
                          type="button"
                          onClick={() => updateStanding(st.teamId, { played: Math.max(0, st.played - 1) })}
                          className="w-5 h-5 flex items-center justify-center rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Decrease Games Played"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={st.played}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateStanding(st.teamId, { played: isNaN(val) ? 0 : Math.max(0, val) });
                          }}
                          className="w-8 text-center bg-transparent font-mono font-bold text-white text-xs focus:outline-none focus:bg-neutral-900 rounded p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title="Click to type games played directly"
                        />
                        <button
                          type="button"
                          onClick={() => updateStanding(st.teamId, { played: st.played + 1 })}
                          className="w-5 h-5 flex items-center justify-center rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Increase Games Played"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center text-emerald-400 font-bold">{st.won}</td>
                    <td className="py-3 px-2 text-center text-neutral-400">{st.drawn}</td>
                    <td className="py-3 px-2 text-center text-red-400">{st.lost}</td>
                    <td className="py-3 px-2 text-center text-neutral-400">{st.goalsFor}</td>
                    <td className="py-3 px-2 text-center text-neutral-400">{st.goalsAgainst}</td>
                    <td className="py-3 px-3 text-center font-sports font-black text-white text-base">
                      {st.points}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            updateStanding(st.teamId, {
                              played: st.played + 1,
                              won: st.won + 1,
                              points: st.points + 3,
                              goalsFor: st.goalsFor + 1,
                            })
                          }
                          className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-xxs font-bold transition-colors cursor-pointer"
                          title="Add 1 Win (+3 Pts, +1 GF)"
                        >
                          + Win
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStanding(st.teamId, {
                              played: st.played + 1,
                              drawn: st.drawn + 1,
                              points: st.points + 1,
                            })
                          }
                          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xxs font-bold transition-colors cursor-pointer"
                          title="Add 1 Draw (+1 Pt)"
                        >
                          + Draw
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStanding(st.teamId, {
                              played: st.played + 1,
                              lost: st.lost + 1,
                              goalsAgainst: st.goalsAgainst + 1,
                            })
                          }
                          className="px-2 py-1 rounded bg-red-950/90 hover:bg-red-900 text-red-300 border border-red-800 text-xxs font-bold transition-colors cursor-pointer"
                          title="Add 1 Loss (0 Pts, +1 GA)"
                        >
                          + Lose
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditStanding(st)}
                          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer ml-1"
                          title={`Edit all table stats for ${st.teamName}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Team Standings Edit Modal */}
          {editingStandingTeam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <span className="text-xxs uppercase tracking-wider text-red-400 font-sports font-bold">
                      Edit League Standing
                    </span>
                    <h4 className="text-lg font-sports font-black text-white">
                      {editingStandingTeam.teamName}
                    </h4>
                  </div>
                  <button
                    onClick={() => setEditingStandingTeam(null)}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveStanding} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-neutral-400 uppercase mb-1">
                        Played (P)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={standingFormData.played}
                        onChange={(e) =>
                          setStandingFormData({ ...standingFormData, played: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-emerald-400 uppercase mb-1">
                        Won (W)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={standingFormData.won}
                        onChange={(e) =>
                          setStandingFormData({ ...standingFormData, won: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold text-sm focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-neutral-400 uppercase mb-1">
                        Drawn (D)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={standingFormData.drawn}
                        onChange={(e) =>
                          setStandingFormData({ ...standingFormData, drawn: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-red-400 uppercase mb-1">
                        Lost (L)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={standingFormData.lost}
                        onChange={(e) =>
                          setStandingFormData({ ...standingFormData, lost: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-red-400 font-mono font-bold text-sm focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-neutral-400 uppercase mb-1">
                        Goals For (GF)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={standingFormData.goalsFor}
                        onChange={(e) =>
                          setStandingFormData({ ...standingFormData, goalsFor: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-neutral-400 uppercase mb-1">
                        Goals Against (GA)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={standingFormData.goalsAgainst}
                        onChange={(e) =>
                          setStandingFormData({ ...standingFormData, goalsAgainst: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-amber-400 uppercase mb-1">
                        Points (Pts)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={standingFormData.points}
                        onChange={(e) =>
                          setStandingFormData({ ...standingFormData, points: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-amber-400 font-sports font-black text-base focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs text-neutral-400">
                    <div>
                      Goal Diff:{' '}
                      <span className="font-bold font-mono text-white">
                        {standingFormData.goalsFor - standingFormData.goalsAgainst > 0 ? '+' : ''}
                        {standingFormData.goalsFor - standingFormData.goalsAgainst}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingStandingTeam(null)}
                        className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-sports font-bold uppercase transition-colors cursor-pointer text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-sports font-black uppercase transition-colors cursor-pointer text-xs shadow-md"
                      >
                        Save Standing
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: SQUAD & STAFF */}
      {adminTab === 'squad' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-neutral-800">
            <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
              Squad & Staff Roster
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Add new signings and update player numbers and statistics.
            </p>
          </div>

          {/* Quick Add Player Form */}
          <form
            onSubmit={handleAddPlayer}
            className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center gap-3"
          >
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Player Name (e.g. Dawit Fekadu)"
              className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 w-48"
            />
            <input
              type="number"
              value={newPlayerNumber}
              onChange={(e) => setNewPlayerNumber(Number(e.target.value))}
              placeholder="Jersey #"
              className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 w-20 text-center font-sports text-sm"
            />
            <select
              value={newPlayerPos}
              onChange={(e) => setNewPlayerPos(e.target.value as any)}
              className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none"
            >
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase font-sports"
            >
              Add Player
            </button>
          </form>

          {/* Players List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {players.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-sports font-bold text-lg text-red-500">#{p.number} </span>
                  <span className="font-semibold text-white text-sm">{p.name}</span>
                  <span className="block text-xxs text-neutral-400 font-sports uppercase">
                    {p.position}
                  </span>
                </div>
                <button
                  onClick={() => deletePlayer(p.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400"
                  title="Remove player"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: LIVE AUTO-UPDATE ENGINE */}
      {adminTab === 'sync' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-sports font-bold text-xs uppercase tracking-wider text-emerald-400">
                  Federation Live Sync & Simulator
                </span>
              </div>
              <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider mt-1">
                Live Matches & Standings Auto-Update Engine
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Control the real-time background refresh loop, simulate matchday scores, and test automatic standings recalculation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={syncNow}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-2 transition-all disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>

          {/* Engine Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-xs text-neutral-400 font-bold uppercase block">
                  Background Auto-Update
                </span>
                <span
                  className={`font-sports font-black text-2xl mt-1 block ${
                    isAutoSyncEnabled ? 'text-emerald-400' : 'text-neutral-500'
                  }`}
                >
                  {isAutoSyncEnabled ? 'ENABLED' : 'PAUSED'}
                </span>
              </div>
              <button
                onClick={toggleAutoSync}
                className={`mt-3 py-1.5 px-3 rounded-lg text-xs font-bold uppercase font-sports flex items-center justify-center gap-1.5 transition-colors ${
                  isAutoSyncEnabled
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-400'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
              >
                {isAutoSyncEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoSyncEnabled ? 'Pause Loop' : 'Resume Loop'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-xs text-neutral-400 font-bold uppercase block">
                  Sync Frequency
                </span>
                <span className="font-sports font-black text-2xl text-white mt-1 block">
                  Every {autoSyncInterval}s
                </span>
              </div>
              <div className="mt-3 flex gap-1.5">
                {[15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setAutoSyncInterval(sec)}
                    className={`flex-1 py-1 rounded text-xxs font-bold uppercase font-mono ${
                      autoSyncInterval === sec
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-xs text-neutral-400 font-bold uppercase block">
                  Next Refresh In
                </span>
                <span className="font-mono font-black text-3xl text-amber-400 mt-1 block">
                  {isAutoSyncEnabled ? `${secondsUntilNextSync}s` : 'Paused'}
                </span>
              </div>
              <span className="text-xxs text-neutral-500">
                Auto-ticks and refreshes client state
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-xs text-neutral-400 font-bold uppercase block">
                  Last Federation Sync
                </span>
                <span className="font-mono font-bold text-sm text-neutral-200 mt-2 block">
                  {lastSyncTime.toLocaleTimeString()}
                </span>
              </div>
              <span className="text-xxs text-emerald-400">
                Connected to local reactive state
              </span>
            </div>
          </div>

          {/* Interactive Simulation Action Buttons */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-red-950/40 via-neutral-950 to-green-950/40 border border-neutral-800 space-y-4">
            <h4 className="font-sports font-bold text-lg text-white uppercase flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Instant Test Actions (Immediate Effect)</span>
            </h4>
            <p className="text-xs text-neutral-300">
              Click either button below to immediately trigger live match action or advance the entire league table to test automatic updates.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={simulateLiveMatchAction}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-sports font-bold text-sm uppercase tracking-wider shadow-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-200" />
                <span>Simulate Live Match Action (Goal / Minute Advance)</span>
              </button>

              <button
                onClick={advanceLeagueMatchday}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-sports font-bold text-sm uppercase tracking-wider shadow-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Sync Official League Standings (TheSportsDB)</span>
              </button>
            </div>
          </div>

          {/* Live Notifications Stream */}
          <div className="space-y-3">
            <h4 className="font-sports font-bold text-base text-neutral-300 uppercase tracking-wider">
              Recent Live Events & Notifications ({liveNotifications.length})
            </h4>

            {liveNotifications.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3 italic">
                No new live notifications yet. Click "Simulate Live Match Action" above to trigger a live goal!
              </p>
            ) : (
              <div className="space-y-2">
                {liveNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-500 font-bold">{n.timestamp}</span>
                      <strong className="text-amber-400 uppercase font-sports tracking-wide">
                        {n.title}
                      </strong>
                      <span className="text-neutral-300 hidden sm:inline">{n.message}</span>
                    </div>
                    <span className="text-xxs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 uppercase font-mono">
                      {n.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SPONSORS & PARTNERS CAROUSEL MANAGEMENT */}
      {adminTab === 'sponsors' && <SponsorManager />}

      {/* TAB CONTENT 6: CLUB SETTINGS & DB INTEGRATION GUIDE */}
      {adminTab === 'settings' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
              Club Configuration & Production Database Guide
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Configuration details, official contacts, and cloud persistence deployment guide.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <h4 className="font-sports font-bold text-lg text-white uppercase flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Production Database Status</span>
            </h4>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              The club portal is currently configured with high-performance persistent local storage for rapid prototype demonstration, allowing club staff to test all features (membership registrations, match schedules, league standings, news publications).
            </p>
            <div className="p-4 rounded-lg bg-neutral-900 text-xs text-neutral-300 space-y-2 border border-neutral-800">
              <strong className="text-amber-400 block font-sports text-sm uppercase">
                To connect a production Cloud Firestore or Cloud SQL database:
              </strong>
              <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                <li>Run Firebase or Cloud SQL provisioning through AI Studio's integration manager.</li>
                <li>Configure Firestore rules: restrict membership queries to role 'admin', and allow public reads for news, fixtures, and standings.</li>
                <li>Deploy live rules with <code className="text-red-400">deploy_firebase</code>.</li>
              </ol>
            </div>
          </div>

          {/* Reset All Data Button */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-neutral-400">
              Reset all club data, matches, news, and registrations back to defaults.
            </span>
            {isConfirmResetOpen ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-300 font-bold">Confirm Reset?</span>
                <button
                  onClick={() => {
                    resetAllDataToDefault();
                    setIsConfirmResetOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider font-sports transition-colors"
                >
                  Yes, Reset All
                </button>
                <button
                  onClick={() => setIsConfirmResetOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmResetOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Everything</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT NEWS MODAL */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h4 className="font-sports font-bold text-xl text-white uppercase">
                {editingArticleId ? 'Edit Article' : 'Create News Article'}
              </h4>
              <button
                onClick={() => setIsNewsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-300 uppercase mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={newsTitleEn}
                  onChange={(e) => setNewsTitleEn(e.target.value)}
                  placeholder="Headline in English..."
                  className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 uppercase mb-1">
                    Title (Amharic - አማርኛ)
                  </label>
                  <input
                    type="text"
                    value={newsTitleAm}
                    onChange={(e) => setNewsTitleAm(e.target.value)}
                    placeholder="ርዕስ በአማርኛ..."
                    className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 uppercase mb-1">
                    Title (Afaan Oromo)
                  </label>
                  <input
                    type="text"
                    value={newsTitleOm}
                    onChange={(e) => setNewsTitleOm(e.target.value)}
                    placeholder="Mata duree Afaan Oromootiin..."
                    className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  <div>
                    <label className="block font-bold text-neutral-300 uppercase mb-1">
                      Category *
                    </label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="CLUB_NEWS">Club News</option>
                      <option value="MATCH_REPORTS">Match Reports</option>
                      <option value="TRANSFERS">Transfers</option>
                      <option value="INTERVIEWS">Interviews</option>
                      <option value="ACADEMY">Youth Academy</option>
                      <option value="COMMUNITY">Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 uppercase mb-1">
                      Featured Image (Link URL or Device Upload)
                    </label>

                    {/* Unified Link + Device Upload Input */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Link className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={newsImageUrl.startsWith('data:') ? 'Photo loaded from local device' : newsImageUrl}
                            onChange={(e) => {
                              setNewsImageUrl(e.target.value);
                            }}
                            placeholder="Paste image link URL (https://...)"
                            className="w-full pl-8 pr-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
                          />
                        </div>

                        {/* Direct Browse / Upload button on the input */}
                        <label
                          htmlFor="news-image-unified-file-input"
                          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg border border-neutral-700 text-xs font-sports font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                          title="Select image from local device"
                        >
                          <Upload className="w-3.5 h-3.5 text-red-400" />
                          <span>Browse Device</span>
                          <input
                            id="news-image-unified-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                        </label>

                        {newsImageUrl && (
                          <button
                            type="button"
                            onClick={() => setNewsImageUrl('')}
                            className="p-2 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors shrink-0"
                            title="Clear image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Drag & Drop File Zone */}
                      <label
                        htmlFor="news-image-unified-file-input"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setNewsUploadError('File size exceeds 5MB limit. Please select a smaller photo file.');
                              return;
                            }
                            setNewsUploadError(null);
                            const reader = new FileReader();
                            reader.onload = (loadEv) => {
                              if (loadEv.target?.result) {
                                setNewsImageUrl(loadEv.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="py-1.5 px-3 rounded-lg border border-dashed border-neutral-800 hover:border-neutral-700 bg-neutral-950/70 hover:bg-neutral-950 text-neutral-400 text-xxs flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Or drag & drop photo here from your device</span>
                        </span>
                        <span className="text-red-400 font-bold uppercase font-sports">Choose File</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Attached Image Preview */}
                {newsImageUrl && (
                  <div className="mt-2.5 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={newsImageUrl}
                        alt="Preview"
                        className="w-14 h-11 object-cover rounded-lg border border-neutral-700 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <span className="text-xxs font-bold uppercase text-emerald-400 flex items-center gap-1 font-sports">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Image Attached</span>
                        </span>
                        <span className="text-xxs text-neutral-400 truncate block max-w-xs sm:max-w-md mt-0.5">
                          {newsImageUrl.startsWith('data:')
                            ? 'Photo uploaded from device (ready to publish)'
                            : newsImageUrl}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewsImageUrl('')}
                      className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-red-950 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xxs font-bold uppercase transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-300 uppercase mb-1">Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={newsSummaryEn}
                  onChange={(e) => setNewsSummaryEn(e.target.value)}
                  placeholder="Brief summary sentence..."
                  className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 uppercase mb-1">Full Article Text *</label>
                <textarea
                  rows={5}
                  required
                  value={newsContentEn}
                  onChange={(e) => setNewsContentEn(e.target.value)}
                  placeholder="Write the full report or announcement..."
                  className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold uppercase font-sports text-sm"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MATCH MODAL */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h4 className="font-sports font-bold text-xl text-white uppercase">
                {editingMatchId ? 'Update Match Details & Score' : 'Schedule New Fixture'}
              </h4>
              <button
                onClick={() => setIsMatchModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 uppercase mb-1">
                    Home Team *
                  </label>
                  <input
                    type="text"
                    required
                    value={matchHomeTeam}
                    onChange={(e) => setMatchHomeTeam(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm font-sports"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 uppercase mb-1">
                    Away Team *
                  </label>
                  <input
                    type="text"
                    required
                    value={matchAwayTeam}
                    onChange={(e) => setMatchAwayTeam(e.target.value)}
                    placeholder="Opponent Name"
                    className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm font-sports"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 uppercase mb-1">
                    Kickoff Time *
                  </label>
                  <input
                    type="text"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    placeholder="15:00"
                    className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-300 uppercase mb-1">Venue *</label>
                <input
                  type="text"
                  required
                  value={matchVenue}
                  onChange={(e) => setMatchVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 uppercase mb-1">Status</label>
                  <select
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE">Live</option>
                    <option value="FINISHED">Finished (FT)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 uppercase mb-1">Home Score</label>
                  <input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm font-sports text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 uppercase mb-1">Away Score</label>
                  <input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white text-sm font-sports text-center"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold uppercase font-sports text-sm"
                >
                  Save Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SHOP ITEM MODAL */}
      {isShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
                    {editingShopItemId ? 'Edit Shop Merchandise' : 'Add New Jersey / Product'}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Product appears instantly in the official store with Chapa checkout.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShopModalOpen(false)}
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShopItem} className="space-y-4 text-xs">
              {/* Product Name in 3 Languages */}
              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Product / Jersey Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={shopNameEn}
                  onChange={(e) => setShopNameEn(e.target.value)}
                  placeholder="e.g. Official 2026/27 Home Match Jersey"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Product Name (Amharic - አማርኛ)
                  </label>
                  <input
                    type="text"
                    value={shopNameAm}
                    onChange={(e) => setShopNameAm(e.target.value)}
                    placeholder="ለምሳሌ፡ ይፋዊ የ2026/27 የሜዳ ማሊያ"
                    className="w-full px-3.5 py-2 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Product Name (Afaan Oromo)
                  </label>
                  <input
                    type="text"
                    value={shopNameOm}
                    onChange={(e) => setShopNameOm(e.target.value)}
                    placeholder="fakkeenyaaf: Jeersii Seeraa 2026/27"
                    className="w-full px-3.5 py-2 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Price in Ethiopian Birr (ETB) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      step="10"
                      value={shopPrice}
                      onChange={(e) => setShopPrice(e.target.value)}
                      placeholder="1800"
                      className="w-full pl-3.5 pr-14 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-base font-sports font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 font-sports">
                      ETB
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="JERSEY">Match Jersey (Home / Away / Third)</option>
                    <option value="KIT">Kits, Training & Jackets</option>
                    <option value="ACCESSORY">Supporter Accessories & Scarves</option>
                  </select>
                </div>
              </div>

              {/* Available Sizes Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-neutral-300 uppercase tracking-wider">
                    Available Sizes * (Click to toggle)
                  </label>
                  <span className="text-xxs text-neutral-400">
                    Selected: <strong className="text-amber-400">{(shopSizes || []).join(', ') || 'None'}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'].map((size) => {
                    const isSelected = shopSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggleShopSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-sports font-bold uppercase transition-all ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-md shadow-red-900/40 ring-1 ring-red-400'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Image: Local Device Upload + URL Input + Drag & Drop */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider">
                    Product Image (Upload Local File or Image Link) *
                  </label>
                  {shopImageUrl && (
                    <span className="text-xxs font-bold uppercase font-sports text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{shopImageUrl.startsWith('data:') ? 'Local Photo Ready' : 'Web Image Linked'}</span>
                    </span>
                  )}
                </div>

                {/* Unified Input Bar: Link URL + Direct Local File Picker Button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={shopImageUrl.startsWith('data:') ? 'Photo loaded from local device (ready to save)' : shopImageUrl}
                      onChange={(e) => {
                        setShopImageUrl(e.target.value);
                        setShopUploadError(null);
                      }}
                      placeholder="Paste image link URL (https://...) or choose local file"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Browse Local Device Button */}
                  <label
                    htmlFor="shop-image-file-input"
                    className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 hover:text-white rounded-xl border border-neutral-700 text-xs font-sports font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] shrink-0 active:scale-95 shadow-md"
                    title="Select image from local device"
                  >
                    <Upload className="w-4 h-4 text-red-400" />
                    <span>Upload Local File</span>
                    <input
                      id="shop-image-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleShopImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {shopImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setShopImageUrl('');
                        setShopUploadError(null);
                      }}
                      className="p-2.5 rounded-xl bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors shrink-0 border border-neutral-700"
                      title="Clear product image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Drag & Drop File Zone */}
                <label
                  htmlFor="shop-image-file-input"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleShopImageDrop}
                  className="py-2.5 px-4 rounded-xl border border-dashed border-neutral-800 hover:border-red-600/60 bg-neutral-950/70 hover:bg-neutral-950 text-neutral-400 text-xs flex items-center justify-between cursor-pointer transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-neutral-500 group-hover:text-red-400 transition-colors" />
                    <span className="text-xxs sm:text-xs">
                      {isShopUploading
                        ? 'Optimizing and loading local photo...'
                        : 'Drag & drop local jersey or merchandise photo here'}
                    </span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 group-hover:bg-red-600 text-neutral-300 group-hover:text-white font-sports font-bold uppercase text-xxs transition-colors">
                    {isShopUploading ? 'Processing...' : 'Browse Computer'}
                  </span>
                </label>

                {/* Upload Error Banner */}
                {shopUploadError && (
                  <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{shopUploadError}</span>
                  </div>
                )}

                {/* Quick Preset Buttons for Official Kits */}
                <div className="pt-1">
                  <span className="text-xxs text-neutral-400 block mb-1 font-semibold uppercase">
                    Or Quick Select Official Club Kits:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShopImageUrl(ClubImages.homeJersey);
                        setShopUploadError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-red-400 text-xxs font-bold uppercase"
                    >
                      Official Home Kit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShopImageUrl(ClubImages.awayJersey);
                        setShopUploadError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-emerald-400 text-xxs font-bold uppercase"
                    >
                      Official Away Kit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShopImageUrl('https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=800&q=80');
                        setShopUploadError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xxs font-bold uppercase"
                    >
                      Onyx Third Kit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShopImageUrl('https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80');
                        setShopUploadError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xxs font-bold uppercase"
                    >
                      Supporter Scarf
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShopImageUrl('https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80');
                        setShopUploadError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-blue-400 text-xxs font-bold uppercase"
                    >
                      Anthem Jacket
                    </button>
                  </div>
                </div>

                {/* Attached Image Preview */}
                {shopImageUrl && (
                  <div className="mt-2.5 p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={shopImageUrl}
                        alt="Product preview"
                        className="w-14 h-14 object-cover rounded-xl border border-neutral-700 shrink-0 bg-neutral-900"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <span className="text-xxs font-bold uppercase text-emerald-400 flex items-center gap-1 font-sports">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            {shopImageUrl.startsWith('data:')
                              ? 'Local Photo Loaded & Ready'
                              : 'Image Loaded for Storefront'}
                          </span>
                        </span>
                        <span className="text-xxs text-neutral-400 truncate block max-w-xs sm:max-w-md mt-0.5 font-mono">
                          {shopImageUrl.startsWith('data:')
                            ? 'Uploaded from device (processed for store)'
                            : shopImageUrl}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShopImageUrl('');
                        setShopUploadError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-red-950 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xxs font-bold uppercase transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Description in English */}
              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Description (English) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={shopDescEn}
                  onChange={(e) => setShopDescEn(e.target.value)}
                  placeholder="Official breathable match jersey with embroidered crest..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              {/* Description in Amharic (Optional) */}
              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Description (Amharic - አማርኛ)
                </label>
                <textarea
                  rows={2}
                  value={shopDescAm}
                  onChange={(e) => setShopDescAm(e.target.value)}
                  placeholder="የማሊያው መግለጫ በአማርኛ..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              {/* Flags: In Stock & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={shopInStock}
                    onChange={(e) => setShopInStock(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded bg-neutral-900 border-neutral-700 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-sports font-bold text-white uppercase block text-xs">
                      Available In Stock
                    </span>
                    <span className="text-xxs text-neutral-400">
                      Customers can click Buy Now
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={shopFeatured}
                    onChange={(e) => setShopFeatured(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded bg-neutral-900 border-neutral-700 focus:ring-red-500"
                  />
                  <div>
                    <span className="font-sports font-bold text-white uppercase block text-xs">
                      Feature on Homepage
                    </span>
                    <span className="text-xxs text-neutral-400">
                      Show in top 3 store showcase
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsShopModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase tracking-wider font-sports transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingShopToFirestore}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-emerald-600 hover:from-red-500 hover:to-emerald-500 text-white font-sports font-black text-sm uppercase tracking-wider shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                >
                  {isSavingShopToFirestore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingShopItemId ? 'Save Changes' : 'Publish Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
