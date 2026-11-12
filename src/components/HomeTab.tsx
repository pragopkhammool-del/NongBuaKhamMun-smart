import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Sparkles, 
  MapPin, 
  ShoppingBag, 
  Users, 
  Calendar, 
  HeartHandshake, 
  FileText, 
  Search, 
  ArrowRight, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Flame,
  Volume2,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning
} from 'lucide-react';
import type { 
  NewsItem, 
  Report, 
  VillageEvent, 
  MarketplaceItem, 
  CommitteeMember 
} from '../types';
import { useTheme } from '../context/ThemeContext';

interface HomeTabProps {
  news: NewsItem[];
  reports: Report[];
  events: VillageEvent[];
  marketItems: MarketplaceItem[];
  committee: CommitteeMember[];
  onSelectTab: (tab: string) => void;
  onOpenReportDetail?: (report: Report) => void;
  onTrackReportNumber?: (reportNum: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  news,
  reports,
  events,
  marketItems,
  committee,
  onSelectTab,
  onTrackReportNumber
}) => {
  const { currentTheme } = useTheme();
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<Report | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [weather, setWeather] = useState({
    temp: 32,
    tempMax: 35,
    tempMin: 24,
    rainProb: 20,
    condition: 'มีเมฆบางส่วน / อากาศร้อน',
    icon: <Sun className="w-7 h-7 text-amber-300" />
  });

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=16.505663&longitude=103.005112&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FBangkok');
        const data = await res.json();
        if (data && data.current && data.daily) {
          const currentTemp = Math.round(data.current.temperature_2m);
          const maxTemp = Math.round(data.daily.temperature_2m_max[0]);
          const minTemp = Math.round(data.daily.temperature_2m_min[0]);
          const rain = data.daily.precipitation_probability_max?.[0] ?? 15;
          const wcode = data.current.weather_code;
          
          let cond = 'แดดจัด / ท้องฟ้าแจ่มใส';
          let icn = <Sun className="w-7 h-7 text-amber-300" />;
          if (wcode >= 50 && wcode <= 67) {
            cond = 'ฝนตกปรอยๆ / มีฝนฟ้าคะนอง';
            icn = <CloudRain className="w-7 h-7 text-sky-300" />;
          } else if (wcode >= 1 && wcode <= 3) {
            cond = 'มีเมฆบางส่วน / อากาศสบาย';
            icn = <Cloud className="w-7 h-7 text-emerald-200" />;
          } else if (wcode >= 71) {
            cond = 'ฝนฟ้าคะนอง / ฝนตกหนัก';
            icn = <CloudLightning className="w-7 h-7 text-amber-300" />;
          }

          setWeather({
            temp: currentTemp,
            tempMax: maxTemp,
            tempMin: minTemp,
            rainProb: rain,
            condition: cond,
            icon: icn
          });
        }
      } catch (err) {
        console.warn('Weather fetch warning:', err);
      }
    }
    fetchWeather();
  }, []);

  // Statistics
  const totalReports = reports.length;
  const inProgressReports = reports.filter(r => r.status === 'IN_PROGRESS' || r.status === 'COORDINATED').length;
  const resolvedReports = reports.filter(r => r.status === 'RESOLVED').length;
  const pinnedNews = news.find(n => n.isPinned) || news[0];

  const handleSearchTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    setHasSearched(true);
    const found = reports.find(r => r.reportNumber.toLowerCase() === trackingInput.trim().toLowerCase());
    setTrackingResult(found || null);
  };

  const statusLabel = (status: Report['status']) => {
    switch (status) {
      case 'RECEIVED': return { text: 'รับแจ้งแล้ว', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'PENDING_CHECK': return { text: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'IN_PROGRESS': return { text: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'COORDINATED': return { text: 'ประสานงานแล้ว', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'RESOLVED': return { text: 'แก้ไขเรียบร้อย', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'CANNOT_PROCEED': return { text: 'ไม่สามารถดำเนินการได้', color: 'bg-red-100 text-red-800 border-red-200' };
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div 
        className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${currentTheme.bgGradient} text-white p-6 sm:p-8 shadow-xl transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 mb-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>หมู่บ้านทันสมัย ข่าวสารทั่วถึง สร้างชุมชนน่าอยู่</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SMART MOO4
          </h1>
          <p className="text-base sm:text-lg font-medium text-emerald-100 mt-1">
            ข่าวสาร บ้านหนองบัวคำมูล หมู่ที่ 4
          </p>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-2 leading-relaxed">
            ศูนย์กลางดิจิทัลชุมชน แจ้งเรื่องร้องทุกข์ ติดตามปัญหา เช็กพิกัดจุดเกิดเหตุ แลกเปลี่ยนสินค้า และปรึกษา AI ผู้ช่วยประจำหมู่บ้าน
          </p>

          {/* Quick Action Buttons inside Hero */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onSelectTab('report')}
              className="bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>แจ้งเหตุฉุกเฉิน / ร้องเรียน</span>
            </button>
            <button
              onClick={() => onSelectTab('ai')}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ถาม AI หมู่บ้าน</span>
            </button>
          </div>
        </div>

        {/* Real-time Weather Widget at Top Right (Transparent, no background box) */}
        <div className="relative z-10 flex flex-col items-start md:items-end text-left md:text-right flex-shrink-0 self-stretch md:self-auto justify-between md:justify-center pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
          <div className="flex items-center space-x-3">
            <div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight flex items-center md:justify-end space-x-2">
                <span>{weather.temp}°C</span>
                <span className="drop-shadow-md">{weather.icon}</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-emerald-100 mt-0.5">
                {weather.condition}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2.5 text-xs text-emerald-200 font-medium">
            <span className="flex items-center space-x-1">
              <CloudRain className="w-3.5 h-3.5 text-sky-300" />
              <span>โอกาสฝนตก {weather.rainProb}%</span>
            </span>
            <span>•</span>
            <span>สูงสุด {weather.tempMax}° / ต่ำสุด {weather.tempMin}°</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-200/80 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-emerald-300" />
            <span>ต.คูคำ อ.ซำสูง จ.ขอนแก่น (ม.4)</span>
          </div>
        </div>
      </div>

      {/* Real-time Status Pulse Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#F8FAF8] rounded-2xl p-3.5 shadow-2xs border border-emerald-100/80 text-center">
          <p className="text-[11px] text-slate-500 font-medium">เรื่องแจ้งทั้งหมด</p>
          <p className="text-xl font-extrabold text-slate-800 mt-0.5">{totalReports}</p>
          <span className="text-[10px] text-slate-400">ในระบบ Firestore</span>
        </div>
        <div className="bg-[#F0F9FF] rounded-2xl p-3.5 shadow-2xs border border-sky-200/80 text-center">
          <p className="text-[11px] text-sky-700 font-medium">กำลังดำเนินการ</p>
          <p className="text-xl font-extrabold text-sky-700 mt-0.5">{inProgressReports}</p>
          <span className="text-[10px] text-sky-500">อยู่ระหว่างแก้ไข</span>
        </div>
        <div className="bg-[#F0FDF4] rounded-2xl p-3.5 shadow-2xs border border-emerald-200/80 text-center">
          <p className="text-[11px] text-emerald-700 font-medium">แก้ไขเรียบร้อย</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{resolvedReports}</p>
          <span className="text-[10px] text-emerald-500">ปิดงานสมบูรณ์</span>
        </div>
      </div>

      {/* Main 8 Thumb-Friendly Mobile App Menu Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-extrabold text-slate-800">เมนูบริการประชาชน</h2>
          <span className="text-xs text-emerald-800 font-medium bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
            สมาร์ทมู 4
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {/* 1. แจ้งเหตุ */}
          <button
            onClick={() => onSelectTab('report')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#FFF0F0] hover:bg-[#FFE5E5] border border-rose-200/80 shadow-2xs hover:shadow-md transition-all group text-center active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-2xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-rose-950">แจ้งเหตุ</span>
            <span className="text-[10px] text-rose-600 font-medium">Citizen Voice</span>
          </button>

          {/* 2. ถาม AI หมู่บ้าน */}
          <button
            onClick={() => onSelectTab('ai')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-emerald-200/80 shadow-2xs hover:shadow-md transition-all group text-center active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2D6A4F] to-[#52B788] text-amber-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-950">ถาม AI</span>
            <span className="text-[10px] text-emerald-700 font-medium">น้องสมาร์ท</span>
          </button>

          {/* 3. แผนที่หมู่บ้าน */}
          <button
            onClick={() => onSelectTab('map')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-sky-200/80 shadow-2xs hover:shadow-md transition-all group text-center active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-2xs">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-sky-950">แผนที่</span>
            <span className="text-[10px] text-sky-600 font-medium">พิกัดเหตุการณ์</span>
          </button>

          {/* 4. ตลาดชุมชน */}
          <button
            onClick={() => onSelectTab('market')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-amber-200/80 shadow-2xs hover:shadow-md transition-all group text-center active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-2xs">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-950">ตลาด</span>
            <span className="text-[10px] text-amber-700 font-medium">สินค้า ม.4</span>
          </button>

          {/* 5. ข่าวสาร */}
          <button
            onClick={() => onSelectTab('news')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#F3E8FF] hover:bg-[#E9D5FF] border border-purple-200/80 shadow-2xs hover:shadow-md transition-all group text-center active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-950">ข่าวสาร</span>
            <span className="text-[10px] text-purple-700 font-medium">ประกาศทางการ</span>
          </button>

          {/* 6. ผู้นำ & กรรมการ */}
          <button
            onClick={() => onSelectTab('committee')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-teal-200/80 shadow-2xs hover:shadow-md transition-all group text-center active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-teal-950">ผู้นำชุมชน</span>
            <span className="text-[10px] text-teal-700 font-medium">กรรมการ 15 ท่าน</span>
          </button>

          {/* 7. ช่วยเหลือเพื่อนบ้าน */}
          <button
            onClick={() => onSelectTab('helping')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#FFF1F2] hover:bg-[#FFE4E6] border border-pink-200/80 shadow-2xs hover:shadow-md transition-all group text-center active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-2xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-pink-950">ช่วยเหลือ</span>
            <span className="text-[10px] text-pink-600 font-medium">จิตอาสา</span>
          </button>

          {/* 8. ปฏิทินกิจกรรม */}
          <button
            onClick={() => onSelectTab('events')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#FFEDD5]/80 hover:bg-[#FFEDD5] border border-orange-200/80 shadow-2xs hover:shadow-md transition-all group text-center active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-2xs">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-orange-950">กิจกรรม</span>
            <span className="text-[10px] text-orange-700 font-medium">ปฏิทินชุมชน</span>
          </button>
        </div>
      </div>

      {/* Quick Tracking Citizen Voice Report Box */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-5 border border-emerald-100">
        <div className="flex items-center space-x-2 mb-2">
          <Search className="w-5 h-5 text-[#23865B]" />
          <h3 className="font-bold text-sm text-slate-800">ติดตามสถานะเรื่องแจ้งเหตุ</h3>
        </div>
        <p className="text-xs text-slate-600 mb-3">
          กรอกหมายเลขติดตามเรื่อง เช่น <span className="font-mono font-semibold text-[#164B3C]">MOO4-2026-00001</span> เพื่อตรวจสอบความคืบหน้า
        </p>
        <form onSubmit={handleSearchTracking} className="flex gap-2">
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="รหัสติดตาม เช่น MOO4-2026-00001"
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#164B3C] hover:bg-[#23865B] text-white text-xs sm:text-sm font-semibold transition-colors flex-shrink-0"
          >
            ค้นหา
          </button>
        </form>

        {/* Tracking Search Result */}
        {hasSearched && (
          <div className="mt-3 pt-3 border-t border-emerald-200/60 animate-fadeIn">
            {trackingResult ? (
              <div className="bg-white rounded-xl p-3.5 border border-emerald-200 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-800">{trackingResult.reportNumber}</span>
                    <h4 className="text-sm font-bold text-slate-800 mt-0.5">{trackingResult.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{trackingResult.locationName || 'ไม่ระบุสถานที่'}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${statusLabel(trackingResult.status).color}`}>
                    {statusLabel(trackingResult.status).text}
                  </span>
                </div>
                {trackingResult.statusNote && (
                  <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-700">
                    <span className="font-semibold text-slate-800">ความคืบหน้าล่าสุด: </span>
                    {trackingResult.statusNote}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-amber-700">
                ไม่พบข้อมูลเรื่องแจ้งตามรหัส "{trackingInput}" กรุณาตรวจสอบรหัสอีกครั้งครับ
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pinned News / Announcement Section */}
      {pinnedNews && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[11px] flex items-center space-x-1">
                <Flame className="w-3 h-3 text-red-500" />
                <span>ข่าวด่วนสำคัญ</span>
              </span>
              <span className="text-xs text-slate-400">
                {new Date(pinnedNews.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <button
              onClick={() => onSelectTab('news')}
              className="text-xs text-[#23865B] hover:text-[#164B3C] font-semibold flex items-center space-x-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div 
            onClick={() => onSelectTab('news')}
            className="cursor-pointer group"
          >
            <h3 className="font-bold text-sm sm:text-base text-slate-800 group-hover:text-[#23865B] transition-colors">
              {pinnedNews.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
              {pinnedNews.content}
            </p>
            <div className="mt-2.5 flex items-center space-x-2 text-[11px] text-slate-400">
              <span>โดย {pinnedNews.author}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">{pinnedNews.category}</span>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Village Events Preview */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-slate-800">กิจกรรมที่จะเกิดขึ้น</h2>
          <button
            onClick={() => onSelectTab('events')}
            className="text-xs text-[#23865B] font-semibold flex items-center space-x-1"
          >
            <span>ปฏิทินทั้งหมด</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {events.slice(0, 2).map(event => (
            <div
              key={event.id}
              onClick={() => onSelectTab('events')}
              className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center space-x-3.5"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center flex-shrink-0 text-[#164B3C]">
                <span className="text-[10px] font-semibold uppercase">
                  {new Date(event.eventDate).toLocaleDateString('th-TH', { month: 'short' })}
                </span>
                <span className="text-base font-extrabold leading-none">
                  {new Date(event.eventDate).getDate()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{event.title}</h4>
                <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{event.startTime} น.</span>
                  </span>
                  <span>•</span>
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-medium whitespace-nowrap bg-emerald-50 px-2 py-1 rounded-lg">
                ร่วมแล้ว {event.registeredCount || 0} คน
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Community Marketplace Highlights */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-slate-800">สินค้าชุมชน ม.4 แนะนำ</h2>
          <button
            onClick={() => onSelectTab('market')}
            className="text-xs text-[#23865B] font-semibold flex items-center space-x-1"
          >
            <span>ดูสินค้าทั้งหมด</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {marketItems.slice(0, 3).map(item => (
            <div
              key={item.id}
              onClick={() => onSelectTab('market')}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#23865B]">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">ผู้ขาย: {item.sellerName}</p>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-[#23865B]">
                    ฿{item.price}
                  </span>
                  {item.unit && (
                    <span className="text-[10px] text-slate-400">/{item.unit}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
