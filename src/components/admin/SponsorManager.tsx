import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Sponsor } from '../../types';
import {
  Award,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Upload,
  Link,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Layers,
  Loader2,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { NetVibeSvgEmblem } from '../NetVibeLogo';

/**
 * Compresses & resizes uploaded poster image using HTML Canvas
 * Ensures data URLs fit comfortably in client storage quotas while maintaining crisp quality
 */
const compressPosterImage = (file: File, maxDim = 1200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(readerEvent.target?.result as string);
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const SponsorManager: React.FC = () => {
  const {
    sponsors,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    resetSponsors,
    isSponsorsLoading,
    sponsorsSyncError,
    language,
  } = useClub();

  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [tier, setTier] = useState('Technology Partner & App Developer');
  const [tierAm, setTierAm] = useState('ኦፊሴላዊ የቴክኖሎጂ አጋር እና የመተግበሪያ አበልፃጊ');
  const [imageUrl, setImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAm, setDescriptionAm] = useState('');
  const [active, setActive] = useState(true);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingToFirestore, setIsSavingToFirestore] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAddModal = () => {
    setEditingSponsorId(null);
    setName('');
    setNameAm('');
    setTier('Official Partner');
    setTierAm('ኦፊሴላዊ አጋር');
    setImageUrl('');
    setWebsiteUrl('');
    setDescription('');
    setDescriptionAm('');
    setActive(true);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sponsor: Sponsor) => {
    setEditingSponsorId(sponsor.id);
    setName(sponsor.name);
    setNameAm(sponsor.nameAm || '');
    setTier(sponsor.tier);
    setTierAm(sponsor.tierAm || '');
    setImageUrl(sponsor.imageUrl);
    setWebsiteUrl(sponsor.websiteUrl || '');
    setDescription(sponsor.description || '');
    setDescriptionAm(sponsor.descriptionAm || '');
    setActive(sponsor.active);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setUploadError('File size exceeds 15MB limit. Please select a smaller photo file.');
        return;
      }
      setUploadError(null);
      setIsUploading(true);
      try {
        const dataUrl = await compressPosterImage(file);
        setImageUrl(dataUrl);
      } catch {
        setUploadError('Failed to read image file. Please try another image.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setUploadError('File size exceeds 15MB limit. Please select a smaller photo file.');
        return;
      }
      setUploadError(null);
      setIsUploading(true);
      try {
        const dataUrl = await compressPosterImage(file);
        setImageUrl(dataUrl);
      } catch {
        setUploadError('Failed to read image file. Please try another image.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setUploadError('Please enter a sponsor name.');
      return;
    }
    if (!imageUrl.trim()) {
      setUploadError('Please provide a poster image (upload local file or enter image link).');
      return;
    }

    setIsSavingToFirestore(true);
    setUploadError(null);

    try {
      if (editingSponsorId) {
        await updateSponsor(editingSponsorId, {
          name: name.trim(),
          nameAm: nameAm.trim() || undefined,
          tier: tier.trim(),
          tierAm: tierAm.trim() || undefined,
          imageUrl: imageUrl.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          description: description.trim() || undefined,
          descriptionAm: descriptionAm.trim() || undefined,
          active,
        });
        showToast(`Updated sponsor poster for "${name}" in Firebase Firestore.`);
      } else {
        await addSponsor({
          name: name.trim(),
          nameAm: nameAm.trim() || undefined,
          tier: tier.trim(),
          tierAm: tierAm.trim() || undefined,
          imageUrl: imageUrl.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          description: description.trim() || undefined,
          descriptionAm: descriptionAm.trim() || undefined,
          active,
          order: sponsors.length + 1,
        });
        showToast(`Added new sponsor poster for "${name}" to Firebase Firestore.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to save sponsor to Firebase Firestore.');
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const handleDelete = async (id: string, sponsorName: string) => {
    if (window.confirm(`Are you sure you want to remove the sponsor poster for "${sponsorName}" from Firebase Firestore?`)) {
      try {
        await deleteSponsor(id);
        showToast(`Removed "${sponsorName}" from Firebase Firestore.`);
      } catch (err: any) {
        showToast(`Error deleting sponsor: ${err?.message || 'Failed'}`);
      }
    }
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    try {
      await updateSponsor(sponsor.id, { active: !sponsor.active });
      showToast(`${sponsor.name} poster set to ${!sponsor.active ? 'Active' : 'Hidden'} in Firebase.`);
    } catch (err: any) {
      showToast(`Error updating visibility: ${err?.message || 'Failed'}`);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sponsors.length) return;

    const copy = [...sponsors];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    try {
      for (let idx = 0; idx < copy.length; idx++) {
        await updateSponsor(copy[idx].id, { order: idx + 1 });
      }
      showToast('Updated slide display order in Firebase.');
    } catch (err: any) {
      showToast('Error saving order changes to Firebase.');
    }
  };

  const sortedSponsors = [...sponsors].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-sports font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xxs font-sports font-bold uppercase tracking-wider mb-1">
            <Award className="w-3 h-3" />
            <span>Official Club Partners & Posters</span>
          </div>
          <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
            {language === 'am' ? 'የስፖንሰሮች ባነሮችና ፖስተሮች ማስተዳደሪያ' : 'Sponsor Carousel & Poster Management'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {language === 'am'
              ? 'በመነሻ ገጽ ላይ የሚሽከረከሩትን የክለቡ ስፖንሰሮችና አጋሮች ፖስተሮች ከኮምፒውተርዎ ወይም ከስልክዎ ፋይል በመጫን በቀላሉ ያርትዑ።'
              : 'Manage the large auto-sliding sponsor billboard shown on the club homepage. Upload posters directly from your local device.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (window.confirm('Restore initial official club sponsors (NetVibe, Halaba Union, Chapa, etc.)?')) {
                resetSponsors();
                showToast('Restored default official club sponsors.');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider font-sports flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Restore default sponsors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-sports font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'am' ? 'አዲስ ፖስተር ጫን' : 'Add Sponsor Poster'}</span>
          </button>
        </div>
      </div>

      {/* Firebase Cloud Live Connection Banner */}
      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-start gap-3">
          <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-white font-sports font-bold tracking-wide uppercase">
                {language === 'am'
                  ? 'የፈርቤዝ ክላውድ ፋየርቤዝ ዳታቤዝ ተገናኝቷል'
                  : 'Firebase Cloud Firestore Linked'}
              </strong>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync Active
              </span>
            </div>
            <p className="text-neutral-400 text-xxs">
              {language === 'am'
                ? 'ሁሉም የስፖንሰር ፖስተሮች፣ ባነሮች እና መረጃዎች በቀጥታ በፈርቤዝ /sponsors ውስጥ ይቀመጣሉ።'
                : 'All sponsor posters, tiers, descriptions, and uploaded images sync live with Cloud Firestore collection /sponsors.'}
            </p>
          </div>
        </div>

        {isSponsorsLoading ? (
          <div className="flex items-center gap-1.5 text-amber-400 text-xxs font-mono shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Syncing Firestore...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-neutral-400 text-xxs font-mono shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{sponsors.length} Cloud Documents</span>
          </div>
        )}
      </div>

      {sponsorsSyncError && (
        <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Offline fallback active: {sponsorsSyncError}</span>
        </div>
      )}

      {/* Sponsors Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedSponsors.map((s, idx) => {
          const isNetVibe = s.id.includes('netvibe') || s.name.toLowerCase().includes('netvibe');
          return (
            <div
              key={s.id}
              className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all ${
                s.active
                  ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  : 'bg-neutral-950/50 border-neutral-900 opacity-60'
              }`}
            >
              {/* Top Details & Thumbnail */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Poster Thumbnail */}
                    <div className="w-20 h-16 rounded-xl bg-neutral-900 border border-neutral-800 p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {s.imageUrl ? (
                        <img
                          src={s.imageUrl}
                          alt={s.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      ) : (
                        <NetVibeSvgEmblem sizePx={32} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xxs font-mono text-neutral-500 font-bold">
                          #{idx + 1}
                        </span>
                        <span className="text-xxs px-2 py-0.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-300 font-sports font-bold uppercase truncate max-w-[170px]">
                          {s.tier}
                        </span>
                        {isNetVibe && (
                          <span className="text-xxs px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold uppercase">
                            Developer
                          </span>
                        )}
                      </div>

                      <h4 className="font-sports font-bold text-base text-white mt-1 truncate" title={s.name}>
                        {s.name}
                      </h4>
                      {s.nameAm && (
                        <span className="text-xs text-neutral-400 block font-ethiopic truncate">
                          {s.nameAm}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Active status badge */}
                  <button
                    onClick={() => handleToggleActive(s)}
                    className={`p-1.5 rounded-lg text-xxs font-bold uppercase flex items-center gap-1 transition-colors ${
                      s.active
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-white'
                    }`}
                    title={s.active ? 'Click to hide from homepage' : 'Click to display on homepage'}
                  >
                    {s.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{s.active ? 'Active' : 'Hidden'}</span>
                  </button>
                </div>

                {/* Description snippet */}
                {s.description && (
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                )}

                {s.websiteUrl && (
                  <a
                    href={s.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xxs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
                  >
                    <span className="truncate max-w-[240px]">{s.websiteUrl}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 mt-3 border-t border-neutral-850 flex items-center justify-between">
                {/* Order Up / Down buttons */}
                <div className="flex items-center gap-1">
                  <span className="text-xxs text-neutral-500 uppercase font-bold mr-1">Order:</span>
                  <button
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === sortedSponsors.length - 1}
                    className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-sports font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-red-100 transition-colors cursor-pointer"
                    title="Delete sponsor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT SPONSOR POSTER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
              <div>
                <span className="text-xxs font-sports font-bold uppercase tracking-wider text-amber-400">
                  {editingSponsorId ? 'Edit Sponsor Poster' : 'New Sponsor Poster'}
                </span>
                <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
                  {editingSponsorId ? `Edit: ${name}` : 'Upload Sponsor Poster'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-2">
                <X className="w-4 h-4 text-red-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Sponsor Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Sponsor Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. NetVibe Digital Solutions"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500 font-sports"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Sponsor Name (Amharic)
                  </label>
                  <input
                    type="text"
                    value={nameAm}
                    onChange={(e) => setNameAm(e.target.value)}
                    placeholder="ለምሳሌ፡ ኔትቫይብ ዲጂታል ሶሉሽንስ"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500 font-ethiopic"
                  />
                </div>
              </div>

              {/* Partnership Category / Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Partnership Category / Tier *
                  </label>
                  <input
                    type="text"
                    required
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    placeholder="e.g. Technology Partner & App Developer"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Category (Amharic)
                  </label>
                  <input
                    type="text"
                    value={tierAm}
                    onChange={(e) => setTierAm(e.target.value)}
                    placeholder="ለምሳሌ፡ ኦፊሴላዊ የቴክኖሎጂ አጋር"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500 font-ethiopic"
                  />
                </div>
              </div>

              {/* Poster Image Upload Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Sponsor Poster Image * (Upload From File)
                  </label>
                  {imageUrl && (
                    <span className="text-xxs font-bold uppercase font-sports text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{imageUrl.startsWith('data:') ? 'Local File Loaded' : 'Image Linked'}</span>
                    </span>
                  )}
                </div>

                {/* Upload Buttons & URL Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={imageUrl.startsWith('data:') ? 'Photo loaded from local device (ready to save)' : imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setUploadError(null);
                      }}
                      placeholder="Paste image URL (https://...) or click Browse"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* File Upload Button */}
                  <label
                    htmlFor="sponsor-file-upload-input"
                    className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-sports font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102 shrink-0 active:scale-95 shadow-md"
                    title="Select image from local device"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload From File</span>
                    <input
                      id="sponsor-file-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Drag and Drop Zone */}
                <label
                  htmlFor="sponsor-file-upload-input"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="py-3 px-4 rounded-xl border-2 border-dashed border-neutral-800 hover:border-neutral-700 bg-neutral-950/60 hover:bg-neutral-950 text-neutral-400 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-neutral-500" />
                    <span>
                      {isUploading
                        ? 'Optimizing and compressing poster image...'
                        : 'Drag & drop image file here, or click Browse to select PNG/JPEG'}
                    </span>
                  </span>
                  <span className="text-red-400 font-sports font-bold uppercase text-xs">
                    Choose Photo
                  </span>
                </label>

                {/* Live Poster Image Preview */}
                {imageUrl && (
                  <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-20 h-16 rounded-xl bg-neutral-900 border border-neutral-700 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt="Poster preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xxs font-bold uppercase text-emerald-400 flex items-center gap-1 font-sports">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Poster Preview Ready</span>
                        </span>
                        <span className="text-xxs text-neutral-400 truncate block max-w-xs mt-0.5">
                          {imageUrl.startsWith('data:') ? 'Image stored as high-res data URL' : imageUrl}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-red-950 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xxs font-bold uppercase transition-colors shrink-0"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Website / Contact Link (Optional)
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://netvibesolutions.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Tagline / Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Tagline / Description (English)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ideas • Code • Impact — Official Technology Partner"
                    className="w-full px-3.5 py-2 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Tagline / Description (Amharic)
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionAm}
                    onChange={(e) => setDescriptionAm(e.target.value)}
                    placeholder="ሀሳብ • ኮድ • ተፅዕኖ — የክለቡ ኦፊሴላዊ የቴክኖሎጂ አጋር"
                    className="w-full px-3.5 py-2 bg-neutral-950 rounded-xl border border-neutral-800 text-white text-xs focus:outline-none focus:border-red-500 font-ethiopic"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded bg-neutral-900 border-neutral-700 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-sports font-bold text-white uppercase block text-xs">
                    Display on Homepage Billboard
                  </span>
                  <span className="text-xxs text-neutral-400">
                    When active, this poster appears in the auto-slide carousel on the club homepage
                  </span>
                </div>
              </label>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase tracking-wider font-sports transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || isSavingToFirestore}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-sports font-black text-sm uppercase tracking-wider shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all hover:scale-102 active:scale-95 disabled:opacity-50"
                >
                  {isSavingToFirestore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingSponsorId ? 'Save Changes' : 'Publish Poster'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
