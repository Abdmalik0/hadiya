import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { useClub } from '../context/ClubContext';
import { X, Calendar, Clock, User, Share2, Tag } from 'lucide-react';
import { getLocalizedCategory } from '../utils/localization';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { language, t } = useClub();

  if (!article) return null;

  const [copied, setCopied] = useState(false);
  const title = !article.title
    ? ''
    : typeof article.title === 'string'
    ? article.title
    : (article.title[language] || article.title.en || Object.values(article.title)[0] || '');
  const content = !article.content
    ? ''
    : typeof article.content === 'string'
    ? article.content
    : (article.content[language] || article.content.en || Object.values(article.content)[0] || '');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {getLocalizedCategory(article.category, language)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1 text-xs"
              title="Share article"
            >
              <Share2 className="w-4 h-4" />
              {copied && <span className="text-emerald-400 text-xs">{t.copied}</span>}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Article Image Banner */}
          {article.imageUrl && (
            <div className="relative rounded-xl overflow-hidden aspect-video max-h-72 w-full border border-neutral-800">
              <img
                src={article.imageUrl}
                alt={title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/images/halaba_match_action_1792217992379.webp';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
            </div>
          )}

          {/* Title & Metadata */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-400 border-b border-neutral-800 pb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {article.date}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-500" />
                {t.author}: <strong className="text-neutral-300">{language === 'am' ? 'የክለቡ አስተዳደር' : article.author}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                {article.readTime}
              </span>
            </div>
          </div>

          {/* Full Content */}
          <div className="text-neutral-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
            {content}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {t.mediaCommsFooter}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold transition-colors"
          >
            {t.backToNews}
          </button>
        </div>
      </div>
    </div>
  );
};
