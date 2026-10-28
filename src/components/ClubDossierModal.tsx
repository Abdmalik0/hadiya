import React from 'react';
import { HadiyaCrest } from './HadiyaCrest';
import { EthiopianClubLogo } from './EthiopianClubLogo';
import { useClub } from '../context/ClubContext';
import {
  Trophy,
  Shield,
  Award,
  CheckCircle2,
  X,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  getLocalizedTeamName,
  getLocalizedVenue,
  getLocalizedRound,
  getLocalizedCompetition,
} from '../utils/localization';

interface ClubDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClubDossierModal: React.FC<ClubDossierModalProps> = ({ isOpen, onClose }) => {
  const { language, t, matches } = useClub();

  if (!isOpen) return null;

  const premierLeagueMatches = matches.filter(
    (m) => m.competition === 'ETHIOPIAN_PREMIER_LEAGUE' || m.competitionName.includes('Premier')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0d131f] border border-[#3d1320] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-[#470914] via-[#1a060d] to-[#0c121e] border-b border-[#3b121e] flex items-start justify-between">
          <div className="flex items-center gap-4">
            <HadiyaCrest size="xl" glow withRing />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-[#661120] border border-amber-500/40 text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'am' ? 'የኢትዮጵያ ፕሪሚየር ሊግ ይፋዊ የክለብ ሰነድ' : 'Ethiopian Premier League Official Dossier'}</span>
              </div>
              <h2 className="font-sports font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
                {language === 'am' ? 'ሀዲያ ሆሳዕና እግር ኳስ ክለብ' : 'HADIYA HOSSANA FC'}
              </h2>
              <p className="text-amber-400 font-bold text-sm sm:text-base font-ethiopic">
                {language === 'am' ? 'ቅጽል ስም፡ “ነብሮቹ” (ርግቦቹ) • የተመሰረተበት ዓመት፡ 1998 ዓ.ም (2006 G.C.)' : 'Nickname: “The Tigers” (ነብሮቹ) / The Peace Birds • Founded 2006 G.C.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#182133] hover:bg-[#25324d] text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 text-slate-200">
          {/* Quick Facts Grid */}
          <div>
            <h3 className="font-sports font-black text-xl text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>{language === 'am' ? 'ይፋዊ የክለቡ መረጃ እና ማንነት' : 'Club Facts & Information'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121826] p-4 rounded-2xl border border-slate-800">
                <div className="text-xxs uppercase font-mono text-slate-400">{language === 'am' ? 'ይፋዊ ስም' : 'Club Name'}</div>
                <div className="text-sm font-bold text-white mt-1">Hadiya Hossana Football Club</div>
                <div className="text-xs text-amber-400 font-ethiopic">ሀዲያ ሆሳዕና እግር ኳስ ክለብ</div>
              </div>

              <div className="bg-[#121826] p-4 rounded-2xl border border-slate-800">
                <div className="text-xxs uppercase font-mono text-slate-400">{language === 'am' ? 'ስታዲየም' : 'Home Stadium'}</div>
                <div className="text-sm font-bold text-white mt-1">Abiyo Ermias Stadium</div>
                <div className="text-xs text-slate-400">Hossana · 18,500 Seats</div>
              </div>

              <div className="bg-[#121826] p-4 rounded-2xl border border-slate-800">
                <div className="text-xxs uppercase font-mono text-slate-400">{language === 'am' ? 'ውድድር' : 'League Division'}</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">Ethiopian Premier League</div>
                <div className="text-xs text-slate-400">Top Tier Division</div>
              </div>

              <div className="bg-[#121826] p-4 rounded-2xl border border-slate-800">
                <div className="text-xxs uppercase font-mono text-slate-400">{language === 'am' ? 'የክለቡ ቀለሞች' : 'Club Colors'}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-4 h-4 rounded-full bg-[#831627] border border-white/20" title="Crimson Maroon" />
                  <span className="w-4 h-4 rounded-full bg-[#d97706] border border-white/20" title="Heritage Gold" />
                  <span className="w-4 h-4 rounded-full bg-[#0b111e] border border-white/20" title="Obsidian Slate" />
                  <span className="text-xs text-slate-300 font-medium">Maroon, Gold & Slate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Crest Symbolism */}
          <div className="bg-[#121826] p-6 rounded-3xl border border-slate-800 space-y-4">
            <h4 className="font-sports font-black text-lg text-white uppercase tracking-wide flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Official Crest Heritage</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                <strong>The Dove of Peace:</strong> In the center of the crest flies the white dove, symbolizing peace, brotherhood, and fair play across the Hadiya zone and the nation.
              </p>
              <p>
                <strong>Wheat Ears of Hossana:</strong> Flanking the emblem are golden agricultural wheat sheaves, honoring the bountiful fertile soil and agrarian industriousness of the southern highlands.
              </p>
              <p>
                <strong>The Cultural Ribbon:</strong> Woven across the crest is the traditional Hadiya patterned textile ribbon, paying homage to ancestral craftsmanship.
              </p>
              <p>
                <strong>The Football & Athletes:</strong> Signifies modern athletic progress, youth empowerment, and the collective pursuit of victory.
              </p>
            </div>
          </div>

          {/* Verified EPL Fixtures Schedule */}
          <div>
            <h3 className="font-sports font-black text-xl text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Ethiopian Premier League Campaign</span>
            </h3>

            <div className="space-y-3">
              {premierLeagueMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#121826] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-xxs font-mono text-amber-400 font-bold uppercase">
                      {m.round || 'Round'} · {m.date} ({m.kickoffTime} EAT)
                    </div>
                    <div className="font-bold text-sm text-white">
                      {m.homeTeam?.name} vs {m.awayTeam?.name}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{m.venue}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {m.status === 'FINISHED' ? (
                      <span className="px-3 py-1 rounded-md bg-slate-800 text-amber-300 font-mono font-bold text-xs">
                        {m.score?.home ?? 0} - {m.score?.away ?? 0} (FT)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-md bg-[#661120] text-amber-200 font-semibold text-xs border border-amber-500/30">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0f19] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#661120] hover:bg-[#7e1426] text-white text-xs font-bold uppercase transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
