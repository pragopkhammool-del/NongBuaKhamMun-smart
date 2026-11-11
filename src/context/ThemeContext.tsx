import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'emerald' | 'pastel' | 'ocean' | 'amber' | 'terracotta' | 'purple' | 'accessible';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  primaryDark: string;    // Header, main branding background
  primaryMedium: string;  // Buttons, active states
  accent: string;         // Highlights, badges
  lightBg: string;        // Light pill backgrounds
  bgGradient: string;     // Tailwind gradient for hero
  btnGradient: string;    // Button gradient
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'เขียวมรกต หนองบัวคำมูล (ดั้งเดิม)',
    tagline: 'ธรรมชาติ ร่มเย็น ความอุดมสมบูรณ์',
    primaryDark: '#164B3C',
    primaryMedium: '#23865B',
    accent: '#4CAF50',
    lightBg: '#E8F5E9',
    bgGradient: 'from-[#164B3C] via-[#1E5D4B] to-[#23865B]',
    btnGradient: 'from-[#164B3C] to-[#23865B]'
  },
  pastel: {
    id: 'pastel',
    name: 'พาสเทลมินิมอล (Pastel Modern)',
    tagline: 'โทนสีพาสเทลละมุน สดใส อ่านสบายตา สไตล์แอปสมัยใหม่',
    primaryDark: '#2D6A4F',
    primaryMedium: '#40916C',
    accent: '#F4A261',
    lightBg: '#E8F5E9',
    bgGradient: 'from-[#2D6A4F] via-[#40916C] to-[#52B788]',
    btnGradient: 'from-[#2D6A4F] to-[#52B788]'
  },
  ocean: {
    id: 'ocean',
    name: 'น้ำเงินคราม ชุมชนชลประทาน',
    tagline: 'สุขุม มั่นคง สายน้ำแห่งชีวิต',
    primaryDark: '#0F2C59',
    primaryMedium: '#1E56A0',
    accent: '#3B82F6',
    lightBg: '#EFF6FF',
    bgGradient: 'from-[#0F2C59] via-[#163A70] to-[#1E56A0]',
    btnGradient: 'from-[#0F2C59] to-[#1E56A0]'
  },
  amber: {
    id: 'amber',
    name: 'ทองคำมงคล รุ่งเรืองพัฒนา',
    tagline: 'เกียรติยศ เจริญรุ่งเรือง งานบุญประเพณี',
    primaryDark: '#78350F',
    primaryMedium: '#D97706',
    accent: '#F59E0B',
    lightBg: '#FEF3C7',
    bgGradient: 'from-[#78350F] via-[#92400E] to-[#D97706]',
    btnGradient: 'from-[#78350F] to-[#D97706]'
  },
  terracotta: {
    id: 'terracotta',
    name: 'แสดดินเผา ชุมชนเข้มแข็ง',
    tagline: 'อบอุ่น ขยันขันแข็ง สามัคคี',
    primaryDark: '#7C2D12',
    primaryMedium: '#EA580C',
    accent: '#F97316',
    lightBg: '#FFEDD5',
    bgGradient: 'from-[#7C2D12] via-[#9A3412] to-[#EA580C]',
    btnGradient: 'from-[#7C2D12] to-[#EA580C]'
  },
  purple: {
    id: 'purple',
    name: 'ม่วงราชพฤกษ์ วัฒนธรรมล้านนา',
    tagline: 'ประณีต สง่างาม อัตลักษณ์ท้องถิ่น',
    primaryDark: '#4A154B',
    primaryMedium: '#7C3AED',
    accent: '#A855F7',
    lightBg: '#F3E8FF',
    bgGradient: 'from-[#4A154B] via-[#6B21A8] to-[#7C3AED]',
    btnGradient: 'from-[#4A154B] to-[#7C3AED]'
  },
  accessible: {
    id: 'accessible',
    name: 'สบายตา อ่านง่าย Contrast สูง',
    tagline: 'คมชัด ตัวหนังสือเด่น เหมาะสำหรับทุกวัย',
    primaryDark: '#111827',
    primaryMedium: '#059669',
    accent: '#10B981',
    lightBg: '#F0FDF4',
    bgGradient: 'from-[#111827] via-[#1F2937] to-[#059669]',
    btnGradient: 'from-[#111827] to-[#059669]'
  }
};

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: THEMES.emerald,
  setTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('smart_moo4_theme') as ThemeId;
    return saved && THEMES[saved] ? saved : 'emerald';
  });

  const setTheme = (newId: ThemeId) => {
    if (THEMES[newId]) {
      setThemeId(newId);
      localStorage.setItem('smart_moo4_theme', newId);
    }
  };

  const currentTheme = THEMES[themeId] || THEMES.emerald;

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
