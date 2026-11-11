import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  CheckCircle2, 
  Share2, 
  X,
  Grid,
  List,
  CalendarDays,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VillageEvent, UserProfile } from '../types';
import { createEvent, registerForEvent } from '../services/villageService';

interface EventsTabProps {
  events: VillageEvent[];
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

type CalendarViewMode = 'MONTH' | 'WEEK' | 'DAY' | 'LIST';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEK_DAYS_SHORT = [
  { name: 'อา.', fullName: 'วันอาทิตย์', color: 'text-rose-600 bg-rose-50/70' },
  { name: 'จ.', fullName: 'วันจันทร์', color: 'text-amber-600 bg-amber-50/70' },
  { name: 'อ.', fullName: 'วันอังคาร', color: 'text-pink-600 bg-pink-50/70' },
  { name: 'พ.', fullName: 'วันพุธ', color: 'text-emerald-600 bg-emerald-50/70' },
  { name: 'พฤ.', fullName: 'วันพฤหัสบดี', color: 'text-orange-600 bg-orange-50/70' },
  { name: 'ศ.', fullName: 'วันศุกร์', color: 'text-sky-600 bg-sky-50/70' },
  { name: 'ส.', fullName: 'วันเสาร์', color: 'text-purple-600 bg-purple-50/70' },
];

export const EventsTab: React.FC<EventsTabProps> = ({ events, currentUser, onOpenAuth }) => {
  const today = new Date();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('MONTH');
  
  // Current calendar view year & month state
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  
  // Selected Date string YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatYMD(today));
  const [selectedEvent, setSelectedEvent] = useState<VillageEvent | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  // Form fields for adding new event
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(selectedDateStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('ศาลาประชาคมบ้านหนองบัวคำมูล ม.4');
  const [organizer, setOrganizer] = useState('คณะกรรมการหมู่บ้าน ม.4');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(formatYMD(now));
  };

  // Build Month Calendar Grid Array
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = lastDayOfMonth.getDate();

    const cells: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      dateObj: Date;
    }> = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const dObj = new Date(currentYear, currentMonth - 1, pDay);
      cells.push({
        dateStr: formatYMD(dObj),
        dayNum: pDay,
        isCurrentMonth: false,
        isToday: formatYMD(dObj) === formatYMD(today),
        dateObj: dObj
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dObj = new Date(currentYear, currentMonth, d);
      cells.push({
        dateStr: formatYMD(dObj),
        dayNum: d,
        isCurrentMonth: true,
        isToday: formatYMD(dObj) === formatYMD(today),
        dateObj: dObj
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const dObj = new Date(currentYear, currentMonth + 1, n);
      cells.push({
        dateStr: formatYMD(dObj),
        dayNum: n,
        isCurrentMonth: false,
        isToday: formatYMD(dObj) === formatYMD(today),
        dateObj: dObj
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Group events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, VillageEvent[]>();
    events.forEach(ev => {
      // Normalize eventDate string
      let dStr = ev.eventDate;
      if (dStr.includes('T')) {
        dStr = dStr.split('T')[0];
      }
      if (!map.has(dStr)) {
        map.set(dStr, []);
      }
      map.get(dStr)!.push(ev);
    });
    return map;
  }, [events]);

  // Calculate days for WEEK View around selectedDate
  const weekDays = useMemo(() => {
    const selectedDate = new Date(selectedDateStr + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay(); // 0 (Sun) - 6 (Sat)
    
    const sunday = new Date(selectedDate);
    sunday.setDate(selectedDate.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dStr = formatYMD(d);
      days.push({
        dateObj: d,
        dateStr: dStr,
        dayNum: d.getDate(),
        dayName: WEEK_DAYS_SHORT[i].fullName,
        isToday: dStr === formatYMD(today),
        isSelected: dStr === selectedDateStr,
        events: eventsByDate.get(dStr) || []
      });
    }
    return days;
  }, [selectedDateStr, eventsByDate]);

  // Events on currently selected date
  const selectedDateEvents = eventsByDate.get(selectedDateStr) || [];

  const handleRegister = async (event: VillageEvent) => {
    if (registeredIds.includes(event.id)) {
      alert('ท่านได้ลงทะเบียนเข้าร่วมกิจกรรมนี้แล้ว');
      return;
    }

    try {
      await registerForEvent(event.id, event.registeredCount || 0);
      setRegisteredIds(prev => [...prev, event.id]);
      confetti({ particleCount: 50, spread: 50 });
      alert(`ลงทะเบียนเข้าร่วม "${event.title}" สำเร็จเรียบร้อยครับ`);
    } catch (err: any) {
      alert('ไม่สามารถลงทะเบียนได้: ' + err.message);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !location.trim()) return;

    setIsSubmitting(true);
    try {
      await createEvent({
        title: title.trim(),
        eventDate,
        startTime,
        endTime,
        location: location.trim(),
        organizer: organizer.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
        status: 'UPCOMING',
        registeredCount: 0,
        createdAt: new Date().toISOString()
      });

      setIsAddModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการสร้างกิจกรรม: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner - Modern Pastel Emerald */}
      <div className="bg-gradient-to-r from-[#2D6A4F] via-[#40916C] to-[#52B788] rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-6 h-6 text-emerald-200" />
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              ปฏิทินกิจกรรมชุมชน ม.4
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
            วางแผนและรับทราบกำหนดการประชุม งานประเพณี กิจกรรมจิตอาสา ประจำบ้านหนองบัวคำมูล
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEventDate(selectedDateStr);
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-md transition-transform active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างกิจกรรมใหม่</span>
          </button>
        )}
      </div>

      {/* Calendar Navigation Toolbar & View Selector Tabs */}
      <div className="bg-white rounded-3xl p-4 border border-emerald-100/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between md:justify-start space-x-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors border border-slate-200/80"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors border border-slate-200/80"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
              {THAI_MONTHS[currentMonth]} {currentYear + 543}
            </h2>

            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 rounded-xl bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors"
            >
              วันนี้
            </button>
          </div>

          {/* Jump to Date Picker & View Switchers */}
          <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
            <input
              type="date"
              value={selectedDateStr}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDateStr(e.target.value);
                  const d = new Date(e.target.value + 'T00:00:00');
                  setCurrentYear(d.getFullYear());
                  setCurrentMonth(d.getMonth());
                }
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* View Switcher Pills */}
            <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setViewMode('MONTH')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'MONTH'
                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>เดือน</span>
              </button>
              <button
                onClick={() => setViewMode('WEEK')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'WEEK'
                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>สัปดาห์</span>
              </button>
              <button
                onClick={() => setViewMode('DAY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'DAY'
                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>วัน</span>
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'LIST'
                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>รายการ</span>
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW MODE 1: MONTH GRID CALENDAR */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'MONTH' && (
          <div className="space-y-3">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 pb-2">
              {WEEK_DAYS_SHORT.map((wd, idx) => (
                <div key={idx} className={`py-1.5 rounded-xl text-xs font-bold ${wd.color}`}>
                  <span className="hidden sm:inline">{wd.fullName}</span>
                  <span className="sm:hidden">{wd.name}</span>
                </div>
              ))}
            </div>

            {/* 7-Column Grid Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarCells.map((cell, idx) => {
                const dayEvents = eventsByDate.get(cell.dateStr) || [];
                const hasEvents = dayEvents.length > 0;
                const isSelected = cell.dateStr === selectedDateStr;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDateStr(cell.dateStr);
                      if (!cell.isCurrentMonth) {
                        setCurrentYear(cell.dateObj.getFullYear());
                        setCurrentMonth(cell.dateObj.getMonth());
                      }
                    }}
                    className={`min-h-[64px] sm:min-h-[90px] p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden select-none ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-300 shadow-sm'
                        : cell.isToday
                        ? 'border-amber-400 bg-amber-50/50'
                        : cell.isCurrentMonth
                        ? 'border-slate-100 bg-white hover:bg-slate-50'
                        : 'border-slate-100 bg-slate-50/60 opacity-40'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold rounded-lg w-6 h-6 flex items-center justify-center ${
                          cell.isToday
                            ? 'bg-amber-500 text-white font-black shadow-xs'
                            : isSelected
                            ? 'bg-[#2D6A4F] text-white font-black'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {hasEvents && (
                        <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Event indicators in Month cell */}
                    <div className="mt-1 space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className="text-[10px] bg-emerald-100/90 hover:bg-emerald-200 text-[#164B3C] font-semibold px-1.5 py-0.5 rounded-md truncate cursor-pointer transition-colors"
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-emerald-800 font-bold block truncate">
                          +{dayEvents.length - 2} เพิ่มเติม
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW MODE 2: WEEK VIEW */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'WEEK' && (
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
            {weekDays.map((wDay, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedDateStr(wDay.dateStr)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  wDay.isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-300 shadow-sm'
                    : wDay.isToday
                    ? 'border-amber-400 bg-amber-50/50'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500">{wDay.dayName}</p>
                      <p className="text-base font-extrabold text-slate-800">{wDay.dayNum}</p>
                    </div>
                    {wDay.isToday && (
                      <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        วันนี้
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {wDay.events.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">ไม่มีกิจกรรม</p>
                    ) : (
                      wDay.events.map(ev => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className="bg-emerald-100/90 hover:bg-emerald-200 p-2 rounded-xl border border-emerald-200 text-left transition-colors cursor-pointer"
                        >
                          <p className="text-xs font-bold text-[#164B3C] line-clamp-2">{ev.title}</p>
                          <p className="text-[10px] text-emerald-800 mt-1 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{ev.startTime} น.</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW MODE 3: DAY VIEW */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'DAY' && (
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  กิจกรรมในวันที่เลือก
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('th-TH', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h3>
              </div>
              <span className="bg-[#2D6A4F] text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                {selectedDateEvents.length} กิจกรรม
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <CalendarIcon className="w-10 h-10 mx-auto stroke-1 text-slate-300 mb-2" />
                <p className="text-xs sm:text-sm font-medium">ไม่มีกิจกรรมที่กำหนดไว้สำหรับวันนี้</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateEvents.map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 font-bold text-[11px] px-2.5 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        <span>{ev.startTime} - {ev.endTime || 'เสร็จสิ้น'} น.</span>
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-1">{ev.description}</p>
                      <p className="text-xs text-slate-400 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{ev.location}</span>
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(ev);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#40916C] text-white text-xs font-bold transition-all shadow-xs flex-shrink-0"
                    >
                      กดเข้าร่วมกิจกรรม
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EVENTS DETAILS PANEL FOR SELECTED DATE (FOR MONTH VIEW) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'MONTH' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-800">
                รายการกิจกรรมประจำวันที่ {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              พบ {selectedDateEvents.length} รายการ
            </span>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              ไม่มีกิจกรรมที่กำหนดไว้สำหรับวันที่เลือก ท่านสามารถกดเลือกวันอื่นในตารางปฏิทินด้านบนได้ครับ
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedDateEvents.map(ev => {
                const isRegistered = registeredIds.includes(ev.id);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="p-4 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {ev.startTime} - {ev.endTime || 'เสร็จสิ้น'} น.
                        </span>
                        <span className="text-[11px] text-slate-400">จัดโดย: {ev.organizer}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{ev.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ev.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 truncate flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegister(ev);
                        }}
                        className={`ml-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                          isRegistered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#2D6A4F] text-white hover:bg-[#40916C]'
                        }`}
                      >
                        {isRegistered ? 'ลงทะเบียนแล้ว' : 'เข้าร่วม'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 4: FULL LIST VIEW */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'LIST' && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
              <CalendarIcon className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="text-sm">ไม่มีกิจกรรมที่กำหนดไว้ในขณะนี้</p>
            </div>
          ) : (
            events.map(event => {
              const isRegistered = registeredIds.includes(event.id);
              const dateObj = new Date(event.eventDate);

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row cursor-pointer"
                >
                  {/* Date Left Badge */}
                  <div className="md:w-36 bg-emerald-50 text-[#164B3C] p-4 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r border-emerald-100 flex-shrink-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      {dateObj.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-3xl md:text-4xl font-extrabold my-1 leading-none text-[#164B3C]">
                      {dateObj.getDate()}
                    </span>
                    <span className="text-xs text-slate-500">
                      {dateObj.toLocaleDateString('th-TH', { weekday: 'long' })}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {event.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{event.startTime} - {event.endTime || 'เสร็จสิ้น'} น.</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{event.location}</span>
                        </span>
                        <span className="text-slate-400">จัดโดย: {event.organizer}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                        ผู้ลงทะเบียนแล้ว {event.registeredCount || 0} คน
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegister(event);
                        }}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
                          isRegistered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#2D6A4F] hover:bg-[#40916C] text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isRegistered ? 'ลงทะเบียนแล้ว' : 'กดเข้าร่วมกิจกรรม'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* EVENT DETAIL POPUP MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-lg">
                รายละเอียดกิจกรรม
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
              {selectedEvent.title}
            </h2>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-700">
              <p className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="font-bold">วันที่:</span>
                <span>
                  {new Date(selectedEvent.eventDate + 'T00:00:00').toLocaleDateString('th-TH', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </p>
              <p className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="font-bold">เวลา:</span>
                <span>{selectedEvent.startTime} - {selectedEvent.endTime || 'เสร็จสิ้น'} น.</span>
              </p>
              <p className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="font-bold">สถานที่:</span>
                <span>{selectedEvent.location}</span>
              </p>
              <p className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="font-bold">จัดโดย:</span>
                <span>{selectedEvent.organizer}</span>
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">วัตถุประสงค์และรายละเอียด:</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                {selectedEvent.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                ลงทะเบียนแล้ว: <span className="font-bold text-emerald-700">{selectedEvent.registeredCount || 0} คน</span>
              </span>

              <button
                onClick={() => {
                  handleRegister(selectedEvent);
                  setSelectedEvent(null);
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#40916C] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันเข้าร่วมกิจกรรม</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">สร้างกิจกรรมในปฏิทินหมู่บ้าน</h2>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อกิจกรรม *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ประชุมประชาคมประจำเดือน, กิจกรรมจิตอาสาพัฒนาวัด"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">วันที่จัดกิจกรรม *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">สถานที่ *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น ศาลาประชาคม ม.4, วัดหนองบัวคำมูล"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ผู้จัดกิจกรรม</label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดกิจกรรม</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="วาระการประชุม หรือสิ่งของที่ต้องเตรียมมา..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#40916C] text-white font-bold text-sm shadow-md"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
