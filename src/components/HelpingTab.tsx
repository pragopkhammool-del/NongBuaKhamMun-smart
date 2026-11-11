import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  X,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { HelpRequest, UserProfile } from '../types';
import { createHelpRequest, volunteerForHelp, updateHelpRequest } from '../services/villageService';

interface HelpingTabProps {
  requests: HelpRequest[];
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

const HELP_CATEGORIES = [
  'ทั้งหมด',
  'ช่วยเหลือผู้สูงอายุ',
  'ช่วยเหลือผู้ป่วย/ติดเตียง',
  'ผู้ประสบภัย/เหตุฉุกเฉิน',
  'ขอรับสิ่งของ/อุปกรณ์พยุงกาย',
  'ขอแรงงานช่วยเหลือ/ซ่อมแซม',
  'รับสมัครจิตอาสา',
  'บริจาคสิ่งของ'
];

export const HelpingTab: React.FC<HelpingTabProps> = ({ requests, currentUser, onOpenAuth }) => {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [volunteeredIds, setVolunteeredIds] = useState<string[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(HELP_CATEGORIES[1]);
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT' | 'EMERGENCY'>('NORMAL');
  const [contactName, setContactName] = useState(currentUser?.firstName || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [area, setArea] = useState('บ้านหนองบัวคำมูล ม.4');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  const handleVolunteer = async (req: HelpRequest) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (volunteeredIds.includes(req.id)) {
      alert('ท่านได้กดเสนอตัวเป็นจิตอาสาในเรื่องนี้แล้ว ขอขอบพระคุณเป็นอย่างยิ่งครับ');
      return;
    }

    try {
      await volunteerForHelp(req.id, req.volunteerCount || 0);
      setVolunteeredIds(prev => [...prev, req.id]);
      confetti({ particleCount: 60, spread: 60 });
      alert('บันทึกการเข้าร่วมเป็นจิตอาสาเรียบร้อยแล้ว คณะกรรมการจะประสานงานรายละเอียดครับ');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  const handleCreateHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !contactName.trim()) return;

    setIsSubmitting(true);
    try {
      await createHelpRequest({
        title: title.trim(),
        category,
        urgency,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim() || 'ติดต่อผ่านผู้ใหญ่บ้าน ม.4',
        area: area.trim() || 'หมู่ที่ 4',
        description: description.trim(),
        status: 'OPEN',
        volunteerCount: 0,
        userId: currentUser?.uid || 'guest',
        createdAt: new Date().toISOString()
      });

      setIsAddModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการขอความช่วยเหลือ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (selectedCategory === 'ทั้งหมด') return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-rose-600 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-6 h-6 text-rose-200" />
            <h1 className="text-xl sm:text-2xl font-extrabold">ช่วยเหลือเพื่อนบ้าน (People Helping People)</h1>
          </div>
          <p className="text-xs sm:text-sm text-rose-100 mt-1">
            แบ่งปันน้ำใจ ดูแลผู้สูงอายุ ผู้ป่วยติดเตียง และระดมพลังจิตอาสาชาวบ้านหนองบัวคำมูล ม.4
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 bg-white text-rose-700 hover:bg-rose-50 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-md transition-transform active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ขอความช่วยเหลือ</span>
        </button>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center space-x-3 text-rose-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-rose-600 flex-shrink-0" />
        <p>
          ระบบให้ความสำคัญสูงสุดกับการคุ้มครองศักดิ์ศรีและความเป็นส่วนตัวของผู้ป่วยและผู้สูงอายุ พิกัดและรายละเอียดอ่อนไหวจะถูกเปิดเผยเฉพาะผู้ใหญ่บ้านและจิตอาสาที่ได้รับมอบหมายเท่านั้น
        </p>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-1 gap-1.5 no-scrollbar">
        {HELP_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-rose-700 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
            <HeartHandshake className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm">ไม่มีคำขอความช่วยเหลือในหมวดหมู่นี้</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const hasVolunteered = volunteeredIds.includes(req.id);
            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                          {req.category}
                        </span>
                        {req.urgency === 'URGENT' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            เร่งด่วน
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-1">{req.title}</h3>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      req.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'HELPING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status === 'COMPLETED' ? 'ได้รับความช่วยเหลือแล้ว' : req.status === 'HELPING' ? 'กำลังมีผู้ช่วยเหลือ' : 'เปิดรับความช่วยเหลือ'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.area}</span>
                    </span>
                    <span>ผู้ประสานงาน: {req.contactName}</span>
                    {req.contactPhone && (
                      <span className="text-emerald-700 font-medium">โทร: {req.contactPhone}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-rose-800 font-bold bg-rose-50 px-2.5 py-1 rounded-lg">
                    มีอาสาสมัครแล้ว {req.volunteerCount || 0} คน
                  </span>

                  <button
                    onClick={() => handleVolunteer(req)}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
                      hasVolunteered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-700 hover:bg-rose-800 text-white'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{hasVolunteered ? 'เป็นจิตอาสาแล้ว' : 'ฉันต้องการช่วยเหลือ / อาสาสมัคร'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Help Request Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">แจ้งขอความช่วยเหลือ / รับจิตอาสา</h2>

            <form onSubmit={handleCreateHelp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หัวข้อความช่วยเหลือ *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ขอแรงช่วยตัดหญ้าบ้านผู้สูงอายุ, ขอยืมอุปกรณ์พยุงกาย"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
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
                    {HELP_CATEGORIES.slice(1).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ความเร่งด่วน</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="NORMAL">ปกติ</option>
                    <option value="URGENT">เร่งด่วน</option>
                    <option value="EMERGENCY">ฉุกเฉิน</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้ประสานงาน *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="เช่น น้านพดล, อสม. ประนอม"
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์ติดต่อ</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">บริเวณพื้นที่โดยประมาณ</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="เช่น ซอย 2 บ้านหนองบัวคำมูล ม.4"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดสิ่งที่ต้องการความช่วยเหลือ *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ระบุความต้องการ จำนวนอาสาสมัคร หรือช่วงเวลาที่สะดวก..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm shadow-md"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันแจ้งความช่วยเหลือ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
