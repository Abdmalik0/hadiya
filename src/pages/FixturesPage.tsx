import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { HalabaCrest } from '../components/HalabaCrest';
import { EthiopianClubLogo } from '../components/EthiopianClubLogo';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  Zap,
  RefreshCw,
  Flame,
  Shield
} from 'lucide-react';
import {
  getLocalizedTeamName,
  getLocalizedVenue,
  getLocalizedCompetition,
  getLocalizedRound,
  getLocalizedStatus,
} from '../utils/localization';
import { formatTeamName } from '../utils/formatTeamName';

interface FixturesPageProps {
  onOpenMatchModal: (matchId: string) => void;
}

export const FixturesPage: React.FC<FixturesPageProps> = ({ onOpenMatchModal }) => {
  const {
    t,
    language,
    matches,
    openDossier,
    simulateLiveMatchAction,
    syncNow,
    isSyncing,
    isOnline,
  } = useClub();

  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'RESULTS'>('ALL');
  const [selectedComp, setSelectedComp] = useState<string>('ALL');

  // Competitions list
  const competitionList = Array.from(new Set(matches.map((m) => m.competition)));

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    if (activeTab === 'UPCOMING' && m.status !== 'UPCOMING') return false;
    if (activeTab === 'RESULTS' && m.status !== 'FINISHED') return false;
    if (selectedComp !== 'ALL' && m.competition !== selectedComp) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* EPL Official Status Banner */}
      <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-emerald-950 border border-red-800/60 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
            <Flame className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sports font-bold text-xs uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                {t.officialEplFixtures}
              </span>
              <span className="text-xs text-neutral-400">
                {t.eplCampaign}
              </span>
              {!isOnline ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 text-xxs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {language === 'am' ? 'ከመስመር ውጭ (የተቀመጠ)' : 'Offline Cache'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-xxs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'am' ? 'የቀጥታ' : 'Live Sync'}
                </span>
              )}
            </div>
            <h3 className="font-sports font-black text-xl text-white uppercase tracking-wider mt-1">
              {t.matchScheduleHeadline}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300">
              {t.liveAutoUpdateDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openDossier}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-bold font-sports uppercase tracking-wider transition-all"
          >
            <Shield className="w-4 h-4 text-amber-300" />
            <span>{t.clubDossier}</span>
          </button>

          <button
            onClick={simulateLiveMatchAction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-sports font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
            title="Simulate live kickoff or goal action"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>{t.simulateLiveAction}</span>
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span>{language === 'am' ? 'የጨዋታ መርሃ-ግብር 2026 / 2027' : 'Match Schedule 2026 / 2027'}</span>
            </div>
            <h1 className="font-sports font-black text-3xl sm:text-5xl text-white uppercase tracking-wider">
              {t.fixturesTitle}
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">{t.fixturesSubtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t.syncingStatus : t.syncNowBtn}</span>
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-300">
              {filteredMatches.length} {t.matchesShown}
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          {/* Main Status Tabs */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase font-sports tracking-wider transition-all ${
                activeTab === 'ALL'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase font-sports tracking-wider transition-all ${
                activeTab === 'UPCOMING'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.filterUpcoming}
            </button>
            <button
              onClick={() => setActiveTab('RESULTS')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase font-sports tracking-wider transition-all ${
                activeTab === 'RESULTS'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.filterResults}
            </button>
          </div>

          {/* Competition Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select
              value={selectedComp}
              onChange={(e) => setSelectedComp(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="ALL">{t.allCompetitions}</option>
              {competitionList.map((comp) => (
                <option key={comp} value={comp}>
                  {getLocalizedCompetition(comp, language)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-neutral-800">
          <p className="text-neutral-400 text-base">{t.noMatchesFound}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const isCompleted = match.status === 'FINISHED';
            const isLive = match.status === 'LIVE';
            const homeName = getLocalizedTeamName(match.homeTeam?.id, match.homeTeam?.name, language);
            const awayName = getLocalizedTeamName(match.awayTeam?.id, match.awayTeam?.name, language);
            const homeShort = formatTeamName(match.homeTeam?.id, homeName, language);
            const awayShort = formatTeamName(match.awayTeam?.id, awayName, language);
            const venue = getLocalizedVenue(match.venue, language);
            const roundText = getLocalizedRound(match.round, language);
            const compName = getLocalizedCompetition(match.competitionName || match.competition, language);

            return (
              <div
                key={match.id}
                onClick={() => onOpenMatchModal(match.id)}
                className="group cursor-pointer rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-red-600/50 p-4 sm:p-6 transition-all duration-200 hover:shadow-xl hover:shadow-black/60 flex flex-col justify-between overflow-hidden"
              >
                {/* Top card metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-neutral-800/80 text-xs">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <span className="font-bold text-amber-400 uppercase tracking-wider font-sports text-sm truncate">
                      {compName}
                    </span>
                    {roundText && (
                      <span className="text-neutral-500 hidden sm:inline truncate">• {roundText}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-shrink-0">
                    {isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {t.fullTime}
                      </span>
                    ) : isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-red-950 text-red-400 border border-red-800 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {t.liveNow}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {t.upcoming}
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Scoreboard Row (Flexible 3-Column Mobile-Safe Layout) */}
                <div className="py-5 sm:py-6 flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
                  {/* Home Team (Column 1: flex-1 min-w-0) */}
                  <div className="flex-1 min-w-0 flex items-center justify-end gap-2 sm:gap-3 text-right">
                    <div className="flex flex-col items-end min-w-0 truncate">
                      <span
                        className="font-sports font-black text-sm sm:text-lg md:text-xl text-white group-hover:text-red-400 transition-colors uppercase truncate min-w-0 max-w-full block"
                        title={homeName}
                      >
                        {homeShort}
                      </span>
                      <span className="text-xxs uppercase tracking-wider text-neutral-400 font-semibold truncate">
                        {t.home}
                      </span>
                    </div>
                    <div className="shrink-0 flex-shrink-0">
                      {match.homeTeam.isHalaba ? (
                        <HalabaCrest size={38} className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
                      ) : (
                        <EthiopianClubLogo teamId={match.homeTeam.id} teamName={homeName} size={38} className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Center Score / VS (Column 2: shrink-0 flex-shrink-0) */}
                  <div className="px-1.5 sm:px-4 text-center shrink-0 flex-shrink-0 flex flex-col items-center justify-center">
                    {(isCompleted || isLive) && match.score ? (
                      <div className="flex flex-col items-center">
                        <div
                          className={`font-sports font-black text-xl sm:text-2xl md:text-3xl bg-neutral-950 px-2.5 sm:px-3.5 py-1 rounded-xl border tracking-wider whitespace-nowrap shadow-md ${
                            isLive
                              ? 'text-amber-400 border-red-700 shadow-red-950/60'
                              : 'text-emerald-400 border-neutral-800'
                          }`}
                        >
                          {match.score.home} - {match.score.away}
                        </div>
                        {isLive ? (
                          <span className="text-xxs text-red-400 mt-1 font-mono font-bold flex items-center gap-1 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            {match.liveMinute}' ({match.livePeriod || t.liveNow})
                          </span>
                        ) : match.halftimeScore ? (
                          <span className="text-xxs text-neutral-500 mt-0.5 font-mono whitespace-nowrap">
                            ({language === 'am' ? 'እረፍት' : 'HT'} {match.halftimeScore.home}-{match.halftimeScore.away})
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="font-sports font-black text-lg sm:text-2xl text-neutral-500">
                          {t.vs}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-mono mt-0.5 whitespace-nowrap">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{match.kickoffTime}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Away Team (Column 3: flex-1 min-w-0) */}
                  <div className="flex-1 min-w-0 flex items-center justify-start gap-2 sm:gap-3 text-left">
                    <div className="shrink-0 flex-shrink-0">
                      {match.awayTeam.isHalaba ? (
                        <HalabaCrest size={38} className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
                      ) : (
                        <EthiopianClubLogo teamId={match.awayTeam.id} teamName={awayName} size={38} className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-col items-start min-w-0 truncate">
                      <span
                        className="font-sports font-black text-sm sm:text-lg md:text-xl text-white group-hover:text-red-400 transition-colors uppercase truncate min-w-0 max-w-full block"
                        title={awayName}
                      >
                        {awayShort}
                      </span>
                      <span className="text-xxs uppercase tracking-wider text-neutral-400 font-semibold truncate">
                        {t.away}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom card details */}
                <div className="pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <strong className="text-neutral-300">{match.date}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{venue}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-sports font-bold text-red-400 uppercase tracking-wider group-hover:text-red-300 transition-colors">
                    <span>{t.viewMatchDetails}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
