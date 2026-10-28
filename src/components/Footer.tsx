import React from 'react';
import { useClub, PageRoute } from '../context/ClubContext';
import { HadiyaCrest } from './HadiyaCrest';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Send,
  Heart,
  Trophy,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language, setCurrentPage, clubInfo, openDonationModal, openDossier } = useClub();

  const handleNav = (p: PageRoute) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const address = language === 'am'
    ? 'አብዮ ኤርሚያስ ስታዲየም የስፖርት ማዕከል፣ ቦቢቾ ጎዳና፣ ሆሳዕና፣ ኢትዮጵያ'
    : 'Abiyo Ermias Stadium Sports Complex, Bobicho Avenue, Hossana, Ethiopia';

  const officeHours = language === 'am'
    ? 'ከሰኞ - ቅዳሜ፡ 2:00 ጥዋት - 12:00 ከሰዓት (በጨዋታ ቀናት፡ 1:30 ጥዋት - 2:30 ምሽት)'
    : 'Monday – Saturday: 8:00 AM – 6:00 PM (Matchdays: 6:30 AM – 8:30 PM)';

  return (
    <footer className="bg-[#070b13] text-slate-300 border-t border-[#29131e]">
      {/* Cultural Hadiya Trim Header Strip */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/4 bg-[#831627]" />
        <div className="w-1/4 bg-[#d97706]" />
        <div className="w-1/4 bg-[#1e293b]" />
        <div className="w-1/4 bg-[#831627]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Club Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <HadiyaCrest size="lg" glow withRing />
              <div>
                <h3 className="font-sports font-black text-2xl tracking-wide text-white uppercase leading-tight">
                  {language === 'am' ? 'ሀዲያ ሆሳዕና' : 'HADIYA HOSSANA'}
                </h3>
                <p className="text-xs font-semibold text-amber-400">
                  {language === 'am' ? 'ነብሮቹ • ርግቦቹ' : 'The Tigers • The Peace Birds'}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {language === 'am' ? 'በ1998 ዓ.ም ተመሰረተ' : 'Est. 2006 G.C.'}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              {language === 'am'
                ? 'በኢትዮጵያ ፕሪሚየር ሊግ ተወዳዳሪ የሆነው የሆሳዕና እና የሀዲያ ኩራት። በጠንካራ ስነ-ምግባር እና በደጋፊዎች ፍቅር ወደ ታላቅ ድል!'
                : 'The official football club representing the heart and passion of Hossana and the Hadiya people in the Ethiopian Premier League.'}
            </p>

            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[#3b0b13] text-amber-200 border border-amber-500/25">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>ልብ የሞላው ድል · Courage & Glory</span>
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-sports font-bold text-base text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('fixtures')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-slate-300"
                >
                  <span className="w-1.5 h-1.5 bg-[#831627] rounded-full" />
                  {t.navFixtures}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('standings')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-slate-300"
                >
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  {t.navStandings}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('news')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-slate-300"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  {t.navNews}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('membership')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-slate-300"
                >
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span>{language === 'am' ? 'የነብሮቹ ደጋፊ አባልነት' : 'Tigers Fan Membership'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shop')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-slate-300"
                >
                  <span className="w-1.5 h-1.5 bg-[#831627] rounded-full" />
                  <span>{language === 'am' ? 'ይፋዊ ማሊያዎችና ሱቅ' : 'Official Kits & Shop'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-slate-300"
                >
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  {t.navAbout}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Stadium & Contact */}
          <div className="space-y-3">
            <h4 className="font-sports font-bold text-base text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              {language === 'am' ? 'ስታዲየም እና አድራሻ' : 'Home Stadium & Office'}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-slate-300">+251 46 555 1204 / +251 91 144 7799</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-slate-300">info@hadiyahossanafc.et</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug text-slate-400">{officeHours}</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={openDossier}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#141b29] hover:bg-[#1f283d] text-amber-300 text-xs font-semibold border border-slate-700/60 transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>View EPL Club Dossier</span>
              </button>
            </div>
          </div>

          {/* Col 4: Fan Community & Support */}
          <div className="space-y-4">
            <h4 className="font-sports font-bold text-base text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              {language === 'am' ? 'የደጋፊዎች ድጋፍ' : 'Support The Club'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'am'
                ? 'የክለቡን የታዳጊዎች አካዳሚ፣ የስታዲየም ማሻሻያ እና የደጋፊዎች ፕሮግራሞችን በቺፓ ይደግፉ።'
                : 'Support the youth academy, stadium facilities, and community football across Hadiya Zone with direct contributions.'}
            </p>

            <button
              onClick={openDonationModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'am' ? 'ክለቡን ይደግፉ' : 'Make Supporter Donation'}</span>
            </button>

            <div className="pt-2 flex items-center gap-2">
              <a
                href="https://t.me/hadiyahossanafc"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#131a26] hover:bg-[#1c2638] text-xs text-sky-400 border border-slate-800 transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Telegram</span>
              </a>
              <button
                onClick={() => handleNav('contact')}
                className="flex-1 px-2.5 py-1.5 rounded-md bg-[#131a26] hover:bg-[#1c2638] text-xs text-slate-300 border border-slate-800 transition-colors text-center"
              >
                {t.navContact}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Hadiya Hossana Football Club (ነብሮቹ). All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>Abiyo Ermias Stadium · Hossana</span>
            <span>·</span>
            <span>Ethiopian Premier League</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
