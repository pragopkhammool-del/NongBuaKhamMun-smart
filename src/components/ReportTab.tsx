import React, { useState } from 'react';
import { 
  AlertCircle, 
  Camera, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  EyeOff, 
  Eye, 
  ShieldAlert, 
  Upload, 
  Phone, 
  User, 
  Search, 
  Filter,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Report, UserProfile, ReportUrgency, ReportStatus } from '../types';
import { createReport, generateReportNumber } from '../services/villageService';

interface ReportTabProps {
  reports: Report[];
  currentUser: UserProfile | null;
  onSelectTab: (tab: string) => void;
}

const REPORT_CATEGORIES = [
  'ถนนชำรุด',
  'ไฟฟ้าส่องสว่างดับ',
  'ไฟฟ้าขัดข้อง',
  'น้ำประปาไม่ไหล',
  'น้ำท่วม/ทางระบายน้ำอุดตัน',
  'ขยะตกค้าง/ส่งกลิ่นเหม็น',
  'ปัญหาสิ่งแวดล้อม/มลพิษ',
  'อุบัติเหตุ/จุดเสี่ยงทางถนน',
  'เหตุฉุกเฉิน/ภัยธรรมชาติ',
  'สัตว์มีพิษ/สัตว์อันตราย',
  'บุคคลต้องการความช่วยเหลือ',
  'เสนอความคิดเห็น/พัฒนาหมู่บ้าน',
  'อื่น ๆ'
];

export const ReportTab: React.FC<ReportTabProps> = ({ reports, currentUser, onSelectTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'history'>('form');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<ReportUrgency>('NORMAL');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState(currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : '');
  const [reporterPhone, setReporterPhone] = useState(currentUser?.phone || '');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number | undefined>(16.505663);
  const [lng, setLng] = useState<number | undefined>(103.005112);
  const [imageUrl, setImageUrl] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [successReportNumber, setSuccessReportNumber] = useState<string | null>(null);

  // History filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // GPS Geolocation Handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('อุปกรณ์ของท่านไม่รองรับการระบุตำแหน่ง GPS');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationName(`พิกัด GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('ไม่สามารถดึงตำแหน่งพิกัดได้ กรุณากดยินยอมเปิดสิทธิ์ตำแหน่งที่ตั้ง (Location Permission)');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Image Upload Handler with Canvas Resizing & Compression (max 800px width/height, quality 0.75)
  // Ensures image base64 stays around 40-100KB, preventing Firestore 1MB document limit crashes
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้นครับ');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setImageUrl(compressedDataUrl);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('กรุณากรอกหัวข้อและรายละเอียดเหตุการณ์');
      return;
    }

    setIsSubmitting(true);
    try {
      const reportNumber = generateReportNumber();
      const newReport: Omit<Report, 'id'> = {
        reportNumber,
        title: title.trim(),
        category,
        description: description.trim(),
        urgency,
        isAnonymous,
        reporterName: isAnonymous ? 'ประชาชนไม่ประสงค์ออกนาม' : (reporterName || 'ชาวบ้าน ม.4'),
        reporterPhone: isAnonymous ? '' : reporterPhone,
        reporterId: currentUser?.uid || 'guest',
        locationName: locationName.trim() || 'บ้านหนองบัวคำมูล ม.4',
        lat: lat || 18.7883,
        lng: lng || 98.9853,
        imageUrl: imageUrl || '',
        status: 'RECEIVED',
        statusNote: 'ระบบรับเรื่องเรียบร้อย รอเจ้าหน้าที่และผู้ใหญ่บ้านเข้าตรวจสอบ',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await createReport(newReport);
      setSuccessReportNumber(reportNumber);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Reset form
      setTitle('');
      setDescription('');
      setLocationName('');
      setImageUrl('');
    } catch (err: any) {
      console.error('Submit report error:', err);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'RECEIVED':
        return { label: 'รับแจ้งแล้ว', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'PENDING_CHECK':
        return { label: 'รอตรวจสอบ', bg: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'IN_PROGRESS':
        return { label: 'กำลังดำเนินการ', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'COORDINATED':
        return { label: 'ประสานงานแล้ว', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'RESOLVED':
        return { label: 'แก้ไขเรียบร้อย', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'CANNOT_PROCEED':
        return { label: 'ไม่สามารถดำเนินการได้', bg: 'bg-red-100 text-red-800 border-red-200' };
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">Citizen Voice แจ้งเหตุและร้องเรียน</h1>
            <p className="text-xs sm:text-sm text-rose-100 mt-0.5">
              ศูนย์รับแจ้งปัญหาชุมชน รวดเร็ว โปร่งใส ตรวจสอบความคืบหน้าได้ตลอด 24 ชั่วโมง
            </p>
          </div>
        </div>

        {/* Tab switch button */}
        <div className="flex p-1 bg-black/20 rounded-xl mt-5 max-w-sm">
          <button
            onClick={() => setActiveSubTab('form')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'form' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-white hover:text-white/80'
            }`}
          >
            แบบฟอร์มแจ้งเหตุ
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'history' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-white hover:text-white/80'
            }`}
          >
            ประวัติเรื่องแจ้ง ({reports.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'form' ? (
        <>
          {/* Submission Success Dialog */}
          {successReportNumber && (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 shadow-md text-center animate-bounce-short">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-emerald-900">ส่งเรื่องแจ้งเหตุสำเร็จเรียบร้อย!</h3>
              <p className="text-xs text-emerald-700 mt-1">
                ระบบได้ส่งข้อมูลให้ผู้ใหญ่บ้านและคณะกรรมการหมู่บ้านหนองบัวคำมูลแล้ว
              </p>
              <div className="mt-4 p-3 bg-white rounded-2xl border border-emerald-200 inline-block shadow-xs">
                <span className="text-xs text-slate-500 block">หมายเลขติดตามของท่าน</span>
                <span className="text-xl font-mono font-extrabold text-[#164B3C] select-all">
                  {successReportNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                ท่านสามารถแคปเจอร์หน้าจอนี้ไว้ หรือใช้รหัสนี้ตรวจสอบความคืบหน้าได้ตลอดเวลา
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={() => setSuccessReportNumber(null)}
                  className="px-4 py-2 rounded-xl bg-[#23865B] text-white text-xs font-bold shadow-sm hover:bg-[#164B3C]"
                >
                  แจ้งเรื่องอื่นเพิ่มเติม
                </button>
                <button
                  onClick={() => {
                    setSuccessReportNumber(null);
                    setActiveSubTab('history');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  ดูประวัติเรื่องแจ้ง
                </button>
              </div>
            </div>
          )}

          {/* Incident Report Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
              <span>กรอกรายละเอียดเหตุการณ์</span>
              <span className="text-xs font-normal text-red-500">* ข้อมูลจำเป็น</span>
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">หัวข้อเหตุการณ์ *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ไฟทางดับปากซอย 3, ท่อประปาแตกหน้าวัด"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
              />
            </div>

            {/* Category & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทเหตุการณ์ *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B] bg-white"
                >
                  {REPORT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ระดับความเร่งด่วน</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('NORMAL')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      urgency === 'NORMAL' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ปกติ
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('HIGH')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      urgency === 'HIGH' 
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    เร่งด่วน
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('EMERGENCY')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      urgency === 'EMERGENCY' 
                        ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-200 animate-pulse' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ฉุกเฉิน
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดเหตุการณ์ *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุจุดสังเกต ลักษณะความเสียหาย หรืออันตรายที่อาจเกิดขึ้น..."
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
              />
            </div>

            {/* Location & GPS */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">ตำแหน่งเกิดเหตุ (GPS / สถานที่)</label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="inline-flex items-center space-x-1 text-xs text-[#23865B] hover:text-[#164B3C] font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'กำลังดึงพิกัด...' : 'ใช้พิกัดปัจจุบัน (GPS)'}</span>
                </button>
              </div>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="เช่น ทางโค้งวัดหนองบัวคำมูล, หน้าบ้านเลขที่ 12"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
              />
              {lat && lng && (
                <p className="text-[11px] text-slate-400 mt-1">
                  พิกัดบันทึก: Lat {lat.toFixed(5)}, Lng {lng.toFixed(5)}
                </p>
              )}
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">แนบรูปภาพจุดเกิดเหตุ</label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 font-semibold text-xs cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>ถ่ายภาพ / เลือกรูป</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                {isProcessingImage && (
                  <span className="text-xs text-amber-600 animate-pulse font-medium">
                    กำลังย่อขนาดรูปภาพให้อัตโนมัติ...
                  </span>
                )}
                {imageUrl && !isProcessingImage && (
                  <span className="text-xs text-emerald-600 flex items-center space-x-1 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>แนบรูปภาพแล้ว (ย่อขนาดอัตโนมัติ)</span>
                  </span>
                )}
              </div>
              {imageUrl && (
                <div className="mt-2 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                  <img src={imageUrl} alt="จุดเกิดเหตุ" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-[10px]"
                  >
                    ลบ
                  </button>
                </div>
              )}
            </div>

            {/* Anonymous Toggle */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isAnonymous ? <EyeOff className="w-5 h-5 text-slate-600" /> : <Eye className="w-5 h-5 text-[#23865B]" />}
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {isAnonymous ? 'แจ้งแบบไม่เปิดเผยตัวตน (Anonymous)' : 'เปิดเผยชื่อผู้แจ้ง'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {isAnonymous 
                        ? 'ระบบจะไม่แสดงชื่อและเบอร์โทรของท่านต่อสาธารณะ' 
                        : 'ชื่อของท่านจะช่วยให้เจ้าหน้าที่ประสานงานกลับได้สะดวกขึ้น'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    isAnonymous ? 'bg-slate-400' : 'bg-[#23865B]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isAnonymous ? 'translate-x-0' : 'translate-x-6'
                  }`} />
                </button>
              </div>

              {!isAnonymous && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ชื่อผู้แจ้ง</label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="ชื่อ-นามสกุล"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">เบอร์ติดต่อกลับ</label>
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#164B3C] to-[#23865B] hover:from-[#113A2F] hover:to-[#1B6F4A] text-white font-bold text-sm shadow-lg transition-transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึกลง Firestore...' : 'ยืนยันส่งเรื่องแจ้งเหตุ'}</span>
            </button>
          </form>
        </>
      ) : (
        /* History & Tracking Tab */
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารหัสติดตาม, หัวข้อ หรือประเภท..."
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B]"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="RECEIVED">รับแจ้งแล้ว</option>
              <option value="PENDING_CHECK">รอตรวจสอบ</option>
              <option value="IN_PROGRESS">กำลังดำเนินการ</option>
              <option value="COORDINATED">ประสานงานแล้ว</option>
              <option value="RESOLVED">แก้ไขเรียบร้อย</option>
              <option value="CANNOT_PROCEED">ไม่สามารถดำเนินการได้</option>
            </select>
          </div>

          {/* List of Reports */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400">
              <AlertCircle className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="text-sm">ไม่พบเรื่องแจ้งเหตุตามเงื่อนไข</p>
            </div>
          ) : (
            filteredReports.map(rep => {
              const badge = getStatusBadge(rep.status);
              return (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 hover:border-emerald-200 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {rep.reportNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(rep.createdAt).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-800 mt-1">{rep.title}</h3>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{rep.description}</p>

                  {rep.imageUrl && (
                    <div className="w-32 h-24 rounded-xl overflow-hidden border border-slate-200">
                      <img src={rep.imageUrl} alt={rep.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Progress timeline note */}
                  {rep.statusNote && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-700">บันทึกความคืบหน้า: </span>
                      <span className="text-slate-600">{rep.statusNote}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rep.locationName || 'พิกัดหมู่ 4'}</span>
                    </span>
                    <span>ผู้แจ้ง: {rep.reporterName || 'ชาวบ้าน'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
