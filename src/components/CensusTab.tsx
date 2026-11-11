import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Home, 
  Phone, 
  ShieldCheck, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import type { Resident, UserProfile } from '../types';
import { addResident, updateResident, deleteResident, generateResidentCode } from '../services/villageService';

interface CensusTabProps {
  residents: Resident[];
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const CensusTab: React.FC<CensusTabProps> = ({
  residents,
  currentUser,
  onOpenAuth
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByHouse, setGroupByHouse] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // Form fields
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [householdCount, setHouseholdCount] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !houseNumber.trim()) {
      alert('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่');
      return;
    }

    // Duplicate check
    const isDuplicate = residents.some(r => 
      r.id !== editingResident?.id &&
      r.firstName.trim().toLowerCase() === firstName.trim().toLowerCase() &&
      r.lastName.trim().toLowerCase() === lastName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert('มีรายชื่อประชาชนชื่อและนามสกุลนี้อยู่ในระบบแล้ว');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingResident) {
        await updateResident(editingResident.id, {
          prefix,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          houseNumber: houseNumber.trim(),
          phone: phone.trim(),
          householdCount: Number(householdCount)
        });
      } else {
        const residentCode = generateResidentCode(houseNumber, residents.length + 1);
        await addResident({
          residentCode,
          prefix,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          houseNumber: houseNumber.trim(),
          moo: '4',
          phone: phone.trim(),
          householdCount: Number(householdCount),
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        });
      }

      setIsAddModalOpen(false);
      setEditingResident(null);
      setFirstName('');
      setLastName('');
      setHouseNumber('');
      setPhone('');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบรายชื่อประชาชนนี้ออกจากทะเบียน?')) return;
    try {
      await deleteResident(id);
    } catch (err: any) {
      alert('ไม่สามารถลบข้อมูลได้: ' + err.message);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['รหัสสมาชิก,คำนำหน้า,ชื่อ,นามสกุล,บ้านเลขที่,หมู่ที่,เบอร์โทร,จำนวนสมาชิกในครัวเรือน,สถานะ'];
    const rows = residents.map(r => 
      `"${r.residentCode}","${r.prefix}","${r.firstName}","${r.lastName}","${r.houseNumber}","4","${isAdmin ? r.phone || '' : '***'}","${r.householdCount || 1}","${r.status}"`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ทะเบียนราษฎร์_บ้านหนองบัวคำมูล_ม4_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter
  const filteredResidents = residents.filter(r => {
    const query = searchQuery.toLowerCase();
    return `${r.prefix}${r.firstName} ${r.lastName}`.toLowerCase().includes(query) ||
      r.houseNumber.toLowerCase().includes(query) ||
      r.residentCode.toLowerCase().includes(query);
  });

  // Calculate unique households
  const uniqueHouses = new Set(residents.map(r => r.houseNumber)).size;
  const totalPopulation = residents.reduce((acc, r) => acc + (r.householdCount || 1), 0);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#164B3C] to-[#23865B] rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-300" />
            <h1 className="text-xl sm:text-2xl font-extrabold">ทะเบียนรายชื่อประชาชน ม.4</h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            ฐานข้อมูลประชากรและครัวเรือน บ้านหนองบัวคำมูล หมู่ที่ 4 ตามมาตรฐาน PDPA
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            title="ส่งออกไฟล์ CSV"
            className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingResident(null);
                setFirstName('');
                setLastName('');
                setHouseNumber('');
                setPhone('');
                setIsAddModalOpen(true);
              }}
              className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายชื่อ</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 text-center">
          <span className="text-[11px] text-slate-500 font-medium">ประชากรลงทะเบียน</span>
          <p className="text-xl font-extrabold text-slate-800 mt-0.5">{residents.length} คน</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 text-center">
          <span className="text-[11px] text-emerald-600 font-medium">จำนวนครัวเรือน</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{uniqueHouses} หลัง</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 text-center">
          <span className="text-[11px] text-blue-600 font-medium">ประชากรรวมประมาณ</span>
          <p className="text-xl font-extrabold text-blue-700 mt-0.5">{totalPopulation} คน</p>
        </div>
      </div>

      {/* Search & Privacy Alert */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, นามสกุล, หรือบ้านเลขที่..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B] shadow-xs"
            />
          </div>
        </div>

        {!isAdmin && (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>ตามมาตรการคุ้มครองข้อมูลส่วนบุคคล (PDPA) เบอร์โทรศัพท์และข้อมูลละเอียดถูกสงวนสิทธิ์เฉพาะผู้บริหารหมู่บ้านเท่านั้น</span>
          </div>
        )}
      </div>

      {/* Residents List */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs divide-y divide-slate-100">
        {filteredResidents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm">ไม่พบรายชื่อประชาชนในฐานข้อมูล</p>
          </div>
        ) : (
          filteredResidents.map(resident => (
            <div
              key={resident.id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#164B3C] font-bold flex items-center justify-center flex-shrink-0 border border-emerald-100 text-sm">
                  {resident.firstName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-800 truncate">
                      {resident.prefix}{resident.firstName} {resident.lastName}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {resident.residentCode}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Home className="w-3.5 h-3.5 text-slate-400" />
                      <span>บ้านเลขที่ {resident.houseNumber} ม.4</span>
                    </span>
                    <span>•</span>
                    <span>สมาชิกในบ้าน: {resident.householdCount || 1} คน</span>
                    {isAdmin && resident.phone && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">โทร: {resident.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => {
                      setEditingResident(resident);
                      setPrefix(resident.prefix);
                      setFirstName(resident.firstName);
                      setLastName(resident.lastName);
                      setHouseNumber(resident.houseNumber);
                      setPhone(resident.phone || '');
                      setHouseholdCount(resident.householdCount || 3);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resident.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Resident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingResident ? 'แก้ไขข้อมูลประชาชน' : 'ลงทะเบียนรายชื่อราษฎร ม.4'}
            </h2>

            <form onSubmit={handleSaveResident} className="space-y-3">
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
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">บ้านเลขที่ *</label>
                  <input
                    type="text"
                    required
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="เช่น 12 หรือ 45/1"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">สมาชิกในบ้าน (คน)</label>
                  <input
                    type="number"
                    min="1"
                    value={householdCount}
                    onChange={(e) => setHouseholdCount(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ (ไม่บังคับ)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#164B3C] hover:bg-[#23865B] text-white font-bold text-sm shadow-md"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลราษฎร'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
