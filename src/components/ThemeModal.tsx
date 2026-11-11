import React from 'react';
import { Palette, Check, X } from 'lucide-react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme } = useTheme();

  if (!isOpen) return null;

  const themesList = Object.values(THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#164B3C] flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">เปลี่ยนธีมสีเทมเพลต</h2>
            <p className="text-xs text-slate-500">เลือกชุดสีอัตลักษณ์ประจำหมู่บ้านที่ต้องการ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {themesList.map(theme => {
            const isSelected = currentTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setTheme(theme.id as ThemeId);
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-200' 
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">{theme.name}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mb-3">{theme.tagline}</p>
                </div>

                {/* Color swatches */}
                <div className="flex items-center space-x-1.5">
                  <div 
                    className="w-6 h-6 rounded-lg shadow-xs border border-white"
                    style={{ backgroundColor: theme.primaryDark }}
                    title="สีหลักเข้ม"
                  />
                  <div 
                    className="w-6 h-6 rounded-lg shadow-xs border border-white"
                    style={{ backgroundColor: theme.primaryMedium }}
                    title="สีหลักกลาง"
                  />
                  <div 
                    className="w-6 h-6 rounded-lg shadow-xs border border-white"
                    style={{ backgroundColor: theme.accent }}
                    title="สีไฮไลต์"
                  />
                  <div 
                    className="w-6 h-6 rounded-lg shadow-xs border border-slate-200"
                    style={{ backgroundColor: theme.lightBg }}
                    title="สีพื้นหลังอ่อน"
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">การตั้งค่าสีจะถูกบันทึกไว้ในอุปกรณ์ของท่าน</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
          >
            เรียบร้อย
          </button>
        </div>
      </div>
    </div>
  );
};
