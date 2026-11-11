/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, firebaseConfig } from './firebase';
import { 
  getUserProfile, 
  saveUserProfile,
  subscribeNews,
  subscribeReports,
  subscribeEvents,
  subscribeMarketplace,
  subscribeHelpRequests,
  subscribeProjects,
  subscribeResidents,
  subscribeCommittee,
  subscribeNotifications,
  subscribeCommunityPosts,
  seedInitialVillageDataIfNeeded,
  syncOfficialCommitteeMembers
} from './services/villageService';
import type { 
  UserProfile, 
  NewsItem, 
  Report, 
  VillageEvent, 
  MarketplaceItem, 
  HelpRequest, 
  PublicProject, 
  Resident, 
  CommitteeMember, 
  VillageNotification,
  CommunityPost 
} from './types';

// Components
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { MoreMenuModal } from './components/MoreMenuModal';
import { ThemeModal } from './components/ThemeModal';

// Tabs
import { HomeTab } from './components/HomeTab';
import { NewsTab } from './components/NewsTab';
import { ReportTab } from './components/ReportTab';
import { MapTab } from './components/MapTab';
import { MarketplaceTab } from './components/MarketplaceTab';
import { EventsTab } from './components/EventsTab';
import { HelpingTab } from './components/HelpingTab';
import { ProjectsTab } from './components/ProjectsTab';
import { CommitteeTab } from './components/CommitteeTab';
import { CensusTab } from './components/CensusTab';
import { ForumTab } from './components/ForumTab';
import { AiAssistantTab } from './components/AiAssistantTab';
import { AdminTab } from './components/AdminTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [gmpQuotaReached, setGmpQuotaReached] = useState(false);

  // Firestore Real-time States
  const [news, setNews] = useState<NewsItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [notifications, setNotifications] = useState<VillageNotification[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  // 1. Google Maps Quota Listener (from google-maps-platform skill)
  useEffect(() => {
    const handleQuota = () => setGmpQuotaReached(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // 2. Auth State Changed Listener + Admin Passcode 43210344 Persistence
  useEffect(() => {
    const checkPasscodeAuth = () => {
      const savedPasscode = localStorage.getItem('smart_moo4_admin_passcode_auth');
      if (savedPasscode === '43210344') {
        setCurrentUser({
          uid: 'admin-passcode-43210344',
          email: 'admin.moo4@village.local',
          displayName: 'ผู้ดูแลระบบ รหัส 43210344',
          firstName: 'ผู้ดูแลระบบ',
          lastName: 'บ้านหนองบัวคำมูล ม.4',
          houseNumber: '1',
          moo: '4',
          role: 'ADMIN',
          createdAt: new Date().toISOString()
        });
        setAuthLoading(false);
        return true;
      }
      return false;
    };

    const isPasscodeLoggedIn = checkPasscodeAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let profile = await getUserProfile(user.uid);
        if (!profile) {
          const names = (user.displayName || '').split(' ');
          const isDefaultAdmin = user.email === 'pragopkhammool@gmail.com';
          profile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            firstName: names[0] || 'ชาวบ้าน',
            lastName: names.slice(1).join(' ') || 'ม.4',
            houseNumber: '-',
            moo: '4',
            phone: user.phoneNumber || '',
            photoURL: user.photoURL || '',
            role: isDefaultAdmin ? 'ADMIN' : 'MEMBER',
            createdAt: new Date().toISOString()
          };
          await saveUserProfile(profile);
        }
        setCurrentUser(profile);
      } else if (!isPasscodeLoggedIn) {
        // Only reset if not logged in via admin passcode 43210344
        const hasPasscode = localStorage.getItem('smart_moo4_admin_passcode_auth') === '43210344';
        if (!hasPasscode) {
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Real-time Subscriptions to Firestore Collections
  useEffect(() => {
    // Seed initial village data & sync 15 official committee members
    seedInitialVillageDataIfNeeded()
      .then(() => syncOfficialCommitteeMembers())
      .catch(console.warn);

    const unsubNews = subscribeNews(setNews);
    const unsubReports = subscribeReports(setReports);
    const unsubEvents = subscribeEvents(setEvents);
    const unsubMarket = subscribeMarketplace(setMarketItems);
    const unsubHelp = subscribeHelpRequests(setHelpRequests);
    const unsubProjects = subscribeProjects(setProjects);
    const unsubResidents = subscribeResidents(setResidents);
    const unsubCommittee = subscribeCommittee(setCommittee);
    const unsubNotifs = subscribeNotifications(setNotifications);
    const unsubPosts = subscribeCommunityPosts(setCommunityPosts);

    return () => {
      unsubNews();
      unsubReports();
      unsubEvents();
      unsubMarket();
      unsubHelp();
      unsubProjects();
      unsubResidents();
      unsubCommittee();
      unsubNotifs();
      unsubPosts();
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('smart_moo4_admin_passcode_auth');
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col selection:bg-[#23865B] selection:text-white">
      {/* Google Maps Quota Warning Sticky Top Bar (Case A Requirement) */}
      {gmpQuotaReached && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Main Top Navbar */}
      <Navbar
        currentUser={currentUser}
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {activeTab === 'home' && (
          <HomeTab
            news={news}
            reports={reports}
            events={events}
            marketItems={marketItems}
            committee={committee}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'news' && (
          <NewsTab
            news={news}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'report' && (
          <ReportTab
            reports={reports}
            currentUser={currentUser}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'map' && (
          <MapTab
            reports={reports}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'market' && (
          <MarketplaceTab
            items={marketItems}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'events' && (
          <EventsTab
            events={events}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'committee' && (
          <CommitteeTab
            members={committee}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'census' && (
          <CensusTab
            residents={residents}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'helping' && (
          <HelpingTab
            requests={helpRequests}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            projects={projects}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'forum' && (
          <ForumTab
            posts={communityPosts}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'ai' && (
          <AiAssistantTab
            news={news}
            events={events}
            committee={committee}
            marketItems={marketItems}
            reports={reports}
          />
        )}

        {activeTab === 'admin' && (
          <AdminTab
            currentUser={currentUser}
            reports={reports}
            news={news}
            events={events}
            committee={committee}
            residents={residents}
            marketItems={marketItems}
            helpRequests={helpRequests}
            projects={projects}
            onSelectTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer (Desktop & Tablet) */}
      <footer className="hidden lg:block bg-white border-t border-slate-200 mt-auto py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[#164B3C] text-sm">SMART MOO4</span>
            <span>•</span>
            <span>ข่าวสาร บ้านหนองบัวคำมูล หมู่ที่ 4</span>
          </div>
          <p className="italic text-emerald-800 font-medium">
            "หมู่บ้านทันสมัย ข่าวสารทั่วถึง ช่วยเหลือกัน สร้างชุมชนให้น่าอยู่"
          </p>
          <p className="text-slate-400">
            แพลตฟอร์มบริหารจัดการหมู่บ้านอัจฉริยะ © 2569
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
      />

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(profile) => setCurrentUser(profile)}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onSelectTab={setActiveTab}
      />

      <MoreMenuModal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
}
