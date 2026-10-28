import React from 'react';
import { Match } from '../types';
import { EthiopianClubLogo } from './EthiopianClubLogo';
import { useClub } from '../context/ClubContext';
import { X, Calendar, MapPin, User, Users, Shield, Clock } from 'lucide-react';
import {
  getLocalizedTeamName,
  getLocalizedVenue,
  getLocalizedPersonName,
  getLocalizedCompetition,
} from '../utils/localization';

interface MatchDetailsModalProps {
  match: Match | null;
  onClose: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, onClose }) => {
  const { t, language } = useClub();

  if (!match) return null;

  const homeName = getLocalizedTeamName(match.homeTeam?.id, match.homeTeam?.name, language);
  const awayName = getLocalizedTeamName(match.awayTeam?.id, match.awayTeam?.name, language);
  const venue = getLocalizedVenue(match.venue, language);
  const compName = getLocalizedCompetition(match.competitionName || match.competition, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-neutral-900 to-green-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="font-sports font-bold text-lg text-white uppercase tracking-wider">
              {compName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Scoreboard / Teams banner */}
          <div className="p-6 rounded-xl bg-gradient-to-b from-neutral-950 to-neutral-900/90 border border-neutral-800 flex items-center justify-between">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <EthiopianClubLogo teamId={match.homeTeam.id} teamName={homeName} size={64} />
              <h4 className="mt-3 font-sports font-bold text-base sm:text-lg text-white">
                {homeName}
              </h4>
              <span className="text-xs uppercase text-neutral-400 font-semibold tracking-wider">
                {t.home}
              </span>
            </div>

            {/* Match Center: Score / VS */}
            <div className="px-4 flex flex-col items-center">
              {match.status === 'FINISHED' && match.score ? (
                <div className="text-center">
                  <div className="font-sports font-black text-3xl sm:text-4xl text-white tracking-widest bg-neutral-800/80 px-4 py-1.5 rounded-lg border border-neutral-700">
                    {match.score.home} - {match.score.away}
                  </div>
                  {match.halftimeScore && (
                    <span className="text-xs text-neutral-400 block mt-1">
                      {language === 'am' ? 'እረፍት' : 'HT'}: {match.halftimeScore.home} - {match.halftimeScore.away}
                    </span>
                  )}
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {t.fullTime}
                  </span>
                </div>
              ) : match.status === 'LIVE' && match.score ? (
                <div className="text-center">
                  <div className="font-sports font-black text-3xl sm:text-4xl text-emerald-400 tracking-widest bg-neutral-800 px-4 py-1 rounded-lg">
                    {match.score.home} - {match.score.away}
                  </div>
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-red-950 text-red-400 border border-red-800 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {t.liveNow}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <span className="font-sports font-black text-2xl sm:text-3xl text-neutral-400">
                    {t.vs}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{match.kickoffTime}</span>
                  </div>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {t.upcoming}
                  </span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <EthiopianClubLogo teamId={match.awayTeam.id} teamName={awayName} size={64} />
              <h4 className="mt-3 font-sports font-bold text-base sm:text-lg text-white">
                {awayName}
              </h4>
              <span className="text-xs uppercase text-neutral-400 font-semibold tracking-wider">
                {t.away}
              </span>
            </div>
          </div>

          {/* Match Metadata Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-neutral-400 block text-xs">{t.matchDate}</span>
                <span className="font-medium text-white">{match.date} • {match.kickoffTime} {t.eatTimezone}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-neutral-400 block text-xs">{t.matchVenue}</span>
                <span className="font-medium text-white">{venue}</span>
              </div>
            </div>

            {match.referee && (
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center gap-3">
                <User className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-neutral-400 block text-xs">{t.referee}</span>
                  <span className="font-medium text-white">
                    {getLocalizedPersonName(match.referee.split('(')[0].trim(), language)}
                  </span>
                </div>
              </div>
            )}

            {match.attendance && (
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center gap-3">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-neutral-400 block text-xs">{t.attendance}</span>
                  <span className="font-medium text-white">
                    {language === 'am' ? '15,000 (ሙሉ በሙሉ የተሞላ)' : match.attendance}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Goal Scorers (if finished/has scorers) */}
          {match.scorers && match.scorers.length > 0 && (
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <h5 className="font-sports font-bold text-sm uppercase text-neutral-300 tracking-wider mb-3">
                {t.goalsSummary}
              </h5>
              <div className="space-y-2">
                {match.scorers.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs sm:text-sm py-1.5 px-3 rounded bg-neutral-900 border border-neutral-800/80"
                  >
                    <div className="flex items-center gap-2">
                      <span>⚽</span>
                      <strong className="text-white">
                        {getLocalizedPersonName(s.player, language)}
                      </strong>
                      <span className="text-neutral-400 text-xs">
                        ({s.team === 'home' ? homeName : awayName})
                      </span>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">{s.minute}'</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match Summary / Recap */}
          {match.summary && (
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              <strong className="text-white block mb-1 font-sports uppercase text-xs tracking-wider">
                {language === 'am' ? 'የጨዋታው ማጠቃለያ፡' : 'Match Summary:'}
              </strong>
              {language === 'am'
                ? match.summary
                    .replace(/Halaba Ketema/g, 'ሀላባ ከተማ')
                    .replace(/Fasil Kenema/g, 'ፋሲል ከነማ')
                    .replace(/Bahir Dar Kenema/g, 'ባሕር ዳር ከነማ')
                    .replace(/Kaleb Amankwah/g, 'ካሌብ አማንክዋህ')
                    .replace(/Romaric/g, 'ሮማሪክ')
                    .replace(/Yonatan Hailu/g, 'ዮናታን ኃይሉ')
                    .replace(/draw/g, 'አቻ')
                    .replace(/Round/g, 'ሳምንት')
                : match.summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
