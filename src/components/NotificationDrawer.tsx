import React from 'react';
import { X, Bell, Check, Info, AlertTriangle, Calendar, MessageSquare, ExternalLink } from 'lucide-react';
import type { VillageNotification } from '../types';
import { markNotificationAsRead } from '../services/villageService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: VillageNotification[];
  onSelectTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectTab
}) => {
  if (!isOpen) return null;

  const handleItemClick = async (notif: VillageNotification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    if (notif.linkTab) {
      onSelectTab(notif.linkTab);
      onClose();
    }
  };

  const getIcon = (type: VillageNotification['type']) => {
    switch (type) {
      case 'REPORT':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'HELP':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-[#23865B]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slideLeft">
        {/* Header */}
        <div className="p-4 bg-[#164B3C] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-bold text-base">การแจ้งเตือนหมู่บ้าน</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-emerald-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="text-sm">ไม่มีการแจ้งเตือนในขณะนี้</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  notif.isRead 
                    ? 'bg-slate-50 border-slate-100 opacity-80' 
                    : 'bg-emerald-50/60 border-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-100 shadow-xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            ข่าวสาร บ้านหนองบัวคำมูล หมู่ที่ 4
          </p>
        </div>
      </div>
    </div>
  );
};
