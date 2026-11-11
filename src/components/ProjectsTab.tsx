import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  Plus, 
  ChevronRight, 
  X,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import type { PublicProject, UserProfile } from '../types';
import { createProject, updateProject, deleteProject } from '../services/villageService';

interface ProjectsTabProps {
  projects: PublicProject[];
  currentUser: UserProfile | null;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ projects, currentUser }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeProjectDetail, setActiveProjectDetail] = useState<PublicProject | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [budgetSource, setBudgetSource] = useState('งบพัฒนาหมู่บ้าน อปท. ประจำปี 2569');
  const [responsibleAgency, setResponsibleAgency] = useState('คณะกรรมการหมู่บ้าน ม.4 ร่วมกับ อบต.');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<PublicProject['status']>('IN_PROGRESS');
  const [beforeImageUrl, setBeforeImageUrl] = useState('');
  const [duringImageUrl, setDuringImageUrl] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  const totalBudgetSum = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
  const inProgressCount = projects.filter(p => p.status === 'IN_PROGRESS').length;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || budget === '') return;

    setIsSubmitting(true);
    try {
      await createProject({
        title: title.trim(),
        budget: Number(budget),
        budgetSource: budgetSource.trim(),
        responsibleAgency: responsibleAgency.trim(),
        description: description.trim(),
        startDate: startDate || new Date().toISOString().slice(0, 10),
        endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        progress: Number(progress),
        status,
        beforeImageUrl: beforeImageUrl.trim(),
        duringImageUrl: duringImageUrl.trim(),
        afterImageUrl: afterImageUrl.trim(),
        updatedAt: new Date().toISOString()
      });

      setIsAddModalOpen(false);
      setTitle('');
      setBudget('');
      setDescription('');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการสร้างโครงการ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (s: PublicProject['status']) => {
    switch (s) {
      case 'PROPOSED': return { text: 'เสนอโครงการ', color: 'bg-slate-100 text-slate-700' };
      case 'WAITING_APPROVAL': return { text: 'รออนุมัติ', color: 'bg-yellow-100 text-yellow-800' };
      case 'APPROVED': return { text: 'อนุมัติแล้ว', color: 'bg-blue-100 text-blue-800' };
      case 'IN_PROGRESS': return { text: 'กำลังดำเนินการ', color: 'bg-indigo-100 text-indigo-800' };
      case 'COMPLETED': return { text: 'เสร็จสิ้นสมบูรณ์', color: 'bg-emerald-100 text-emerald-800' };
      case 'DELAYED': return { text: 'ล่าช้ากว่าแผน', color: 'bg-amber-100 text-amber-800' };
      case 'CANCELLED': return { text: 'ยกเลิก', color: 'bg-red-100 text-red-800' };
    }
  };

  const filteredProjects = projects.filter(p => {
    if (selectedStatus === 'ALL') return true;
    return p.status === selectedStatus;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#164B3C] via-[#1E5D4B] to-[#23865B] rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-emerald-300" />
            <h1 className="text-xl sm:text-2xl font-extrabold">Open Transparency โครงการและงบประมาณ</h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            ความโปร่งใสตรวจสอบได้ของโครงการพัฒนาหมู่บ้าน บ้านหนองบัวคำมูล ม.4
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-transform active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มโครงการ</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 text-center">
          <span className="text-[11px] text-slate-500 font-medium">งบประมาณรวมทุกโครงการ</span>
          <p className="text-lg sm:text-xl font-extrabold text-[#164B3C] mt-0.5">
            ฿{totalBudgetSum.toLocaleString('th-TH')}
          </p>
          <span className="text-[10px] text-slate-400">จากแหล่งงบประมาณรัฐ/ชุมชน</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 text-center">
          <span className="text-[11px] text-blue-600 font-medium">กำลังดำเนินการ</span>
          <p className="text-lg sm:text-xl font-extrabold text-blue-700 mt-0.5">
            {inProgressCount} โครงการ
          </p>
          <span className="text-[10px] text-blue-400">อยู่ระหว่างก่อสร้าง/จัดซื้อ</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 text-center">
          <span className="text-[11px] text-emerald-600 font-medium">เสร็จสิ้นแล้ว</span>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-0.5">
            {completedCount} โครงการ
          </p>
          <span className="text-[10px] text-emerald-400">ส่งมอบงานเรียบร้อย</span>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm">ไม่มีโครงการในสถานะนี้</p>
          </div>
        ) : (
          filteredProjects.map(proj => {
            const badge = getStatusBadge(proj.status);
            return (
              <div
                key={proj.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.color} inline-block mb-1`}>
                      {badge.text}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      หน่วยงานรับผิดชอบ: {proj.responsibleAgency}
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 flex-shrink-0">
                    <span className="text-[10px] text-slate-500 block">งบประมาณ</span>
                    <span className="text-base font-extrabold text-[#164B3C]">
                      ฿{proj.budget.toLocaleString('th-TH')}
                    </span>
                    <span className="text-[10px] text-emerald-700 block">{proj.budgetSource}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {proj.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>ความคืบหน้าโครงการ</span>
                    <span className="text-emerald-700">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#23865B] to-[#4CAF50] transition-all duration-500 rounded-full"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Before / During / After Images Preview */}
                {(proj.beforeImageUrl || proj.duringImageUrl || proj.afterImageUrl) && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block mb-2">ภาพการดำเนินงาน:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {proj.beforeImageUrl && (
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                          <img src={proj.beforeImageUrl} alt="ก่อนดำเนินการ" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                            ก่อนเริ่ม
                          </span>
                        </div>
                      )}
                      {proj.duringImageUrl && (
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                          <img src={proj.duringImageUrl} alt="ระหว่างดำเนินการ" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                            ระหว่างทำ
                          </span>
                        </div>
                      )}
                      {proj.afterImageUrl && (
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                          <img src={proj.afterImageUrl} alt="เสร็จสิ้น" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            เสร็จสิ้น
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>ระยะเวลา: {proj.startDate} ถึง {proj.endDate}</span>
                  </span>
                  <span>อัปเดตข้อมูลจริงจากระบบ</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Project Modal (Admin) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">เพิ่มโครงการพัฒนาและงบประมาณ</h2>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อโครงการ *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น โครงการติดตั้งไฟโซลาร์เซลล์รอบหมู่บ้าน"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">งบประมาณ (บาท) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="150000"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ความคืบหน้า (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">แหล่งงบประมาณ</label>
                  <input
                    type="text"
                    value={budgetSource}
                    onChange={(e) => setBudgetSource(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">สถานะ</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="PROPOSED">เสนอโครงการ</option>
                    <option value="WAITING_APPROVAL">รออนุมัติ</option>
                    <option value="APPROVED">อนุมัติแล้ว</option>
                    <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                    <option value="COMPLETED">เสร็จสิ้นสมบูรณ์</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หน่วยงานรับผิดชอบ</label>
                <input
                  type="text"
                  value={responsibleAgency}
                  onChange={(e) => setResponsibleAgency(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">วันเริ่มโครงการ</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">วันสิ้นสุด</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดโครงการ</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="วัตถุประสงค์ ขอบเขตงาน และประโยชน์ที่ประชาชนจะได้รับ..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#164B3C] hover:bg-[#23865B] text-white font-bold text-sm shadow-md"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกโครงการ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
