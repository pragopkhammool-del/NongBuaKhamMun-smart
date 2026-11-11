import React, { useState } from 'react';
import { 
  Users, 
  Phone, 
  Shield, 
  Heart, 
  Briefcase, 
  Calendar, 
  Search, 
  Plus, 
  Trash2, 
  X,
  CheckCircle2,
  RefreshCw,
  Award
} from 'lucide-react';
import type { CommitteeMember, UserProfile } from '../types';
import { 
  addCommitteeMember, 
  updateCommitteeMember, 
  deleteCommitteeMember,
  syncOfficialCommitteeMembers,
  OFFICIAL_15_COMMITTEE_MEMBERS 
} from '../services/villageService';

interface CommitteeTabProps {
  members: CommitteeMember[];
  currentUser: UserProfile | null;
}

const CATEGORY_TABS = [
  { id: 'ALL', label: 'ทั้งหมด (15 ท่าน)' },
  { id: 'HEADMAN', label: 'ประธาน/รองประธาน' },
  { id: 'SECRETARY', label: 'เลขาฯ/เหรัญญิก' },
  { id: 'COMMITTEE', label: 'กรรมการ' }
];

export const CommitteeTab: React.FC<CommitteeTabProps> = ({ members, currentUser }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form fields
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleCategory, setRoleCategory] = useState<CommitteeMember['roleCategory']>('COMMITTEE');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [termStart, setTermStart] = useState('2565 - ปัจจุบัน');
  const [photoURL, setPhotoURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  const handleSyncOfficialMembers = async () => {
    if (!confirm('ต้องการนำเข้าและซิงค์ข้อมูลทำเนียบคณะกรรมการหมู่บ้าน 15 ท่านตามประกาศอย่างเป็นทางการหรือไม่?')) return;
    setIsSyncing(true);
    try {
      const count = await syncOfficialCommitteeMembers();
      alert(`อัปเดตทำเนียบคณะกรรมการหมู่บ้าน 15 ท่านตามประกาศลงฐานข้อมูลเรียบร้อยแล้ว (${count} ท่าน)`);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !position.trim()) return;

    setIsSubmitting(true);
    try {
      await addCommitteeMember({
        prefix,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roleCategory,
        position: position.trim(),
        phone: phone.trim() || '081-000-0000',
        responsibilities: responsibilities.trim() || 'ดูแลงานตามที่ได้รับมอบหมาย',
        termStart,
        status: 'ACTIVE',
        order: members.length + 1,
        photoURL: photoURL.trim() || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
      });

      setIsAddModalOpen(false);
      setFirstName('');
      setLastName('');
      setPosition('');
      setPhone('');
      setResponsibilities('');
      setPhotoURL('');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการเพิ่มกรรมการ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันลบข้อมูลบุคลากรนี้?')) return;
    try {
      await deleteCommitteeMember(id);
    } catch (err: any) {
      alert('ไม่สามารถลบได้: ' + err.message);
    }
  };

  const filteredMembers = members.filter(m => {
    const pos = m.position.toLowerCase();
    const matchesCat = activeCategory === 'ALL' || 
      (activeCategory === 'HEADMAN' && (pos.includes('ประธาน') || m.roleCategory === 'HEADMAN' || m.roleCategory === 'ASSISTANT')) ||
      (activeCategory === 'SECRETARY' && (pos.includes('เลขา') || pos.includes('เหรัญญิก'))) ||
      (activeCategory === 'COMMITTEE' && (pos.includes('กรรมการ') && !pos.includes('ประธาน')));
    const matchesSearch = `${m.prefix}${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.responsibilities || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#164B3C] via-[#1E5D4B] to-[#23865B] rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-300" />
            <h1 className="text-xl sm:text-2xl font-extrabold">ทำเนียบคณะกรรมการหมู่บ้าน (15 ท่าน)</h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            คณะกรรมการหมู่บ้าน บ้านหนองบัวคำมูล หมู่ที่ 4 ประธาน รองประธาน เลขานุการ เหรัญญิก และกรรมการ
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {isAdmin && (
            <>
              <button
                onClick={handleSyncOfficialMembers}
                disabled={isSyncing}
                title="คลิกเพื่อนำเข้าทำเนียบคณะกรรมการ 15 ท่านตามประกาศลง Firestore"
                className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังซิงค์...' : 'รีเซ็ต/ซิงค์ 15 ท่าน'}</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มบุคคล</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ นามสกุล หรือตำแหน่ง..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B] shadow-xs"
          />
        </div>

        <div className="flex overflow-x-auto pb-1 gap-1.5 no-scrollbar">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === tab.id 
                  ? 'bg-[#164B3C] text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Committee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
            <Users className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm">ไม่พบบุคลากรตามเงื่อนไขที่ค้นหา</p>
          </div>
        ) : (
          filteredMembers.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-emerald-100 shadow-xs">
                  <img
                    src={member.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'}
                    alt={member.firstName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mb-1.5">
                    {member.order && (
                      <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 shadow-2xs">
                        ลำดับที่ {member.order}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      member.position.includes('ประธาน') 
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold'
                        : member.position.includes('เลขา') || member.position.includes('เหรัญญิก')
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      ทำหน้าที่: {member.position}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 truncate">
                    {member.prefix}{member.firstName} {member.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {member.responsibilities || 'ดูแลความเป็นอยู่และความสงบเรียบร้อย'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  วาระ: {member.termStart || '2565 - ปัจจุบัน'}
                </span>

                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#164B3C] hover:bg-[#23865B] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>โทรติดต่อ</span>
                  </a>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">เพิ่มข้อมูลกรรมการ/ผู้นำหมู่บ้าน</h2>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">คำนำหน้า</label>
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">กลุ่มบุคลากร</label>
                  <select
                    value={roleCategory}
                    onChange={(e) => setRoleCategory(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="HEADMAN">ผู้ใหญ่บ้าน</option>
                    <option value="ASSISTANT">ผู้ช่วยผู้ใหญ่บ้าน</option>
                    <option value="COMMITTEE">กรรมการหมู่บ้าน</option>
                    <option value="HEALTH_VOLUNTEER">อสม.</option>
                    <option value="VOLUNTEER">อาสาสมัคร/อปพร.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ตำแหน่ง *</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="เช่น ผู้ใหญ่บ้าน ม.4, ประธาน อสม."
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หน้าที่รับผิดชอบ</label>
                <textarea
                  rows={2}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="เช่น ดูแลงานด้านสาธารณสุข, ฝ่ายความมั่นคง..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL รูปถ่าย (ไม่บังคับ)</label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#164B3C] hover:bg-[#23865B] text-white font-bold text-sm shadow-md"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลบุคลากร'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
