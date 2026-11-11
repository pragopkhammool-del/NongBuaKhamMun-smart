import React from 'react';
import { Home, Newspaper, AlertCircle, ShoppingBag, Grid } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMoreMenu
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden safe-area-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {/* 1. หน้าแรก */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'home' ? 'text-[#164B3C] font-semibold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1">หน้าแรก</span>
        </button>

        {/* 2. ข่าวสาร */}
        <button
          onClick={() => setActiveTab('news')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'news' ? 'text-[#164B3C] font-semibold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Newspaper className={`w-5 h-5 ${activeTab === 'news' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1">ข่าวสาร</span>
        </button>

        {/* 3. แจ้งเหตุ (ปุ่มกลางเด่น Raised Button) */}
        <div className="flex justify-center -mt-5">
          <button
            onClick={() => setActiveTab('report')}
            className={`w-13 h-13 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
              activeTab === 'report'
                ? 'bg-gradient-to-tr from-[#164B3C] to-[#23865B] ring-4 ring-emerald-200'
                : 'bg-gradient-to-tr from-[#E74C3C] to-[#F39C12] hover:shadow-xl'
            }`}
          >
            <AlertCircle className="w-6 h-6 stroke-[2.5]" />
            <span className="text-[9px] font-bold mt-0.5 leading-none">แจ้งเหตุ</span>
          </button>
        </div>

        {/* 4. ตลาด */}
        <button
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'market' ? 'text-[#164B3C] font-semibold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${activeTab === 'market' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1">ตลาด</span>
        </button>

        {/* 5. เมนูเพิ่มเติม */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            ['more', 'map', 'events', 'helping', 'projects', 'forum', 'census', 'committee', 'ai', 'admin'].includes(activeTab)
              ? 'text-[#164B3C] font-semibold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid className="w-5 h-5 stroke-2" />
          <span className="text-[11px] mt-1">เมนูเพิ่ม</span>
        </button>
      </div>
    </nav>
  );
};
