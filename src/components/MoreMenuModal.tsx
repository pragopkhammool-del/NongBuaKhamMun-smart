import React from 'react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Users, 
  HeartHandshake, 
  Building2, 
  FileSpreadsheet, 
  MessageSquare, 
  Shield, 
  PhoneCall, 
  Info,
  ChevronRight,
  Palette
} from 'lucide-react';
import type { UserProfile } from '../types';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onOpenThemeModal?: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  currentUser,
  onOpenThemeModal
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  const menuItems = [
    { id: 'ai', title: 'ถาม AI หมู่บ้าน', desc: 'ผู้ช่วยเสียงอัจฉริยะ ตอบข้อสงสัย 24 ชม.', icon: Sparkles, color: 'text-amber-500 bg-amber-50' },
    { id: 'map', title: 'แผนที่หมู่บ้าน', desc: 'จุดเกิดเหตุ ถนนชำรุด และสถานที่สำคัญ', icon: MapPin, color: 'text-blue-600 bg-blue-50' },
    { id: 'committee', title: 'ผู้นำและกรรมการ', desc: 'ทำเนียบผู้ใหญ่บ้าน ผู้ช่วย อสม. ม.4', icon: Users, color: 'text-teal-700 bg-teal-50' },
    { id: 'census', title: 'ทะเบียนราษฎร', desc: 'รายชื่อประชากรและครัวเรือนในหมู่บ้าน', icon: FileSpreadsheet, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'events', title: 'ปฏิทินกิจกรรม', desc: 'นัดหมายการประชุม งานบุญ ประเพณี', icon: Calendar, color: 'text-purple-600 bg-purple-50' },
    { id: 'helping', title: 'ช่วยเหลือเพื่อนบ้าน', desc: 'จิตอาสา ดูแลผู้สูงอายุและผู้ป่วยติดเตียง', icon: HeartHandshake, color: 'text-rose-600 bg-rose-50' },
    { id: 'projects', title: 'งบประมาณ & โครงการ', desc: 'Open Transparency ตรวจสอบความคืบหน้า', icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'forum', title: 'กระดานประชาคม', desc: 'พื้นที่เสนอแนะความคิดเห็นเพื่อพัฒนาหมู่บ้าน', icon: MessageSquare, color: 'text-amber-700 bg-amber-50' }
  ];

  if (isAdmin) {
    menuItems.push({
      id: 'admin',
      title: 'ศูนย์ควบคุมผู้ดูแล (Admin)',
      desc: 'จัดการข้อมูล ปรับสถานะเรื่องร้องเรียน และสถิติ',
      icon: Shield,
      color: 'text-slate-900 bg-amber-100'
    });
  }

  const handleItemClick = (tabId: string) => {
    onSelectTab(tabId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-slideUp">
        {/* Handle bar for mobile drag feeling */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">เมนูบริการทั้งหมด</h3>
            <p className="text-xs text-slate-500">SMART MOO4 บ้านหนองบัวคำมูล หมู่ที่ 4</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="flex items-center p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-slate-50 transition-all text-left group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 ml-1 flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Emergency Hotline & Theme Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          {onOpenThemeModal && (
            <button
              onClick={() => {
                onClose();
                onOpenThemeModal();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#164B3C] font-bold text-xs flex items-center justify-center space-x-2 border border-emerald-200 transition-colors"
            >
              <Palette className="w-4 h-4 text-emerald-700" />
              <span>เปลี่ยนสีธีมเทมเพลตหมู่บ้าน (6 ชุดสี)</span>
            </button>
          )}

          <a
            href="tel:0812345678"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-transform active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>ติดต่อด่วน: ผู้ใหญ่บ้านธนพล เสนบี้ (081-234-5678)</span>
          </a>
        </div>
      </div>
    </div>
  );
};

