import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  BarChart3, 
  AlertCircle, 
  FileText, 
  Users, 
  Calendar, 
  ShoppingBag, 
  HeartHandshake, 
  Building2, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Database,
  ArrowUpRight,
  Send,
  Download,
  Copy,
  Check,
  Globe,
  Plus
} from 'lucide-react';
import type { 
  Report, 
  NewsItem, 
  VillageEvent, 
  CommitteeMember, 
  Resident, 
  MarketplaceItem, 
  HelpRequest, 
  PublicProject, 
  UserProfile,
  NewsSource
} from '../types';
import { 
  updateReportStatus, 
  deleteReport, 
  seedInitialVillageDataIfNeeded,
  generateVillageDatabaseSQL,
  subscribeNewsSources,
  addNewsSource,
  deleteNewsSource
} from '../services/villageService';

interface AdminTabProps {
  currentUser: UserProfile | null;
  reports: Report[];
  news: NewsItem[];
  events: VillageEvent[];
  committee: CommitteeMember[];
  residents: Resident[];
  marketItems: MarketplaceItem[];
  helpRequests: HelpRequest[];
  projects: PublicProject[];
  onSelectTab: (tab: string) => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  currentUser,
  reports,
  news,
  events,
  committee,
  residents,
  marketItems,
  helpRequests,
  projects,
  onSelectTab
}) => {
  const [adminView, setAdminView] = useState<'OVERVIEW' | 'REPORTS' | 'DATABASE'>('OVERVIEW');
  const [selectedReportToUpdate, setSelectedReportToUpdate] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<Report['status']>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState('');
  const [resolutionImageUrl, setResolutionImageUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // News Sources management
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceAgency, setNewSourceAgency] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('LOCAL_BROADCAST');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isCopiedSQL, setIsCopiedSQL] = useState(false);

  useEffect(() => {
    const unsub = subscribeNewsSources(setNewsSources);
    return () => unsub();
  }, []);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  const generateFullSQLScript = () => {
    const ddl = `-- ====================================================================
-- SMART MOO4 - ระบบแพลตฟอร์มบริหารจัดการหมู่บ้านอัจฉริยะ
-- ข่าวสาร บ้านหนองบัวคำมูล หมู่ที่ 4
-- DATABASE SCHEMA DDL & DATA DUMP (SQL INSERT SCRIPT)
-- รองรับ: MySQL, PostgreSQL, MariaDB และ Cloud SQL
-- ====================================================================

-- 1. ตารางข้อมูลแหล่งข่าวสาร (News Sources)
CREATE TABLE IF NOT EXISTS news_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    agency VARCHAR(255),
    url VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางข่าวสารและประกาศหมู่บ้าน (Village News & Announcements)
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'NORMAL',
    is_pinned BOOLEAN DEFAULT FALSE,
    author VARCHAR(150) NOT NULL,
    news_source_name VARCHAR(255),
    source_url VARCHAR(500),
    cover_url VARCHAR(500),
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางทะเบียนประชากรและราษฎร (Residents Registry)
CREATE TABLE IF NOT EXISTS residents (
    id VARCHAR(64) PRIMARY KEY,
    resident_code VARCHAR(50) NOT NULL UNIQUE,
    prefix VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    moo VARCHAR(10) DEFAULT '4',
    phone VARCHAR(30),
    household_count INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางผู้นำชุมชนและกรรมการหมู่บ้าน (Village Committee)
CREATE TABLE IF NOT EXISTS village_committee (
    id VARCHAR(64) PRIMARY KEY,
    prefix VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_category VARCHAR(50) NOT NULL,
    position VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    responsibilities TEXT,
    term_start VARCHAR(50),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ตารางเรื่องร้องเรียน แจ้งเหตุ แจ้งซ่อม (Citizen Voice Reports)
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(64) PRIMARY KEY,
    report_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'NORMAL',
    location_name VARCHAR(255),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    reporter_name VARCHAR(150),
    status VARCHAR(50) DEFAULT 'RECEIVED',
    status_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ตารางโครงการพัฒนาและงบประมาณ (Public Projects)
CREATE TABLE IF NOT EXISTS public_projects (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    budget DECIMAL(12, 2) NOT NULL,
    budget_source VARCHAR(255),
    responsible_agency VARCHAR(255),
    description TEXT,
    progress INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);\n\n`;

    const dml = generateVillageDatabaseSQL(
      residents,
      news,
      reports,
      committee,
      projects,
      marketItems
    );

    return ddl + dml;
  };

  const handleDownloadSQL = () => {
    const fullSql = generateFullSQLScript();
    const blob = new Blob([fullSql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SMART_MOO4_DATABASE_SCHEMA_AND_DATA_${new Date().toISOString().slice(0, 10)}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySQL = async () => {
    const fullSql = generateFullSQLScript();
    try {
      await navigator.clipboard.writeText(fullSql);
      setIsCopiedSQL(true);
      setTimeout(() => setIsCopiedSQL(false), 3000);
    } catch {
      alert('ไม่สามารถคัดลอกลงคลิปบอร์ดได้โดยอัตโนมัติ');
    }
  };

  const handleAddNewsSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    setIsAddingSource(true);
    try {
      await addNewsSource({
        name: newSourceName.trim(),
        category: newSourceCategory as any,
        agency: newSourceAgency.trim() || undefined,
        url: newSourceUrl.trim() || undefined,
        active: true,
        createdAt: new Date().toISOString()
      });
      setNewSourceName('');
      setNewSourceAgency('');
      setNewSourceUrl('');
      alert('เพิ่มแหล่งข่าวสารเรียบร้อยแล้ว');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการเพิ่มแหล่งข่าว: ' + err.message);
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleDeleteNewsSource = async (id: string, name: string) => {
    if (!confirm(`ต้องการลบแหล่งข่าว "${name}" หรือไม่?`)) return;
    try {
      await deleteNewsSource(id);
      alert('ลบแหล่งข่าวเรียบร้อยแล้ว');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 max-w-lg mx-auto p-6 shadow-sm">
        <Shield className="w-16 h-16 mx-auto text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">พื้นที่สำหรับผู้บริหารหมู่บ้าน</h2>
        <p className="text-xs text-slate-500 mt-2">
          หน้านี้สงวนสิทธิ์เฉพาะผู้ใหญ่บ้าน ผู้ช่วยผู้ใหญ่บ้าน หรือแอดมินที่ได้รับอนุญาตเท่านั้นครับ
        </p>
        <button
          onClick={() => onSelectTab('home')}
          className="mt-6 px-4 py-2 bg-[#164B3C] text-white rounded-xl text-xs font-bold"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  // Statistics calculation
  const totalReports = reports.length;
  const receivedReports = reports.filter(r => r.status === 'RECEIVED').length;
  const inProgressReports = reports.filter(r => r.status === 'IN_PROGRESS' || r.status === 'COORDINATED').length;
  const resolvedReports = reports.filter(r => r.status === 'RESOLVED').length;

  // Breakdown by category
  const categoryCounts: Record<string, number> = {};
  reports.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportToUpdate) return;

    setIsUpdating(true);
    try {
      await updateReportStatus(
        selectedReportToUpdate.id,
        newStatus,
        statusNote.trim() || `อัปเดตสถานะเป็น ${newStatus} โดยผู้ดูแลระบบ`,
        resolutionImageUrl.trim()
      );
      setSelectedReportToUpdate(null);
      setStatusNote('');
      setResolutionImageUrl('');
      alert('อัปเดตสถานะเรื่องแจ้งเหตุสำเร็จเรียบร้อย');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการอัปเดต: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('ต้องการตรวจสอบและสร้างข้อมูลตัวอย่างชุมชนจริง (Initial Village Seed) ลงใน Firestore หรือไม่?')) return;
    setIsSeeding(true);
    try {
      const result = await seedInitialVillageDataIfNeeded();
      if (result) {
        alert('สร้างข้อมูลตั้งต้นในฐานข้อมูล Firestore สำเร็จเรียบร้อย');
      } else {
        alert('ระบบมีข้อมูลในฐานข้อมูลอยู่แล้ว ไม่จำเป็นต้องสร้างซ้ำ');
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#164B3C] to-slate-800 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold">ศูนย์ควบคุมและบริหารจัดการหมู่บ้าน</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            SMART MOO4 Admin Dashboard • ข่าวสาร บ้านหนองบัวคำมูล ม.4
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-black/40 p-1 rounded-xl">
          <button
            onClick={() => setAdminView('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminView === 'OVERVIEW' ? 'bg-[#23865B] text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => setAdminView('REPORTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminView === 'REPORTS' ? 'bg-[#23865B] text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            จัดการเรื่องร้องเรียน ({reports.length})
          </button>
          <button
            onClick={() => setAdminView('DATABASE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminView === 'DATABASE' ? 'bg-[#23865B] text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            ฐานข้อมูล
          </button>
        </div>
      </div>

      {adminView === 'OVERVIEW' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main 6 Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">ราษฎรทั้งหมด</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{residents.length} คน</p>
              <button onClick={() => onSelectTab('census')} className="text-[10px] text-emerald-700 font-bold mt-1 inline-flex items-center">
                <span>ดูทะเบียน</span>
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">เรื่องร้องทุกข์</span>
              <p className="text-xl font-extrabold text-red-600 mt-1">{totalReports} เรื่อง</p>
              <span className="text-[10px] text-red-400">แก้ไขแล้ว {resolvedReports}</span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">ข่าวประกาศ</span>
              <p className="text-xl font-extrabold text-[#164B3C] mt-1">{news.length} ข่าว</p>
              <button onClick={() => onSelectTab('news')} className="text-[10px] text-emerald-700 font-bold mt-1 inline-flex items-center">
                <span>จัดการข่าว</span>
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">กิจกรรมหมู่บ้าน</span>
              <p className="text-xl font-extrabold text-purple-700 mt-1">{events.length} กิจกรรม</p>
              <button onClick={() => onSelectTab('events')} className="text-[10px] text-purple-700 font-bold mt-1 inline-flex items-center">
                <span>ดูปฏิทิน</span>
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">สินค้าชุมชน</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">{marketItems.length} รายการ</p>
              <button onClick={() => onSelectTab('market')} className="text-[10px] text-emerald-700 font-bold mt-1 inline-flex items-center">
                <span>เปิดตลาด</span>
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">โครงการพัฒนา</span>
              <p className="text-xl font-extrabold text-blue-700 mt-1">{projects.length} โครงการ</p>
              <button onClick={() => onSelectTab('projects')} className="text-[10px] text-blue-700 font-bold mt-1 inline-flex items-center">
                <span>ตรวจงบ</span>
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Issue Breakdown Chart / Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-[#23865B]" />
                <span>สถิติประเภทปัญหาที่ได้รับแจ้งมากที่สุด</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const percent = Math.round((count / Math.max(totalReports, 1)) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{cat}</span>
                        <span>{count} เรื่อง ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#164B3C] to-[#23865B] rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolution Rate Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center space-x-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>อัตราความสำเร็จในการแก้ไขปัญหาชุมชน</span>
                </h3>

                <div className="flex items-center space-x-6">
                  <div className="w-28 h-28 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold text-emerald-800">
                      {totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 100}%
                    </span>
                    <span className="text-[10px] text-slate-400">ปิดงาน</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span>รอตรวจสอบ: {receivedReports} เรื่อง</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>กำลังดำเนินการ: {inProgressReports} เรื่อง</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>แก้ไขเสร็จสิ้น: {resolvedReports} เรื่อง</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setAdminView('REPORTS')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#164B3C] text-white text-xs font-bold transition-colors"
                >
                  เข้าสู่หน้าอัปเดตและติดตามเรื่องร้องเรียนทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminView === 'REPORTS' && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">รายการแจ้งเหตุทั้งหมด ({reports.length})</h3>
            <span className="text-xs text-slate-400">คลิกที่ปุ่มจัดการเพื่อเปลี่ยนสถานะ</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {reports.map(rep => (
              <div key={rep.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {rep.reportNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">{rep.title}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                    <span>ประเภท: {rep.category}</span>
                    <span>•</span>
                    <span>ผู้แจ้ง: {rep.reporterName}</span>
                    <span>•</span>
                    <span>พิกัด: {rep.locationName || 'ม.4'}</span>
                  </div>
                  {rep.statusNote && (
                    <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-1.5 rounded">
                      บันทึก: {rep.statusNote}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedReportToUpdate(rep);
                      setNewStatus(rep.status);
                      setStatusNote(rep.statusNote || '');
                    }}
                    className="px-3 py-1.5 bg-[#164B3C] hover:bg-[#23865B] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    อัปเดตสถานะ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminView === 'DATABASE' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Card 1: Netlify 100% Client-Side Ready Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-emerald-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-300 tracking-wider uppercase">
                    Netlify Deployment & Database Ready (100%)
                  </span>
                </div>
                <h3 className="text-lg font-extrabold mt-1 text-white">
                  รองรับการ Deploy ผ่าน .netlify.app ได้ทันทีแบบ 100%
                </h3>
                <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                  ระบบเชื่อมต่อ Firestore Database SDK จากเบราว์เซอร์โดยตรง (Client-Side) ทำให้สามารถ Add, Edit, Delete, Update, Select ข้อมูลได้ครบถ้วนโดยไม่ต้องพึ่ง Server หลังบ้าน พร้อมไฟล์ <code className="bg-white/20 px-1 py-0.5 rounded text-white">public/_redirects</code> สำหรับ SPA Routing แล้ว
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-xl text-xs font-bold">
                  Firestore Connected
                </span>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-xl text-xs font-bold">
                  SPA Redirects OK
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Firestore Collections & Seed Data */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-700" />
                <span>สถานะคอลเลกชัน Cloud Firestore ปัจจุบัน</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Firestore Database ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono text-[11px]">ai-studio-smartmoo44-f1208328-6c4b-43c9-9c25-a2ff71e906d5</code>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">residents</span>
                <span className="font-bold text-slate-800 text-sm">{residents.length} รายการ</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">reports</span>
                <span className="font-bold text-slate-800 text-sm">{reports.length} รายการ</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">news</span>
                <span className="font-bold text-slate-800 text-sm">{news.length} รายการ</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">village_committee</span>
                <span className="font-bold text-slate-800 text-sm">{committee.length} รายการ</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">public_projects</span>
                <span className="font-bold text-slate-800 text-sm">{projects.length} รายการ</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">marketplace</span>
                <span className="font-bold text-slate-800 text-sm">{marketItems.length} รายการ</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100">
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#164B3C] text-white font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'กำลังนำเข้าข้อมูล...' : 'ตรวจสอบ/สร้างข้อมูลตั้งต้นจำลองจริง (Seed Data)'}</span>
              </button>
              <span className="text-[11px] text-slate-400">
                หากฐานข้อมูลว่างเปล่า ปุ่มนี้จะทำการสร้างข้อมูลจำลองหมู่บ้านตั้งต้นให้ทันที
              </span>
            </div>
          </div>

          {/* Card 3: SQL Schema & Data Export (MySQL / PostgreSQL / Cloud SQL) */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <Database className="w-5 h-5 text-amber-600" />
                  <span>สร้าง SQL สำหรับ CREATE TABLE & INSERT Data ทั้งหมด</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ดาวน์โหลดสคริปต์ SQL ครบชุด นำไป Run บน MySQL, PostgreSQL, MariaDB หรือ Cloud SQL ได้ทันที
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopySQL}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  {isCopiedSQL ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก SQL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadSQL}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ .sql</span>
                </button>
              </div>
            </div>

            {/* SQL Snippet Preview Box */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
              <pre className="text-emerald-400">{`-- SMART MOO4 SQL SCHEMA & LIVE DATA BACKUP`}</pre>
              <pre className="text-slate-300">{`CREATE TABLE IF NOT EXISTS news_sources (...);
CREATE TABLE IF NOT EXISTS news (...);
CREATE TABLE IF NOT EXISTS residents (...);
CREATE TABLE IF NOT EXISTS village_committee (...);
CREATE TABLE IF NOT EXISTS reports (...);
CREATE TABLE IF NOT EXISTS public_projects (...);

-- LIVE INSERT DATA (${residents.length} residents, ${news.length} news, ${reports.length} reports)`}</pre>
              <pre className="text-amber-400">{`INSERT INTO news (title, content, category, ...) VALUES (...);`}</pre>
            </div>
          </div>

          {/* Card 4: News Sources Manager (แหล่งข่าวสารชุมชน) */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-[#23865B]" />
                  <span>จัดการข้อมูลแหล่งข่าวสาร (News Sources)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  บันทึกและจัดการรายชื่อหน่วยงานแหล่งข่าว เช่น อบต., กรมอุตุนิยมวิทยา, หอกระจายข่าว ม.4, รพ.สต.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {newsSources.length} แหล่งข่าว
              </span>
            </div>

            {/* Add News Source Form */}
            <form onSubmit={handleAddNewsSource} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                <span>เพิ่มแหล่งข่าวสารใหม่</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ชื่อแหล่งข่าว *</label>
                  <input
                    type="text"
                    required
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    placeholder="เช่น องค์การบริหารส่วนตำบล (อบต.)"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">หน่วยงานต้นสังกัด</label>
                  <input
                    type="text"
                    value={newSourceAgency}
                    onChange={(e) => setNewSourceAgency(e.target.value)}
                    placeholder="เช่น อบต. ในพื้นที่"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">เว็บไซต์ / แฟนเพจ URL</label>
                  <input
                    type="url"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                  <span>ประเภท:</span>
                  <select
                    value={newSourceCategory}
                    onChange={(e) => setNewSourceCategory(e.target.value)}
                    className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1"
                  >
                    <option value="LOCAL_BROADCAST">หอกระจายข่าวหมู่บ้าน</option>
                    <option value="GOVERNMENT">หน่วยงานภาครัฐ / อบต.</option>
                    <option value="DISASTER_ALERT">เตือนภัยธรรมชาติ / อุตุนิยมวิทยา</option>
                    <option value="HEALTH">สาธารณสุข / รพ.สต.</option>
                    <option value="COMMUNITY">ชุมชนและองค์กรปกครอง</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAddingSource}
                  className="px-4 py-2 bg-[#164B3C] hover:bg-[#23865B] text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isAddingSource ? 'กำลังบันทึก...' : 'บันทึกแหล่งข่าว'}
                </button>
              </div>
            </form>

            {/* News Sources List */}
            <div className="divide-y divide-slate-100">
              {newsSources.map(source => (
                <div key={source.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{source.name}</span>
                      {source.agency && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {source.agency}
                        </span>
                      )}
                    </div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-700 hover:underline inline-flex items-center mt-0.5"
                      >
                        <span>{source.url}</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteNewsSource(source.id, source.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="ลบแหล่งข่าวนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Update Report Status Modal */}
      {selectedReportToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              อัปเดตสถานะเรื่อง: {selectedReportToUpdate.reportNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedReportToUpdate.title}</p>

            <form onSubmit={handleUpdateReport} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">สถานะดำเนินการ</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="RECEIVED">รับแจ้งแล้ว</option>
                  <option value="PENDING_CHECK">รอตรวจสอบ</option>
                  <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                  <option value="COORDINATED">ประสานงานแล้ว</option>
                  <option value="RESOLVED">แก้ไขเรียบร้อย</option>
                  <option value="CANNOT_PROCEED">ไม่สามารถดำเนินการได้</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">บันทึกความคืบหน้าสำหรับชาวบ้าน *</label>
                <textarea
                  required
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="เช่น ผู้ใหญ่บ้านประสานงานช่าง อบต. เข้าเปลี่ยนหลอดไฟเรียบร้อยแล้ว..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL รูปภาพหลังการแก้ไข (ไม่บังคับ)</label>
                <input
                  type="url"
                  value={resolutionImageUrl}
                  onChange={(e) => setResolutionImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedReportToUpdate(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-[#164B3C] text-white font-bold text-xs shadow-md"
                >
                  {isUpdating ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
