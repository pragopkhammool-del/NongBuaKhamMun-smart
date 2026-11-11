import React, { useState } from 'react';
import { 
  Bell, 
  User as UserIcon, 
  Shield, 
  PhoneCall, 
  LogOut, 
  CheckCircle2, 
  Sparkles,
  Menu,
  X,
  Palette
} from 'lucide-react';
import type { UserProfile, VillageNotification } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentUser: UserProfile | null;
  notifications: VillageNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenThemeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notifications,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenNotifications,
  onOpenThemeModal,
}) => {
  const { currentTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  const navLinks = [
    { id: 'home', label: 'หน้าแรก' },
    { id: 'news', label: 'ข่าวสาร' },
    { id: 'report', label: 'แจ้งเหตุ' },
    { id: 'map', label: 'แผนที่' },
    { id: 'market', label: 'ตลาดชุมชน' },
    { id: 'ai', label: 'ถาม AI' },
    { id: 'events', label: 'กิจกรรม' },
    { id: 'committee', label: 'ผู้นำชุมชน' },
    { id: 'helping', label: 'ช่วยเหลือ' },
    { id: 'projects', label: 'งบประมาณ' },
    { id: 'forum', label: 'กระดานประชาคม' },
  ];

  if (isAdmin) {
    navLinks.push({ id: 'admin', label: 'ระบบหลังบ้าน' });
  }

  return (
    <header 
      className="sticky top-0 z-40 text-white shadow-md border-b transition-colors duration-300"
      style={{ 
        backgroundColor: currentTheme.primaryDark,
        borderColor: `${currentTheme.primaryMedium}50`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab('home')}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner text-white font-bold text-lg border border-white/20"
              style={{ backgroundColor: currentTheme.primaryMedium }}
            >
              ม.4
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-wide text-white">SMART MOO4</span>
                <span 
                  className="text-[10px] text-white px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: currentTheme.primaryMedium }}
                >
                  หนองบัวคำมูล
                </span>
              </div>
              <p className="text-xs text-white/80 font-normal truncate max-w-[190px] sm:max-w-xs">
                ข่าวสาร บ้านหนองบัวคำมูล หมู่ที่ 4
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.slice(0, 7).map(link => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === link.id 
                    ? 'text-white shadow-sm font-bold' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                style={activeTab === link.id ? { backgroundColor: currentTheme.primaryMedium } : {}}
              >
                {link.id === 'ai' && <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-300" />}
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center space-x-1 transition-colors ${
                  activeTab === 'admin' 
                    ? 'bg-amber-500 text-slate-900 font-bold' 
                    : 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>แอดมิน</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Theme Switcher Button */}
            <button
              onClick={onOpenThemeModal}
              title="เปลี่ยนสีธีมเทมเพลต"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Palette className="w-5 h-5" />
            </button>

            {/* Quick Emergency Phone */}
            <a
              href="tel:0812345678"
              title="โทรด่วนผู้ใหญ่บ้าน"
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full shadow transition-transform active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">สายด่วน ม.4</span>
            </a>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-400 text-slate-900 font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('admin')}
                  className="flex items-center space-x-2 bg-[#1E5D4B] hover:bg-[#23865B] px-2.5 py-1.5 rounded-xl border border-emerald-600/30 transition-all text-left"
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.firstName} 
                      className="w-7 h-7 rounded-full object-cover border border-emerald-300"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#23865B] text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.firstName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="hidden md:block">
                    <p className="text-xs font-semibold leading-tight">{currentUser.firstName}</p>
                    <p className="text-[10px] text-emerald-300 leading-tight">บ้านเลขที่ {currentUser.houseNumber || '-'}</p>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="p-1.5 rounded-lg text-emerald-200 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 bg-[#23865B] hover:bg-[#2BA06E] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm border border-emerald-400/30 transition-all active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Mobile menu hamburger for extra tabs */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-emerald-100 hover:bg-[#1E5D4B] lg:hidden"
              aria-label="เมนู"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#133E32] border-t border-emerald-700/40 px-4 py-3 space-y-1 shadow-xl animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === link.id
                    ? 'bg-[#23865B] text-white font-bold'
                    : 'text-emerald-100 hover:bg-[#1E5D4B]'
                }`}
              >
                {link.id === 'ai' && <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />}
                {link.id === 'admin' && <Shield className="w-4 h-4 mr-1.5 text-amber-300" />}
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
