import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { HadiyaCrest } from '../components/HadiyaCrest';
import { EthiopianClubLogo } from '../components/EthiopianClubLogo';
import { ClubImages } from '../assets/images';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  UserPlus,
  Flame,
  ArrowRight,
  Heart,
  ShoppingBag,
  Trophy,
  Shield,
  Activity,
  Users,
  Compass,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { getLocalizedTeamName, getLocalizedVenue } from '../utils/localization';
import { formatTeamName } from '../utils/formatTeamName';

interface HomePageProps {
  onOpenMatchModal: (matchId: string) => void;
  onOpenArticleModal: (articleId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenMatchModal,
  onOpenArticleModal,
}) => {
  const {
    t,
    language,
    setCurrentPage,
    matches,
    standings,
    news,
    clubInfo,
    openDonationModal,
    shopItems,
    openCheckoutModal,
    openDossier,
  } = useClub();

  // Selected tactical tab for match preview widget
  const [tacticalTab, setTacticalTab] = useState<'lineup' | 'h2h' | 'tickets'>('lineup');

  // Match lookup
  const isHossanaMatch = (m: any) =>
    Boolean(
      m &&
      (m.homeTeam?.id === 'hossana' ||
        m.awayTeam?.id === 'hossana' ||
        m.homeTeam?.id === 'hosaena' ||
        m.awayTeam?.id === 'hosaena' ||
        m.homeTeam?.isHossana ||
        m.awayTeam?.isHossana ||
        m.homeTeam?.name?.toLowerCase().includes('hossana') ||
        m.awayTeam?.name?.toLowerCase().includes('hossana') ||
        m.homeTeam?.isHalaba ||
        m.awayTeam?.isHalaba)
    );

  const upcomingMatches = matches
    .filter((m) => (m.status === 'UPCOMING' || m.status === 'LIVE') && isHossanaMatch(m))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const featuredMatch = upcomingMatches[0] || matches[0];

  const finishedMatches = matches
    .filter((m) => m.status === 'FINISHED' && isHossanaMatch(m))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestResult = finishedMatches[0] || null;

  // Standings & Hossana stats
  const hossanaStanding = standings.find(
    (s) => s.teamId === 'hossana' || s.teamId === 'hosaena' || s.isHalaba
  ) || standings[1];

  const topStandings = standings.slice(0, 5);
  const featuredArticle = news.find((n) => n.featured || n.isFeatured) || news[0];
  const sideArticles = news.filter((n) => n.id !== featuredArticle?.id).slice(0, 3);

  const getArticleTitle = (art: any): string => {
    if (!art || !art.title) return '';
    if (typeof art.title === 'string') return art.title;
    return art.title[language] || art.title.en || Object.values(art.title)[0] || '';
  };

  const getArticleSummary = (art: any): string => {
    if (!art) return '';
    const val = art.summary ?? art.excerpt;
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[language] || val.en || Object.values(val)[0] || '';
  };

  return (
    <div className="w-full space-y-16 lg:space-y-24 pb-20">
      {/* =========================================================================
          1. MARQUEE SPLIT HERO: EDITORIAL CLUB IDENTITY + TACTICAL MATCH CENTER
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#140409] via-[#0b0f19] to-[#070b13] border-b border-[#2d111d] pt-8 lg:pt-14 pb-14 lg:pb-20">
        {/* Subtle background ambient mesh */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(131,22,39,0.6),rgba(255,255,255,0))]"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Bold Editorial Presentation */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Badge & League Kicker */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <HadiyaCrest size="xl" glow withRing />
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#661120]/40 border border-amber-500/30 text-amber-300 text-xxs font-bold uppercase tracking-wider">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{t.heroTag || 'OFFICIAL CLUB PORTAL'}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      {language === 'am' ? 'በ1998 ዓ.ም ተመሰረተ' : 'Founded 2006 G.C. · Hossana'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-sports tracking-tight text-white uppercase leading-[0.95]">
                    HADIYA HOSSANA <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-[#e69c24]">
                      FOOTBALL CLUB
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl font-bold font-ethiopic text-amber-200/90 tracking-wide">
                    {language === 'am' ? 'ሀዲያ ሆሳዕና - ነብሮቹ (ርግቦቹ)' : 'The Tigers · The Peace Birds · ልብ የሞላው ድል'}
                  </p>
                </div>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  {language === 'am'
                    ? 'በኢትዮጵያ ፕሪሚየር ሊግ በከፍተኛ ወኔ እና ስነ-ምግባር የሚወዳደረው የሆሳዕና ከተማና የመላው ሀዲያ ኩራት። በአብዮ ኤርሚያስ ስታዲየም ደጋፊዎች ጋር ወደ ድል ጉዞ!'
                    : 'The authentic pride of Hossana and Central Ethiopia in the Premier League. Driven by relentless discipline, community passion, and highland fortress spirit at Abiyo Ermias Stadium.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setCurrentPage('membership')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7e1426] via-[#9e1b32] to-[#bc223d] hover:from-[#9e1b32] hover:to-[#ce2745] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#7e1426]/30 border border-amber-500/40 active:scale-95 transition-all"
                >
                  <UserPlus className="w-4 h-4 text-amber-300" />
                  <span>{language === 'am' ? 'የደጋፊዎች አባልነት' : 'Join Fan Pass'}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>

                <button
                  onClick={() => setCurrentPage('fixtures')}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#141b29] hover:bg-[#1f283c] text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700/70 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>{t.heroBtnFixtures}</span>
                </button>

                <button
                  onClick={() => setCurrentPage('shop')}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#141b29] hover:bg-[#1f283c] text-amber-300 text-xs sm:text-sm font-semibold border border-amber-500/25 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>{language === 'am' ? 'የክለቡ ሱቅ' : '2026/27 Kits'}</span>
                </button>
              </div>

              {/* Club Metrics Strip */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 p-3.5 rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 backdrop-blur-sm">
                <div>
                  <div className="text-xxs sm:text-xs text-slate-400 font-medium">{language === 'am' ? 'ደረጃ' : 'EPL Pos'}</div>
                  <div className="text-lg sm:text-2xl font-black font-sports text-amber-400">
                    #{hossanaStanding?.position || 2}
                  </div>
                </div>
                <div>
                  <div className="text-xxs sm:text-xs text-slate-400 font-medium">{language === 'am' ? 'ነጥብ' : 'Points'}</div>
                  <div className="text-lg sm:text-2xl font-black font-sports text-white">
                    {hossanaStanding?.points || 11}
                  </div>
                </div>
                <div>
                  <div className="text-xxs sm:text-xs text-slate-400 font-medium">{language === 'am' ? 'ስታዲየም' : 'Capacity'}</div>
                  <div className="text-lg sm:text-2xl font-black font-sports text-slate-100">
                    18.5K
                  </div>
                </div>
                <div>
                  <div className="text-xxs sm:text-xs text-slate-400 font-medium">{language === 'am' ? 'ሁኔታ' : 'Form'}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {(hossanaStanding?.form || ['W', 'D', 'W', 'W', 'D']).slice(-3).map((f, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          f === 'W'
                            ? 'bg-emerald-600 text-white'
                            : f === 'D'
                            ? 'bg-amber-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Match Center & Tactical Preview */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-[#0d131f] border border-[#2f1320] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sports">
                    {featuredMatch?.round || 'Round 6 Clash'}
                  </span>
                </div>
                <span className="text-xxs font-mono text-slate-400">
                  {featuredMatch?.date} · {featuredMatch?.kickoffTime} EAT
                </span>
              </div>

              {/* Matchup Badges & Teams */}
              <div className="py-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Home Team (Hossana) */}
                  <div className="flex-1 flex flex-col items-center text-center space-y-2">
                    <HadiyaCrest size="xl" glow />
                    <div className="font-sports font-black text-base sm:text-lg text-white uppercase leading-tight">
                      {featuredMatch?.homeTeam?.name || 'Hadiya Hossana'}
                    </div>
                    <span className="text-xxs text-amber-400 font-semibold uppercase">Home · 2nd</span>
                  </div>

                  {/* VS Badge */}
                  <div className="flex flex-col items-center justify-center px-3">
                    <div className="w-9 h-9 rounded-full bg-[#182030] border border-amber-500/30 flex items-center justify-center text-xs font-black font-sports text-amber-300">
                      VS
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 uppercase font-mono">EPL</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 flex flex-col items-center text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-[#141b29] border border-slate-700/60 flex items-center justify-center p-2 shadow-inner">
                      <EthiopianClubLogo
                        teamId={featuredMatch?.awayTeam?.id || 'saintgeorge'}
                        teamName={featuredMatch?.awayTeam?.name || 'Kidus Giorgis'}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div className="font-sports font-black text-base sm:text-lg text-slate-200 uppercase leading-tight">
                      {featuredMatch?.awayTeam?.name || 'Kidus Giorgis'}
                    </div>
                    <span className="text-xxs text-slate-400 font-semibold uppercase">Away · 4th</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{featuredMatch?.venue || 'Abiyo Ermias Stadium, Hossana'}</span>
                  </span>
                  <span className="text-amber-300 font-medium shrink-0 ml-2">Capacity Crowd</span>
                </div>
              </div>

              {/* Tactical Sub-tabs */}
              <div className="bg-[#121826] rounded-2xl p-3 border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-1 p-1 bg-[#090d15] rounded-lg">
                  <button
                    onClick={() => setTacticalTab('lineup')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      tacticalTab === 'lineup'
                        ? 'bg-[#661120] text-amber-200 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Squad 11
                  </button>
                  <button
                    onClick={() => setTacticalTab('h2h')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      tacticalTab === 'h2h'
                        ? 'bg-[#661120] text-amber-200 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Form Guide
                  </button>
                  <button
                    onClick={() => setTacticalTab('tickets')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      tacticalTab === 'tickets'
                        ? 'bg-[#661120] text-amber-200 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Match Pass
                  </button>
                </div>

                {/* Tab Content */}
                {tacticalTab === 'lineup' && (
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between text-xxs text-amber-400 font-mono">
                      <span>FORMATION: 4-3-3 ATTACKING</span>
                      <span>COACH: GIRMA HABTETEMARIAM</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] pt-1">
                      <div className="p-1.5 rounded bg-[#182133] border border-slate-700/50">
                        <div className="font-bold text-white">#1 Tamirat</div>
                        <div className="text-[10px] text-slate-400">Goalkeeper</div>
                      </div>
                      <div className="p-1.5 rounded bg-[#182133] border border-slate-700/50">
                        <div className="font-bold text-white">#2 Hamid (C)</div>
                        <div className="text-[10px] text-slate-400">Right Back</div>
                      </div>
                      <div className="p-1.5 rounded bg-[#182133] border border-slate-700/50">
                        <div className="font-bold text-amber-300">#10 Birhanu</div>
                        <div className="text-[10px] text-slate-400">Playmaker</div>
                      </div>
                    </div>
                  </div>
                )}

                {tacticalTab === 'h2h' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Hadiya Hossana:</span>
                      <span className="font-mono text-emerald-400 font-bold">Unbeaten (3W - 2D)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Kidus Giorgis:</span>
                      <span className="font-mono text-amber-400 font-bold">3W - 0D - 2L</span>
                    </div>
                    <p className="text-xxs text-slate-400 leading-tight">
                      Last meeting in Hossana resulted in a 1-0 victory for the Tigers with a late set-piece header.
                    </p>
                  </div>
                )}

                {tacticalTab === 'tickets' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>General Admission:</span>
                      <span className="font-mono text-amber-400 font-bold">50 ETB</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>VIP Covered Stand:</span>
                      <span className="font-mono text-amber-400 font-bold">200 ETB</span>
                    </div>
                    <button
                      onClick={() => onOpenMatchModal(featuredMatch?.id || 'm-epl-rd6')}
                      className="w-full py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs uppercase hover:bg-amber-400 transition-colors"
                    >
                      Book Ticket via Chapa
                    </button>
                  </div>
                )}
              </div>

              {/* Match Card Footer Button */}
              <div className="pt-4">
                <button
                  onClick={() => onOpenMatchModal(featuredMatch?.id || 'm-epl-rd6')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#661120] to-[#8c172d] hover:from-[#7d1427] hover:to-[#a31b35] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-amber-500/30"
                >
                  <span>{t.viewMatchDetails}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. THE FORTRESS OF HOSSANA: CINEMATIC STADIUM SPOTLIGHT
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-[#3b1523] bg-[#0c121e] shadow-2xl">
          <div className="relative h-72 sm:h-96 w-full">
            <img
              src={ClubImages.heroStadium}
              alt="Abiyo Ermias Stadium in Hossana Ethiopia"
              className="w-full h-full object-cover brightness-[0.78]"
              loading="lazy"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090e17] via-[#090e17]/50 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xxs font-bold uppercase tracking-wide">
                  <Compass className="w-3 h-3" />
                  <span>The Highland Fortress</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black font-sports uppercase tracking-tight text-white leading-tight">
                  ABIYO ERMIAS STADIUM, HOSSANA
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === 'am'
                    ? 'በደቡብ ኢትዮጵያ ለምለም ኮረብቶች መካከል የሚገኘው የነብሮቹ ምሽግ። 18,500 ተመልካቾችን የመያዝ አቅም ያለው የፍቅር እና የድል ሜዳ!'
                    : 'Nestled amidst the lush southern Ethiopian highlands, Abiyo Ermias Stadium is famous across the nation for its electric roar and formidable home advantage.'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={openDossier}
                  className="px-4 py-2.5 rounded-xl bg-[#661120] hover:bg-[#7e1426] text-white text-xs font-bold uppercase border border-amber-500/30 transition-colors shadow-lg active:scale-95"
                >
                  Stadium Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. STANDINGS CONTENDER STRIP & RECENT FORM
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Standings Table Preview */}
          <div className="lg:col-span-8 rounded-3xl bg-[#0c121e] border border-slate-800/80 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-sports font-black text-xl text-white uppercase tracking-wide">
                  {t.standingsPreviewTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'am' ? 'የ2026/27 የውድድር ዘመን የደረጃ ሰንጠረዥ' : '2026/27 Official Season Standings'}
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('standings')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>{t.fullStandingsBtn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xxs font-mono uppercase">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-3">Club</th>
                    <th className="py-2 px-2 text-center">P</th>
                    <th className="py-2 px-2 text-center">W</th>
                    <th className="py-2 px-2 text-center">D</th>
                    <th className="py-2 px-2 text-center">L</th>
                    <th className="py-2 px-2 text-center">GD</th>
                    <th className="py-2 px-2 text-center font-bold text-amber-400">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {topStandings.map((team, idx) => {
                    const isHossana = team.teamId === 'hossana' || team.teamId === 'hosaena' || team.isHalaba;
                    return (
                      <tr
                        key={team.teamId || idx}
                        className={`transition-colors ${
                          isHossana ? 'bg-[#470914]/40 font-semibold' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="py-3 px-2 font-mono text-slate-400">
                          {team.position || idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {isHossana ? (
                              <HadiyaCrest size="xs" />
                            ) : (
                              <EthiopianClubLogo teamId={team.teamId} teamName={team.teamName} className="w-5 h-5 object-contain" />
                            )}
                            <span className={isHossana ? 'text-amber-300 font-bold' : 'text-slate-200'}>
                              {isHossana ? 'Hadiya Hossana FC' : formatTeamName(team.teamId, team.teamName, language)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-300">{team.played}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-300">{team.won}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-300">{team.drawn}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-300">{team.lost}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-300">
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-amber-400 text-sm">
                          {team.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Result Card */}
          <div className="lg:col-span-4 rounded-3xl bg-[#0c121e] border border-[#2f1320] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-sports font-black text-xl text-white uppercase tracking-wide">
                {t.latestResultTitle}
              </h3>
              <span className="text-xxs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                FT 2-1 Win
              </span>
            </div>

            {latestResult && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#131a28] border border-slate-800 text-center space-y-2">
                  <div className="text-xxs font-mono text-slate-400">
                    {latestResult.competitionName} · {latestResult.date}
                  </div>
                  <div className="flex items-center justify-around gap-2 py-2">
                    <div className="flex-1 text-center">
                      <div className="text-sm font-bold text-slate-300">{latestResult.homeTeam?.name}</div>
                    </div>
                    <div className="text-2xl font-black font-sports text-amber-400 px-3 py-1 bg-[#090d16] rounded-xl border border-slate-700">
                      {latestResult.score?.home ?? 1} - {latestResult.score?.away ?? 2}
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-sm font-bold text-amber-300">{latestResult.awayTeam?.name}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    {latestResult.summary || 'Temesgen Birhanu scored an 86th-minute winner.'}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Scorers:</span>
                    <span className="text-slate-200">Gezahegn 39&apos;, Birhanu 86&apos;</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Venue:</span>
                    <span className="text-slate-200">{latestResult.venue}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setCurrentPage('fixtures')}
              className="w-full py-2.5 rounded-xl bg-[#141b29] hover:bg-[#1f283c] text-xs font-semibold text-slate-200 border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{t.allFixturesBtn}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. LATEST NEWS & EDITORIAL MAGAZINE
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Press Office & Media
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sports uppercase tracking-tight text-white">
              {t.latestClubNews}
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage('news')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>All Articles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Magazine Grid: 1 Featured + 3 Side Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Big Featured Article */}
          {featuredArticle && (
            <div
              onClick={() => onOpenArticleModal(featuredArticle.id)}
              className="lg:col-span-7 group cursor-pointer rounded-3xl overflow-hidden bg-[#0c121e] border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                <img
                  src={featuredArticle.imageUrl || ClubImages.matchAction}
                  alt={getArticleTitle(featuredArticle)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-[#661120] text-amber-200 text-xxs font-bold uppercase tracking-wider shadow">
                  Featured Story
                </div>
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-xxs text-slate-400 flex items-center gap-2">
                    <span>{featuredArticle.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredArticle.readTime || '4 min read'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400 font-semibold">{featuredArticle.category}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-sports uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {getArticleTitle(featuredArticle)}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                    {getArticleSummary(featuredArticle)}
                  </p>
                </div>

                <div className="pt-2 flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  <span>Read Full Report</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          )}

          {/* 3 Secondary Articles */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {sideArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => onOpenArticleModal(article.id)}
                className="group cursor-pointer rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-amber-500/30 p-4 transition-all flex gap-4 items-center shadow"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                  <img
                    src={article.imageUrl || ClubImages.matchAction}
                    alt={getArticleTitle(article)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>{article.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400">{article.readTime}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {getArticleTitle(article)}
                  </h4>
                  <p className="text-xxs text-slate-400 line-clamp-1">
                    {getArticleSummary(article)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. OFFICIAL 2026/27 MERCHANDISE KITS SHOWCASE
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Official Club Apparel
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sports uppercase tracking-tight text-white">
              2026/27 OFFICIAL MATCH KITS
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage('shop')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>Visit Club Shop</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Home Kit */}
          <div className="rounded-3xl overflow-hidden bg-[#0c121e] border border-[#3b121e] p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div className="relative h-64 rounded-2xl overflow-hidden bg-[#070b13] flex items-center justify-center p-2">
              <img
                src={ClubImages.homeJersey}
                alt="Hadiya Hossana Home Kit"
                className="w-full h-full object-contain filter drop-shadow-xl"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#7e1426] text-amber-200 text-xxs font-bold uppercase">
                Home Match Kit
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-sports font-black text-lg text-white uppercase">
                Crimson & Heritage Gold Home Kit
              </h3>
              <p className="text-xs text-slate-400">
                Official player edition with authentic Hadiya cultural trims.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-lg font-black font-sports text-amber-400">1,850 ETB</span>
              <button
                onClick={() => {
                  const item = shopItems.find((i) => i.id.includes('home')) || shopItems[0];
                  if (item) openCheckoutModal(item);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#7e1426] hover:bg-[#99192e] text-white text-xs font-bold uppercase transition-colors"
              >
                Order Kit
              </button>
            </div>
          </div>

          {/* Away Kit */}
          <div className="rounded-3xl overflow-hidden bg-[#0c121e] border border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div className="relative h-64 rounded-2xl overflow-hidden bg-[#070b13] flex items-center justify-center p-2">
              <img
                src={ClubImages.awayJersey}
                alt="Hadiya Hossana Away Kit"
                className="w-full h-full object-contain filter drop-shadow-xl"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-xxs font-bold uppercase">
                Away Match Kit
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-sports font-black text-lg text-white uppercase">
                Ivory White & Crimson Slash Away Kit
              </h3>
              <p className="text-xs text-slate-400">
                Performance lightweight fabric with embroidered gold crest.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-lg font-black font-sports text-amber-400">1,850 ETB</span>
              <button
                onClick={() => {
                  const item = shopItems.find((i) => i.id.includes('away')) || shopItems[1] || shopItems[0];
                  if (item) openCheckoutModal(item);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#7e1426] hover:bg-[#99192e] text-white text-xs font-bold uppercase transition-colors"
              >
                Order Kit
              </button>
            </div>
          </div>

          {/* Tigers Supporter Scarf & Fan Pass Card */}
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a050d] via-[#0d131f] to-[#070b13] border border-amber-500/30 p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xxs font-bold uppercase">
                <Trophy className="w-3.5 h-3.5" />
                <span>Official Tigers Membership</span>
              </div>
              <h3 className="text-2xl font-black font-sports text-white uppercase leading-tight">
                DIGITAL FAN PASS & SUPPORTER ID
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Register as an official club member. Receive your personalized digital card with QR code, matchday discounts, and voting rights in player awards.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090e17] border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Priority tickets at Abiyo Ermias Stadium</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>15% discount on all 2026/27 official kits</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official digital member pass on your phone</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage('membership')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 text-center"
            >
              Get Fan Pass Now
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SPONSOR PARTNERS BANNER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0a0f19] border border-slate-800/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xxs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Official Partners & Patrons
            </span>
            <div className="text-sm font-bold text-slate-200">
              Proudly Supported by Leading Ethiopian Brands
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-400">
            <span className="hover:text-amber-300 transition-colors">Habesha Breweries</span>
            <span className="hover:text-amber-300 transition-colors">Commercial Bank of Ethiopia</span>
            <span className="hover:text-amber-300 transition-colors">Hadiya Development Association</span>
            <span className="hover:text-amber-300 transition-colors">Wachemo University</span>
          </div>
        </div>
      </section>
    </div>
  );
};
