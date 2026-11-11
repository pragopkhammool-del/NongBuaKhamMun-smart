import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Share2, 
  Volume2, 
  Pin, 
  Plus, 
  Clock, 
  User, 
  Calendar, 
  X, 
  AlertTriangle,
  Flame,
  Check,
  Globe,
  ExternalLink
} from 'lucide-react';
import type { NewsItem, UserProfile } from '../types';
import { createNews } from '../services/villageService';
import { useTheme } from '../context/ThemeContext';

interface NewsTabProps {
  news: NewsItem[];
  currentUser: UserProfile | null;
}

const NEWS_CATEGORIES = [
  'ทั้งหมด',
  'ข่าวประชาสัมพันธ์',
  'ประกาศผู้ใหญ่บ้าน',
  'ข่าวแจ้งเตือนภัย',
  'ข่าวกิจกรรม',
  'งานบุญและประเพณี',
  'ข่าวการประชุม',
  'ข่าวสารทั่วไป'
];

export const NewsTab: React.FC<NewsTabProps> = ({ news, currentUser }) => {
  const { currentTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingNewsId, setReadingNewsId] = useState<string | null>(null);
  const [activeNewsModal, setActiveNewsModal] = useState<NewsItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New News form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(NEWS_CATEGORIES[1]);
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);
  const [newsSource, setNewsSource] = useState('หอกระจายข่าวบ้านหนองบัวคำมูล ม.4');
  const [sourceUrl, setSourceUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  // Text to Speech for elders
  const handleSpeak = (newsItem: NewsItem) => {
    if (!('speechSynthesis' in window)) {
      alert('อุปกรณ์ของท่านไม่รองรับการอ่านออกเสียง');
      return;
    }

    if (readingNewsId === newsItem.id) {
      window.speechSynthesis.cancel();
      setReadingNewsId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${newsItem.title}. ${newsItem.content}`);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9;
    utterance.onend = () => setReadingNewsId(null);
    utterance.onerror = () => setReadingNewsId(null);
    setReadingNewsId(newsItem.id);
    window.speechSynthesis.speak(utterance);
  };

  // Web Share
  const handleShare = async (newsItem: NewsItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: newsItem.title,
          text: newsItem.content.slice(0, 150) + '...',
          url: window.location.href
        });
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(`${newsItem.title}\n${window.location.href}`);
      alert('คัดลอกลิงก์ข่าวเรียบร้อยแล้ว');
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await createNews({
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        isPinned,
        newsSource: newsSource.trim() || 'หอกระจายข่าวบ้านหนองบัวคำมูล ม.4',
        sourceUrl: sourceUrl.trim() || undefined,
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
        author: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'ผู้ใหญ่บ้าน ม.4',
        published: true,
        createdAt: new Date().toISOString()
      });

      setIsAddModalOpen(false);
      setTitle('');
      setContent('');
      setCoverUrl('');
      setSourceUrl('');
      setIsPinned(false);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการลงประกาศข่าว: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesCat = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.newsSource || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div 
        className={`bg-gradient-to-r ${currentTheme.bgGradient} rounded-3xl p-6 text-white shadow-lg flex items-center justify-between transition-all duration-300`}
      >
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-300" />
            <h1 className="text-xl sm:text-2xl font-extrabold">ข่าวสารและประกาศชุมชน</h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            บ้านหนองบัวคำมูล หมู่ที่ 4 ทันทุกข่าวสาร แจ้งเตือนภัย และกิจกรรมงานบุญ
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-transform active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มข่าวประกาศ</span>
          </button>
        )}
      </div>

      {/* Search Bar & Category Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาข่าวสาร ประกาศ หรือหัวข้อ..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B] shadow-xs"
          />
        </div>

        <div className="flex overflow-x-auto pb-1 gap-1.5 no-scrollbar">
          {NEWS_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-[#164B3C] text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
            <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm">ไม่พบข่าวสารในหมวดหมู่นี้</p>
          </div>
        ) : (
          filteredNews.map(item => (
            <article
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row group"
            >
              {item.coverUrl && (
                <div className="md:w-56 h-44 md:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.isPinned && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-sm">
                      <Pin className="w-3 h-3 fill-current" />
                      <span>ปักหมุด</span>
                    </span>
                  )}
                  {item.priority === 'URGENT' && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-sm">
                      <Flame className="w-3 h-3" />
                      <span>ด่วนที่สุด</span>
                    </span>
                  )}
                </div>
              )}

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1.5 flex-wrap gap-y-1">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit'
                        })}
                      </span>
                    </span>
                    {item.newsSource && (
                      <>
                        <span>•</span>
                        <span className="flex items-center space-x-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          <Globe className="w-3 h-3 text-emerald-700" />
                          <span>{item.newsSource}</span>
                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-700 hover:text-emerald-900 ml-1 inline-flex items-center"
                              title="เปิดลิงก์แหล่งข่าวต้นฉบับ"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 
                    onClick={() => setActiveNewsModal(item)}
                    className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-[#23865B] transition-colors cursor-pointer leading-snug"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    ผู้ประกาศ: {item.author}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {/* Read Aloud button for elders */}
                    <button
                      onClick={() => handleSpeak(item)}
                      title="กดเพื่อฟังเสียงอ่าน"
                      className={`p-2 rounded-xl transition-colors ${
                        readingNewsId === item.id 
                          ? 'bg-amber-100 text-amber-800 animate-pulse' 
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(item)}
                      title="แชร์ข่าวนี้"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Read More */}
                    <button
                      onClick={() => setActiveNewsModal(item)}
                      className="text-xs text-[#23865B] font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      อ่านฉบับเต็ม
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Full News View Modal */}
      {activeNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setActiveNewsModal(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {activeNewsModal.coverUrl && (
              <div className="w-full h-52 rounded-2xl overflow-hidden mb-4">
                <img
                  src={activeNewsModal.coverUrl}
                  alt={activeNewsModal.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2 flex-wrap gap-y-1">
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                {activeNewsModal.category}
              </span>
              <span>•</span>
              <span>
                {new Date(activeNewsModal.createdAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              {activeNewsModal.newsSource && (
                <>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    <Globe className="w-3.5 h-3.5 text-emerald-700" />
                    <span>แหล่งข่าว: {activeNewsModal.newsSource}</span>
                    {activeNewsModal.sourceUrl && (
                      <a 
                        href={activeNewsModal.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline inline-flex items-center ml-1"
                      >
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </span>
                </>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {activeNewsModal.title}
            </h2>

            <div className="mt-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
              {activeNewsModal.content}
            </div>

            {activeNewsModal.sourceUrl && (
              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 truncate">ลิงก์แหล่งข่าวต้นฉบับ:</span>
                <a
                  href={activeNewsModal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-bold hover:underline inline-flex items-center flex-shrink-0 ml-2"
                >
                  <span>เปิดดูเว็บไซต์แหล่งข่าว</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>ประกาศโดย: {activeNewsModal.author}</span>
              <button
                onClick={() => handleSpeak(activeNewsModal)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold"
              >
                <Volume2 className="w-4 h-4" />
                <span>{readingNewsId === activeNewsModal.id ? 'กำลังอ่าน...' : 'ฟังเสียงอ่าน'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add News Modal (Admin) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">เพิ่มประกาศข่าวสารหมู่บ้าน</h2>

            <form onSubmit={handleCreateNews} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หัวข้อข่าว *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น นัดประชุมประชาคมหมู่บ้าน, แจ้งเตือนพายุ"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {NEWS_CATEGORIES.slice(1).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ความสำคัญ</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="NORMAL">ปกติ</option>
                    <option value="IMPORTANT">สำคัญ</option>
                    <option value="URGENT">ด่วนที่สุด</option>
                  </select>
                </div>
              </div>

              {/* News Source field & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  แหล่งข่าว / หน่วยงานต้นสังกัด *
                </label>
                <input
                  type="text"
                  required
                  value={newsSource}
                  onChange={(e) => setNewsSource(e.target.value)}
                  placeholder="ระบุแหล่งข่าว เช่น หอกระจายข่าว ม.4, อบต., กรมอุตุฯ"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    'หอกระจายข่าวบ้านหนองบัวคำมูล ม.4',
                    'องค์การบริหารส่วนตำบล (อบต.)',
                    'กรมอุตุนิยมวิทยา',
                    'รพ.สต. ในพื้นที่',
                    'ที่ว่าการอำเภอ'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewsSource(preset)}
                      className="text-[10px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL แหล่งข่าวต้นฉบับ (ถ้ามี)</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://facebook.com/... หรือ https://..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เนื้อหาข่าว *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="รายละเอียดประกาศ ข้อความถึงประชาชน..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL รูปภาพหน้าปก (ไม่บังคับ)</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 pt-1">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-[#23865B] focus:ring-[#23865B]"
                />
                <span>ปักหมุดเป็นข่าวเด่นบนหน้าแรก</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#164B3C] hover:bg-[#23865B] text-white font-bold text-sm shadow-md"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'เผยแพร่ข่าว'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
