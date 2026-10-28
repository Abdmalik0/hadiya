import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Search, ChevronRight, Newspaper } from 'lucide-react';
import { getLocalizedCategory } from '../utils/localization';
import { ClubImages } from '../assets/images';

interface NewsPageProps {
  onOpenArticleModal: (articleId: string) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onOpenArticleModal }) => {
  const { t, language, news } = useClub();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Array<{ id: string; label: string }> = [
    { id: 'ALL', label: t.catAll },
    { id: 'CLUB_NEWS', label: t.catClubNews },
    { id: 'MATCH_REPORTS', label: t.catMatchReports },
    { id: 'TRANSFERS', label: t.catTransfers },
    { id: 'INTERVIEWS', label: t.catInterviews },
    { id: 'ACADEMY', label: t.catAcademy },
    { id: 'COMMUNITY', label: t.catCommunity },
  ];

  const resolveText = (val: unknown): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const obj = val as Record<string, string>;
      return obj[language] || obj.en || Object.values(obj)[0] || '';
    }
    return String(val);
  };

  const filteredNews = news.filter((art) => {
    if (selectedCategory !== 'ALL' && art.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const title = resolveText(art.title).toLowerCase();
      const summary = resolveText(art.summary).toLowerCase();
      return title.includes(q) || summary.includes(q);
    }
    return true;
  });

  const featuredArticle = news.find((n) => n.isFeatured) || news[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
              <Newspaper className="w-4 h-4" />
              <span>{t.mediaCenterTag}</span>
            </div>
            <h1 className="font-sports font-black text-3xl sm:text-5xl text-white uppercase tracking-wider">
              {t.newsTitle}
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">{t.newsSubtitle}</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchNewsPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sports transition-all ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Story Hero (when no search active and showing ALL) */}
      {selectedCategory === 'ALL' && searchQuery.trim() === '' && featuredArticle && (
        <div
          onClick={() => onOpenArticleModal(featuredArticle.id)}
          className="group cursor-pointer relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-red-600/60 shadow-2xl transition-all duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 relative aspect-video lg:aspect-auto min-h-[300px] sm:min-h-[380px] overflow-hidden bg-neutral-950">
              <img
                src={featuredArticle.imageUrl || ClubImages.matchAction}
                alt="Featured Story"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = ClubImages.matchAction;
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent lg:hidden" />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-red-600 text-white font-sports">
                  {t.featuredStory} • {getLocalizedCategory(featuredArticle.category, language)}
                </span>
                <span className="text-xs text-neutral-400 block font-medium">
                  {featuredArticle.date} • {featuredArticle.readTime}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-red-400 transition-colors leading-tight">
                  {resolveText(featuredArticle.title)}
                </h2>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {resolveText(featuredArticle.summary)}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-medium">
                  {t.author} {featuredArticle.author}
                </span>
                <span className="text-xs font-bold uppercase font-sports tracking-wider text-red-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{t.readArticle}</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div>
        <h3 className="font-sports font-bold text-xl uppercase tracking-wider text-neutral-300 mb-6">
          {selectedCategory === 'ALL' ? t.allStories : getLocalizedCategory(selectedCategory, language)}
        </h3>

        {filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-neutral-800">
            <p className="text-neutral-400 text-base">{t.noArticlesFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => {
              const title = resolveText(article.title);
              const summary = resolveText(article.summary);

              return (
                <div
                  key={article.id}
                  onClick={() => onOpenArticleModal(article.id)}
                  className="group cursor-pointer rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-red-600/50 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg"
                >
                  <div>
                    <div className="relative aspect-video overflow-hidden bg-neutral-950">
                      <img
                        src={article.imageUrl || ClubImages.matchAction}
                        alt={title}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = ClubImages.matchAction;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-black/75 text-emerald-400 backdrop-blur-md">
                        {getLocalizedCategory(article.category, language)}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <span className="text-xs text-neutral-500 font-medium block">
                        {article.date} • {article.readTime}
                      </span>
                      <h4 className="font-bold text-lg text-white group-hover:text-red-400 transition-colors line-clamp-2">
                        {title}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                        {summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800/80 mt-4 pt-3">
                    <span>{article.author}</span>
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1 uppercase tracking-wider font-sports group-hover:translate-x-1 transition-transform">
                      <span>{t.readArticle}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
