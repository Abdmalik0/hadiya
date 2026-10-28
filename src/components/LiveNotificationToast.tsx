import React from 'react';
import { useClub } from '../context/ClubContext';
import { X, Flame, Trophy, RefreshCw, Radio } from 'lucide-react';

export const LiveNotificationToast: React.FC = () => {
  const { liveNotifications, dismissNotification } = useClub();

  if (liveNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm sm:max-w-md w-full pointer-events-none">
      {liveNotifications.map((n) => {
        const isGoal = n.type === 'goal';
        const isStandings = n.type === 'standings';
        const isMatch = n.type === 'match_start' || n.type === 'match_end';

        return (
          <div
            key={n.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-top-4 duration-300 ${
              isGoal
                ? 'bg-red-950/95 border-red-500 text-white shadow-red-950/80 ring-1 ring-red-500'
                : isStandings
                ? 'bg-neutral-900/95 border-emerald-500 text-white shadow-emerald-950/60 ring-1 ring-emerald-500'
                : isMatch
                ? 'bg-neutral-900/95 border-amber-500 text-white shadow-amber-950/60 ring-1 ring-amber-500'
                : 'bg-neutral-900/95 border-neutral-700 text-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-md ${
                    isGoal
                      ? 'bg-red-600 text-white animate-bounce'
                      : isStandings
                      ? 'bg-emerald-600 text-white'
                      : isMatch
                      ? 'bg-amber-500 text-black'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {isGoal ? (
                    <Flame className="w-5 h-5 text-white" />
                  ) : isStandings ? (
                    <Trophy className="w-5 h-5 text-white" />
                  ) : isMatch ? (
                    <Radio className="w-5 h-5" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sports font-black text-sm uppercase tracking-wider text-amber-400">
                      {n.title}
                    </span>
                    <span className="text-xxs text-neutral-400 font-mono">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-snug font-medium">
                    {n.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => dismissNotification(n.id)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
