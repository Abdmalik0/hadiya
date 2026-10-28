import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { getLocalizedTeamName } from '../utils/localization';
import {
  RefreshCw,
  Radio,
  Zap,
  Clock,
  Play,
  Pause,
  ChevronDown,
  Trophy,
  Check
} from 'lucide-react';

export const LiveSyncBar: React.FC = () => {
  const {
    t,
    language,
    isAutoSyncEnabled,
    toggleAutoSync,
    autoSyncInterval,
    setAutoSyncInterval,
    secondsUntilNextSync,
    isSyncing,
    syncNow,
    simulateLiveMatchAction,
    advanceLeagueMatchday,
    matches,
    setSelectedMatchId,
  } = useClub();

  const [intervalDropdownOpen, setIntervalDropdownOpen] = useState(false);

  // Check if any match is currently LIVE
  const liveMatch = matches.find((m) => m.status === 'LIVE');

  const intervals = [
    { label: language === 'am' ? '15 ሰከንድ (ፈጣን)' : '15s (Fast)', value: 15 },
    { label: language === 'am' ? '30 ሰከንድ (መደበኛ)' : '30s (Default)', value: 30 },
    { label: language === 'am' ? '60 ሰከንድ (1 ደቂቃ)' : '60s (1 min)', value: 60 },
  ];

  return (
    <div className="bg-neutral-950/90 border-b border-neutral-800 text-xs px-4 py-2 text-neutral-300 relative z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Feed status + Live Match Ticker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isAutoSyncEnabled ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </>
              ) : (
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-neutral-600" />
              )}
            </span>
            <span className="font-sports font-bold uppercase tracking-wider text-white hidden sm:inline">
              {isAutoSyncEnabled ? t.liveAutoSyncActive : t.liveAutoSyncPaused}
            </span>
          </div>

          {/* Current Live Match Highlight (if match ongoing) */}
          {liveMatch ? (
            <button
              onClick={() => setSelectedMatchId(liveMatch.id)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/90 border border-red-800/80 hover:bg-red-900/90 text-red-200 transition-colors animate-pulse cursor-pointer"
              title={language === 'am' ? 'የቀጥታ ጨዋታውን ማዕከል ለማየት ይጫኑ' : 'Click to view live match center'}
            >
              <Radio className="w-3.5 h-3.5 text-red-400" />
              <span className="font-sports font-black text-amber-300">
                {liveMatch.liveMinute}'
              </span>
              <span className="font-bold text-white">
                {getLocalizedTeamName(liveMatch.homeTeam?.id, liveMatch.homeTeam?.name, language)}{' '}
                <span className="text-amber-400 font-mono">
                  {liveMatch.score?.home ?? 0} - {liveMatch.score?.away ?? 0}
                </span>{' '}
                {getLocalizedTeamName(liveMatch.awayTeam?.id, liveMatch.awayTeam?.name, language)}
              </span>
            </button>
          ) : (
            <span className="text-neutral-400 hidden md:inline">
              {language === 'am'
                ? 'አውቶማቲክ የጨዋታ መርሃ-ግብር እና የሰንጠረዥ ማዘመኛ ሞተር'
                : 'Automated match schedule and standings recalculation engine'}
            </span>
          )}
        </div>

        {/* Right: Controls & Simulation Actions */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Countdown timer badge */}
          {isAutoSyncEnabled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xxs">
              <Clock className="w-3 h-3 text-neutral-500" />
              <span>{t.nextSyncIn}:</span>
              <strong className="text-amber-400 w-5 text-right font-bold">
                {secondsUntilNextSync}s
              </strong>
            </div>
          )}

          {/* Manual Sync Now Button */}
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-semibold transition-all disabled:opacity-60 active:scale-95 cursor-pointer"
            title={language === 'am' ? 'አሁን አድስ' : 'Fetch and recalculate now'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t.syncingStatus : t.syncNowBtn}</span>
          </button>

          {/* Quick Simulation Trigger (Live Goal / Event) */}
          <button
            onClick={simulateLiveMatchAction}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-sports font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            title={language === 'am' ? 'የቀጥታ ግብ አስመስል' : 'Simulate live match action, goals, and table shifts'}
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span className="hidden sm:inline">
              {language === 'am' ? 'የቀጥታ ግብ አስመስል' : 'Simulate Live Goal'}
            </span>
            <span className="sm:hidden">{language === 'am' ? 'ግብ!' : 'Goal!'}</span>
          </button>

          {/* Official League Sync */}
          <button
            onClick={advanceLeagueMatchday}
            disabled={isSyncing}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-sports font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            title={language === 'am' ? 'ይፋዊ የሊግ መረጃዎችን አመሳስል' : 'Fetch latest verified standings from TheSportsDB'}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'am' ? 'ሊጉን አመሳስል' : 'Sync Official League'}</span>
          </button>

          {/* Interval & Pause Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIntervalDropdownOpen(!intervalDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={language === 'am' ? 'የማዘመኛ ፍጥነት ቀይር' : 'Change update interval'}
            >
              <span>{isAutoSyncEnabled ? `${autoSyncInterval}s` : (language === 'am' ? 'ቆሟል' : 'Paused')}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {intervalDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-neutral-900 rounded-xl shadow-2xl border border-neutral-700 py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-xxs font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
                  {language === 'am' ? 'የማዘመኛ ድግግሞሽ' : 'Update Frequency'}
                </div>

                {intervals.map((intv) => (
                  <button
                    key={intv.value}
                    onClick={() => {
                      setAutoSyncInterval(intv.value);
                      if (!isAutoSyncEnabled) toggleAutoSync();
                      setIntervalDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isAutoSyncEnabled && autoSyncInterval === intv.value
                        ? 'bg-red-600/20 text-red-400 font-bold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span>{intv.label}</span>
                    {isAutoSyncEnabled && autoSyncInterval === intv.value && (
                      <Check className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </button>
                ))}

                <button
                  onClick={() => {
                    toggleAutoSync();
                    setIntervalDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between text-neutral-300 hover:bg-neutral-800 border-t border-neutral-800 mt-1 cursor-pointer"
                >
                  <span>
                    {isAutoSyncEnabled
                      ? (language === 'am' ? 'አውቶማቲክ ማመሳሰልን አቁም' : 'Pause Auto-Update')
                      : (language === 'am' ? 'አውቶማቲክ ማመሳሰልን ቀጥል' : 'Resume Auto-Update')}
                  </span>
                  {isAutoSyncEnabled ? (
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
