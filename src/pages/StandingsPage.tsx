import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext';
import { HalabaCrest } from '../components/HalabaCrest';
import { EthiopianClubLogo } from '../components/EthiopianClubLogo';
import { Trophy, Filter, ShieldCheck, RefreshCw, Calculator, CheckCircle2 } from 'lucide-react';
import { getLocalizedTeamName, getFormBadgeLocalized } from '../utils/localization';
import { formatTeamName } from '../utils/formatTeamName';

export const StandingsPage: React.FC = () => {
  const { t, language, standings, isSyncing, syncNow, resetStandings, recalculateStandingsFromMatches, isOnline } = useClub();
  const [competition, setCompetition] = useState('ETHIOPIAN_PREMIER_LEAGUE');
  const [recalculating, setRecalculating] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);

  const halabaStanding = standings.find((s) => s.isHalaba) || standings[0];
  const halabaName = halabaStanding ? getLocalizedTeamName(halabaStanding.teamId, halabaStanding.teamName, language) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header & Controls */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span>{t.standingsEplBadge}</span>
            </div>
            <h1 className="font-sports font-black text-3xl sm:text-5xl text-white uppercase tracking-wider">
              {t.standingsTitle}
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">{t.standingsSubtitle}</p>
            <div className="flex items-center gap-2 mt-2">
              {!isOnline ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xxs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {language === 'am' ? 'የተቀመጠ መረጃ (ከመስመር ውጭ)' : 'Instant Cache Active (Offline)'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xxs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'am' ? 'የቀጥታ ግንኙነት ነቅቷል' : 'Live Cloud Connected'}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Auto Recalculate Table from Match Results Button */}
            <button
              onClick={async () => {
                setRecalculating(true);
                await recalculateStandingsFromMatches();
                setRecalculating(false);
                setRecalcSuccess(true);
                setTimeout(() => setRecalcSuccess(false), 3000);
              }}
              disabled={recalculating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sports font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              title="Recalculate all 18 club points and goal differences from finished match fixtures"
            >
              {recalcSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <Calculator className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              )}
              <span>
                {recalcSuccess
                  ? (language === 'am' ? 'ተዘምኗል!' : 'Updated!')
                  : (language === 'am' ? 'ከውጤቶች አድስ' : 'Update from Match Results')}
              </span>
            </button>

            {/* Live Sync Button */}
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-sports font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50"
              title="Sync directly with TheSportsDB official data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t.syncingStatus : t.syncTheSportsDb}</span>
            </button>

            {/* Hard Reset Button */}
            <button
              onClick={async () => {
                await resetStandings();
                await syncNow();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-sports font-bold text-xs uppercase tracking-wider border border-neutral-700 transition-all active:scale-95"
              title="Clear all local caches and re-seed official 18-club Premier League table"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.resetTable}</span>
            </button>

            {/* Competition Selector */}
            <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
              <Filter className="w-4 h-4 text-neutral-400 ml-2" />
              <select
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                className="bg-transparent text-neutral-200 text-xs sm:text-sm font-semibold rounded-lg px-2 py-1.5 focus:outline-none"
              >
                <option value="ETHIOPIAN_PREMIER_LEAGUE">
                  {language === 'am' ? 'የኢትዮጵያ ፕሪሚየር ሊግ (ከፍተኛ ዲቪዚዮን) • ይፋዊ' : 'Ethiopian Premier League (Top Tier) • Official'}
                </option>
                <option value="ETHIOPIAN_CUP">
                  {language === 'am' ? 'የኢትዮጵያ ዋንጫ 2026/27' : 'Ethiopian Cup 2026/27'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Verified League Status Summary Card */}
        {halabaStanding && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-neutral-950 to-emerald-950/60 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HalabaCrest size={44} showGlow />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-sports font-bold text-xs uppercase tracking-wider">
                    {t.officialLeagueStatus} {halabaStanding.position === 1 ? t.firstPlace : halabaStanding.position === 2 ? t.secondPlace : halabaStanding.position === 3 ? t.thirdPlace : language === 'am' ? `${halabaStanding.position}ኛ ደረጃ` : language === 'om' ? `Sadarkaa ${halabaStanding.position}ffaa` : `${halabaStanding.position}th Place`}
                  </span>
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider hidden sm:inline">
                    • {language === 'am' ? 'የኢትዮጵያ ፕሪሚየር ሊግ (ከፍተኛ ዲቪዚዮን)' : 'Ethiopian Premier League (Top Tier)'}
                  </span>
                </div>
                <h3 className="font-sports font-black text-white text-lg sm:text-xl mt-0.5">
                  {language === 'am'
                    ? halabaStanding.position === 1
                      ? 'ሀዲያ ሆሳዕና (ነብሮቹ) የኢትዮጵያ ፕሪሚየር ሊግን ይመራል'
                      : `ሀዲያ ሆሳዕና (ነብሮቹ) በደረጃ #${halabaStanding.position} ላይ ይገኛል (${halabaStanding.points} ነጥብ • ያለመሸነፍ ጉዞ)`
                    : halabaStanding.position === 1
                    ? 'Hadiya Hossana FC (The Tigers) leads the Ethiopian Premier League'
                    : `Hadiya Hossana FC (The Tigers) stands in position #${halabaStanding.position} (${halabaStanding.points} Pts • Undefeated Campaign)`}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 self-start md:self-auto bg-neutral-950/80 px-4 py-2 rounded-lg border border-neutral-800 text-xs font-mono">
              <div>
                <span className="text-neutral-400 block text-xxs uppercase">{t.points}</span>
                <span className="text-amber-400 font-black text-base">{halabaStanding.points} {t.pts}</span>
              </div>
              <div className="h-6 w-px bg-neutral-800" />
              <div>
                <span className="text-neutral-400 block text-xxs uppercase">{t.record}</span>
                <span className="text-white font-bold">{halabaStanding.played} ({halabaStanding.won}{language === 'am' ? 'አ' : 'W'} - {halabaStanding.drawn}{language === 'am' ? 'አቻ' : 'D'} - {halabaStanding.lost}{language === 'am' ? 'ተ' : 'L'})</span>
              </div>
              <div className="h-6 w-px bg-neutral-800" />
              <div>
                <span className="text-neutral-400 block text-xxs uppercase">{t.goalsGd}</span>
                <span className="text-emerald-400 font-bold">{halabaStanding.goalsFor} {t.gf} / {halabaStanding.goalsAgainst} {t.ga} ({halabaStanding.goalDifference > 0 ? `+${halabaStanding.goalDifference}` : halabaStanding.goalDifference})</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend / Key */}
        <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span className="text-neutral-300 font-medium">{t.cafChampionsLeagueQual}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-emerald-300 font-medium">{t.cafConfedCupQual}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-600" />
            <span>{t.relegationZoneDesc}</span>
          </div>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden max-w-full">
        <div className="overflow-x-auto max-w-full rounded-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800 text-xs uppercase font-sports font-bold tracking-wider text-neutral-400">
                <th className="py-3.5 px-3 sm:px-4 text-center w-10 sm:w-12">{t.pos}</th>
                <th className="py-3.5 px-3 sm:px-4 min-w-[150px]">{t.club}</th>
                <th className="py-3.5 px-2.5 sm:px-3 text-center w-10">{t.played}</th>
                <th className="py-3.5 px-2.5 sm:px-3 text-center w-10">{t.won}</th>
                <th className="py-3.5 px-2.5 sm:px-3 text-center w-10">{t.drawn}</th>
                <th className="py-3.5 px-2.5 sm:px-3 text-center w-10">{t.lost}</th>
                <th className="py-3.5 px-2.5 sm:px-3 text-center w-10 hidden md:table-cell">{t.gf}</th>
                <th className="py-3.5 px-2.5 sm:px-3 text-center w-10 hidden md:table-cell">{t.ga}</th>
                <th className="py-3.5 px-2.5 sm:px-3 text-center w-12">{t.gd}</th>
                <th className="py-3.5 px-3 sm:px-4 text-center font-black w-12">{t.pts}</th>
                <th className="py-3.5 px-3 sm:px-4 text-center hidden sm:table-cell w-24">{t.form}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {standings.map((team) => {
                const isLeader = team.position === 1;
                const isConfed = team.position === 2;
                const isRelegation = team.position >= 16;
                const localizedName = getLocalizedTeamName(team.teamId, team.teamName, language);
                const shortName = formatTeamName(team.teamId, localizedName, language);

                return (
                  <tr
                    key={team.teamId}
                    className={`transition-colors ${
                      team.isHalaba
                        ? 'bg-gradient-to-r from-red-950/80 via-neutral-900 to-green-950/40 border-l-4 border-l-amber-500 font-bold'
                        : 'hover:bg-neutral-800/40'
                    }`}
                  >
                    {/* Position */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          isLeader
                            ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-neutral-950 shadow-md shadow-amber-950 font-black'
                            : isConfed
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : isRelegation
                            ? 'bg-red-950/60 text-red-400 border border-red-900'
                            : 'text-neutral-400 bg-neutral-950/50'
                        }`}
                      >
                        {team.position}
                      </span>
                    </td>

                    {/* Club */}
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <EthiopianClubLogo teamId={team.teamId} teamName={localizedName} size={32} badgeUrl={team.badgeUrl} className="shrink-0 flex-shrink-0" />
                        <div className="min-w-0 truncate">
                          <span
                            className={`font-sports text-sm sm:text-base tracking-wide truncate max-w-[140px] sm:max-w-none block ${
                              team.isHalaba ? 'text-red-400 font-black text-base sm:text-lg' : 'text-neutral-200'
                            }`}
                            title={localizedName}
                          >
                            {shortName}
                          </span>
                          {team.isHalaba && (
                            <span className="block text-xxs uppercase tracking-wider text-emerald-400 font-sans truncate">
                              {t.officialClub}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-4 px-3 text-center text-neutral-300">{team.played}</td>
                    <td className="py-4 px-3 text-center text-emerald-400 font-semibold">{team.won}</td>
                    <td className="py-4 px-3 text-center text-amber-300">{team.drawn}</td>
                    <td className="py-4 px-3 text-center text-red-400">{team.lost}</td>
                    <td className="py-4 px-3 text-center text-neutral-400 hidden md:table-cell">{team.goalsFor}</td>
                    <td className="py-4 px-3 text-center text-neutral-400 hidden md:table-cell">{team.goalsAgainst}</td>
                    <td className="py-4 px-3 text-center font-mono">
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>
                    <td className="py-4 px-4 text-center font-sports font-black text-lg text-white">
                      {team.points}
                    </td>

                    {/* Form Guide */}
                    <td className="py-4 px-4 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {team.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded flex items-center justify-center text-xxs font-bold text-white uppercase ${
                              res === 'W'
                                ? 'bg-emerald-600'
                                : res === 'D'
                                ? 'bg-amber-600'
                                : 'bg-red-600'
                            }`}
                          >
                            {getFormBadgeLocalized(res, language)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
