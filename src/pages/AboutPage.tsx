import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { HadiyaCrest } from '../components/HadiyaCrest';
import { ClubImages } from '../assets/images';
import {
  Trophy,
  History,
  Shield,
  MapPin,
  Users,
  Award,
  ChevronRight,
  Flame,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  getLocalizedPersonName,
  getLocalizedPosition,
  getLocalizedRole,
  getLocalizedDepartment,
} from '../utils/localization';

export const AboutPage: React.FC = () => {
  const { t, language, clubInfo, players, staff } = useClub();
  const [squadFilter, setSquadFilter] = useState<string>('ALL');

  const filteredPlayers = players.filter((p) => {
    if (squadFilter === 'ALL') return true;
    return p.position === squadFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#21050d] via-[#101624] to-[#0a0f18] p-6 sm:p-10 rounded-3xl border border-[#3d1320] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#661120]/40 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'am' ? 'የክለቡ ታሪክና ቅርስ' : 'Club Heritage & Identity'}</span>
            </div>
            <h1 className="font-sports font-black text-4xl sm:text-6xl text-white uppercase tracking-tight leading-none">
              HADIYA HOSSANA FC
            </h1>
            <p className="text-amber-200/90 font-bold font-ethiopic text-lg">
              {language === 'am' ? 'ሀዲያ ሆሳዕና እግር ኳስ ክለብ - ነብሮቹ (ርግቦቹ)' : 'The Tigers of Hadiya · The Peace Birds · Founded 2006'}
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {language === 'am'
                ? 'በኢትዮጵያ ፕሪሚየር ሊግ በከፍተኛ ብቃት የሚወዳደረው የሆሳዕና ከተማና የሀዲያ ዞን ህዝብ ኩራት። በታላቅ ታሪክ እና በወጣት ተሰጥኦዎች ወደ ላቀ ደረጃ!'
                : 'Representing the spirit, resilience, and rich heritage of Hossana and the Hadiya people in the elite tier of Ethiopian football.'}
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-center">
            <HadiyaCrest size="2xl" glow withRing />
          </div>
        </div>
      </div>

      {/* 2. Club History & The Tigers Identity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* History */}
        <div className="bg-[#0c121e] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#470914] text-amber-300 border border-amber-500/30 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <h2 className="font-sports font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
                {language === 'am' ? 'የክለቡ አመሰራረትና ጉዞ' : 'The Tigers Journey'}
              </h2>
            </div>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {language === 'am'
                ? 'ሀዲያ ሆሳዕና እግር ኳስ ክለብ በ1998 ዓ.ም (2006 G.C.) በሆሳዕና ከተማ ተመሠረተ። ከተመሠረተበት ጊዜ አንስቶ በደቡብ ክልልና በኢትዮጵያ እግር ኳስ ውስጥ አመርቂ ውጤቶችን በማስመዝገብ ወደ ኢትዮጵያ ፕሪሚየር ሊግ ተቀላቅሏል።'
                : 'Founded in 2006 in Hossana, Hadiya Hossana Football Club rose steadily through Ethiopian football divisions through relentless teamwork, community passion, and highland endurance, quickly establishing itself as a formidable Ethiopian Premier League contender.'}
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {language === 'am'
                ? 'ክለቡ በደጋፊዎቹ ዘንድ "ነብሮቹ" እና "ርግቦቹ" እየተባለ የሚጠራ ሲሆን፥ በአብዮ ኤርሚያስ ስታዲየም የሚያደርጋቸው ጨዋታዎች በታላቅ ድባብ እና በህዝብ ፍቅር የታጀቡ ናቸው።'
                : 'Known affectionately as "The Tigers" (Nebrochu) and "The Peace Birds" (Rigbochu), the club plays its home matches before capacity crowds at Abiyo Ermias Stadium, transforming Hossana into one of the most formidable fortresses in East African football.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>{language === 'am' ? 'የተመሰረተበት፡ 1998 ዓ.ም' : 'Founded: 2006 G.C.'}</span>
            <span className="text-amber-400 font-bold font-mono">Hossana, Central Ethiopia</span>
          </div>
        </div>

        {/* Crest Symbolism */}
        <div className="bg-[#0c121e] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h2 className="font-sports font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
                {language === 'am' ? 'የክለቡ አርማ ትርጉም' : 'Official Crest Symbolism'}
              </h2>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400">1.</span>
                <span><strong>The White Flying Dove:</strong> Embodies peace, harmony, and sportsmanship across the Hadiya nation.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400">2.</span>
                <span><strong>The Golden Wheat Ears:</strong> Symbolizes the fertile highland agriculture and hard-working harvest heritage of Hossana.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400">3.</span>
                <span><strong>Crimson Red & Cultural Sash:</strong> Honors traditional Hadiya textile artistry with black, red, and white cultural woven bands.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400">4.</span>
                <span><strong>Unified Athletes Silhouette:</strong> Represents solidarity, collective youth empowerment, and unstoppable team spirit.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Official Colors: Crimson Maroon & Gold</span>
            <span className="text-amber-400 font-bold">The Tigers</span>
          </div>
        </div>
      </div>

      {/* 3. Core Club Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0c121e] border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#470914] text-amber-300 border border-amber-500/30 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-sports font-bold text-xl text-white uppercase">Our Sporting Mission</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            To compete at the pinnacle of Ethiopian and African football through tactical excellence, youth academy scouting, and ethical football stewardship.
          </p>
        </div>

        <div className="bg-[#0c121e] border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#141b29] text-amber-300 border border-slate-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-sports font-bold text-xl text-white uppercase">Our Heritage Vision</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            To be a beacon of pride for Hossana and the Hadiya zone, creating sustainable sports infrastructure and inspiring future generations of athletes.
          </p>
        </div>

        <div className="bg-[#0c121e] border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#470914] text-amber-300 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-sports font-bold text-xl text-white uppercase">Honors & Milestones</h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">★</span>
              <span>Ethiopian Premier League Top 3 Contender</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">★</span>
              <span>Ethiopian Cup Finalist & Continental Qualifiers</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">★</span>
              <span>Regional Championship Champions</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Squad Roster */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              First Team Roster
            </div>
            <h2 className="text-3xl font-black font-sports uppercase tracking-tight text-white">
              HADIYA HOSSANA SQUAD 2026/27
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#090d16] rounded-xl border border-slate-800">
            {['ALL', 'GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSquadFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase transition-colors ${
                  squadFilter === filter
                    ? 'bg-[#7e1426] text-amber-200 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-amber-500/30 transition-all p-5 shadow flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl font-black font-sports text-amber-400 font-mono">
                    #{player.number}
                  </span>
                  <div className="font-bold text-base text-white mt-1">
                    {getLocalizedPersonName(player.name, language)}
                  </div>
                  <span className="text-xxs text-amber-300/80 uppercase font-semibold">
                    {getLocalizedPosition(player.position, language)}
                  </span>
                </div>
                {player.isCaptain && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                    Captain
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                {player.biography}
              </p>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-xxs text-slate-400 font-mono">
                <span>Apps: {player.appearances}</span>
                <span>Goals: {player.goals}</span>
                <span>{player.height}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Technical Staff */}
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            Leadership & Technical Staff
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-sports uppercase tracking-tight text-white">
            COACHING & MEDICAL DIRECTORS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl bg-[#0c121e] border border-slate-800 p-5 space-y-2 shadow"
            >
              <div className="font-bold text-base text-white">
                {getLocalizedPersonName(member.name, language)}
              </div>
              <div className="text-xs text-amber-400 font-semibold uppercase">
                {getLocalizedRole(member.role, language)}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {member.biography}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
