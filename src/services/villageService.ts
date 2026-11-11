import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import type {
  UserProfile,
  Resident,
  CommitteeMember,
  Report,
  NewsItem,
  VillageEvent,
  MarketplaceItem,
  HelpRequest,
  PublicProject,
  CommunityPost,
  PostComment,
  VillageNotification,
  NewsSource
} from '../types';

export const ADMIN_PASSCODE = '43210344';

// Helper for generating report tracking number: MOO4-2026-XXXXX
export function generateReportNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `MOO4-${year}-${random}`;
}

// Helper for resident code
export function generateResidentCode(houseNumber: string, count: number): string {
  const cleanHouse = houseNumber.replace(/[^a-zA-Z0-9]/g, '');
  return `RES-${cleanHouse}-${String(count).padStart(3, '0')}`;
}

// -------------------------------------------------------------
// USER PROFILES & AUTH DATA
// -------------------------------------------------------------
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// RESIDENTS CENSUS (CRUD)
// -------------------------------------------------------------
export async function getResidents(): Promise<Resident[]> {
  const path = 'residents';
  try {
    const q = query(collection(db, path), orderBy('houseNumber', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Resident));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeResidents(callback: (residents: Resident[]) => void) {
  const path = 'residents';
  const q = query(collection(db, path), orderBy('houseNumber', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Resident));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function addResident(data: Omit<Resident, 'id'>): Promise<string> {
  const path = 'residents';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateResident(id: string, data: Partial<Resident>): Promise<void> {
  const path = `residents/${id}`;
  try {
    await updateDoc(doc(db, 'residents', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteResident(id: string): Promise<void> {
  const path = `residents/${id}`;
  try {
    await deleteDoc(doc(db, 'residents', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// COMMITTEE MEMBERS (CRUD)
// -------------------------------------------------------------
export async function getCommitteeMembers(): Promise<CommitteeMember[]> {
  const path = 'village_committee';
  try {
    const q = query(collection(db, path), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommitteeMember));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeCommittee(callback: (members: CommitteeMember[]) => void) {
  const path = 'village_committee';
  const q = query(collection(db, path), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommitteeMember));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function addCommitteeMember(data: Omit<CommitteeMember, 'id'>): Promise<string> {
  const path = 'village_committee';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateCommitteeMember(id: string, data: Partial<CommitteeMember>): Promise<void> {
  const path = `village_committee/${id}`;
  try {
    await updateDoc(doc(db, 'village_committee', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCommitteeMember(id: string): Promise<void> {
  const path = `village_committee/${id}`;
  try {
    await deleteDoc(doc(db, 'village_committee', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// รายชื่อทำเนียบคณะกรรมการหมู่บ้าน 15 ท่านอย่างเป็นทางการ
// บ้านหนองบัวคำมูล หมู่ที่ 4
export const OFFICIAL_15_COMMITTEE_MEMBERS: Omit<CommitteeMember, 'id'>[] = [
  {
    prefix: 'นาย',
    firstName: 'ธนพล',
    lastName: 'เสนบี้',
    roleCategory: 'HEADMAN',
    position: 'ผู้ใหญ่บ้าน / ประธาน',
    phone: '081-234-5678',
    responsibilities: 'ผู้ใหญ่บ้านและประธานกรรมการหมู่บ้าน เป็นผู้นำฝ่ายบริหารงานหมู่บ้าน ประสานงานหน่วยงานราชการ และดูแลความสงบเรียบร้อย',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 1,
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'สำรอง',
    lastName: 'คำมูล',
    roleCategory: 'ASSISTANT',
    position: 'รองประธาน',
    phone: '089-876-5432',
    responsibilities: 'รองประธานกรรมการหมู่บ้าน ช่วยเหลืองานประธาน ควบคุมดูแลการปฏิบัติงาน และรักษาความมั่นคงปลอดภัย',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 2,
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'ทองพูล',
    lastName: 'คำมูล',
    roleCategory: 'ASSISTANT',
    position: 'รองประธาน (ถ้ามี)',
    phone: '086-555-4321',
    responsibilities: 'รองประธานกรรมการหมู่บ้าน ดูแลระบบสาธารณูปโภค แหล่งน้ำ และสิ่งแวดล้อมชุมชน',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 3,
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'พิบูลย์',
    lastName: 'คำมูล',
    roleCategory: 'COMMITTEE',
    position: 'เลขานุการ',
    phone: '084-111-2233',
    responsibilities: 'เลขานุการ รับผิดชอบงานเอกสาร งานสารบรรณ จัดทำรายงานการประชุม และประสานงานข้อมูลข่าวสาร',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 4,
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'สุนทร',
    lastName: 'โนนทิง',
    roleCategory: 'COMMITTEE',
    position: 'เหรัญญิก',
    phone: '082-333-4455',
    responsibilities: 'เหรัญญิก ดูแลการเงินและบัญชีกองทุนหมู่บ้าน จัดทำบัญชีรายรับ-รายจ่ายอย่างโปร่งใส',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 5,
    photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'ประดิษฐ์',
    lastName: 'โสมนาวัตร',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '085-444-5566',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายพัฒนาโครงสร้างพื้นฐานและงานสาธารณประโยชน์',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 6,
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'ดาวรุ่ง',
    lastName: 'โพธิ์ศรี',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '087-555-6677',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายส่งเสริมอาชีพและการเกษตรอินทรีย์ชุมชน',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 7,
    photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาง',
    firstName: 'สุวรรณ',
    lastName: 'คำมูล',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '083-666-7788',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายส่งเสริมกลุ่มสตรี สวัสดิการสังคม และผู้สูงอายุ',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 8,
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาง',
    firstName: 'คำปน',
    lastName: 'แก้วปัญญา',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '086-777-8899',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายศาสนา วัฒนธรรม งานบุญประเพณี และการศึกษา',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 9,
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'ธนายุทธ',
    lastName: 'ก่านพรมมา',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '081-888-9900',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายกิจกรรมเยาวชน กีฬา และการสื่อสารดิจิทัล',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 10,
    photoURL: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'นิยม',
    lastName: 'คำมูล',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '088-999-0011',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายป้องกันและบรรเทาสาธารณภัย กิจการ อปพร.',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 11,
    photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'ประคอง',
    lastName: 'วรบุตร',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '089-000-1122',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายงานรักษาความสงบเรียบร้อยและระเบียบวินัยชุมชน',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 12,
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'บุญฟุ้ง',
    lastName: 'สมภาร',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '082-111-2233',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายโยธาและซ่อมบำรุงไฟฟ้าสาธารณะ ไฟส่องสว่างทางสัญจร',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 13,
    photoURL: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'ประหยัด',
    lastName: 'คำมูล',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '084-222-3344',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายสิ่งแวดล้อม การจัดการขยะชุมชน และรักษาความสะอาด',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 14,
    photoURL: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'นาย',
    firstName: 'ประมวล',
    lastName: 'โพธิ์ศรี',
    roleCategory: 'COMMITTEE',
    position: 'กรรมการ',
    phone: '087-333-4455',
    responsibilities: 'กรรมการหมู่บ้าน ฝ่ายตรวจสอบ ประเมินผล และรับฟังความคิดเห็นจากชาวบ้าน',
    termStart: '2565 - ปัจจุบัน',
    status: 'ACTIVE',
    order: 15,
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
  }
];

// ฟังก์ชันนำเข้าและซิงค์ทำเนียบคณะกรรมการ 15 ท่านลง Firestore
export async function syncOfficialCommitteeMembers(): Promise<number> {
  const path = 'village_committee';
  try {
    const existingSnap = await getDocs(collection(db, path));
    const existingMap = new Map<string, string>();
    existingSnap.docs.forEach(docSnap => {
      const data = docSnap.data();
      const key = `${data.firstName}_${data.lastName}`;
      existingMap.set(key, docSnap.id);
    });

    let count = 0;
    for (const member of OFFICIAL_15_COMMITTEE_MEMBERS) {
      const key = `${member.firstName}_${member.lastName}`;
      if (existingMap.has(key)) {
        const docId = existingMap.get(key)!;
        await updateDoc(doc(db, path, docId), member);
      } else {
        await addDoc(collection(db, path), member);
      }
      count++;
    }
    return count;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// CITIZEN VOICE / INCIDENT REPORTS (CRUD)
// -------------------------------------------------------------
export function subscribeReports(callback: (reports: Report[]) => void) {
  const path = 'reports';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Report));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function createReport(reportData: Omit<Report, 'id'>): Promise<string> {
  const path = 'reports';
  try {
    const docRef = await addDoc(collection(db, path), reportData);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateReportStatus(
  id: string, 
  status: Report['status'], 
  statusNote: string,
  resolutionImageUrl?: string
): Promise<void> {
  const path = `reports/${id}`;
  try {
    const updatePayload: Record<string, any> = {
      status,
      statusNote,
      updatedAt: new Date().toISOString()
    };
    if (resolutionImageUrl) {
      updatePayload.resolutionImageUrl = resolutionImageUrl;
    }
    await updateDoc(doc(db, 'reports', id), updatePayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteReport(id: string): Promise<void> {
  const path = `reports/${id}`;
  try {
    await deleteDoc(doc(db, 'reports', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// NEWS & ANNOUNCEMENTS (CRUD)
// -------------------------------------------------------------
export function subscribeNews(callback: (news: NewsItem[]) => void) {
  const path = 'news';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function createNews(data: Omit<NewsItem, 'id'>): Promise<string> {
  const path = 'news';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateNews(id: string, data: Partial<NewsItem>): Promise<void> {
  const path = `news/${id}`;
  try {
    await updateDoc(doc(db, 'news', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteNews(id: string): Promise<void> {
  const path = `news/${id}`;
  try {
    await deleteDoc(doc(db, 'news', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// VILLAGE EVENTS (CRUD)
// -------------------------------------------------------------
export function subscribeEvents(callback: (events: VillageEvent[]) => void) {
  const path = 'events';
  const q = query(collection(db, path), orderBy('eventDate', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VillageEvent));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function createEvent(data: Omit<VillageEvent, 'id'>): Promise<string> {
  const path = 'events';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateEvent(id: string, data: Partial<VillageEvent>): Promise<void> {
  const path = `events/${id}`;
  try {
    await updateDoc(doc(db, 'events', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const path = `events/${id}`;
  try {
    await deleteDoc(doc(db, 'events', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function registerForEvent(eventId: string, count: number): Promise<void> {
  const path = `events/${eventId}`;
  try {
    await updateDoc(doc(db, 'events', eventId), {
      registeredCount: (count || 0) + 1
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------
// LOCAL MARKETPLACE (CRUD)
// -------------------------------------------------------------
export function subscribeMarketplace(callback: (items: MarketplaceItem[]) => void) {
  const path = 'marketplace_items';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MarketplaceItem));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function createMarketplaceItem(data: Omit<MarketplaceItem, 'id'>): Promise<string> {
  const path = 'marketplace_items';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateMarketplaceItem(id: string, data: Partial<MarketplaceItem>): Promise<void> {
  const path = `marketplace_items/${id}`;
  try {
    await updateDoc(doc(db, 'marketplace_items', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteMarketplaceItem(id: string): Promise<void> {
  const path = `marketplace_items/${id}`;
  try {
    await deleteDoc(doc(db, 'marketplace_items', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// HELP REQUESTS (PEOPLE HELPING PEOPLE)
// -------------------------------------------------------------
export function subscribeHelpRequests(callback: (requests: HelpRequest[]) => void) {
  const path = 'help_requests';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function createHelpRequest(data: Omit<HelpRequest, 'id'>): Promise<string> {
  const path = 'help_requests';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateHelpRequest(id: string, data: Partial<HelpRequest>): Promise<void> {
  const path = `help_requests/${id}`;
  try {
    await updateDoc(doc(db, 'help_requests', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function volunteerForHelp(id: string, currentCount: number): Promise<void> {
  const path = `help_requests/${id}`;
  try {
    await updateDoc(doc(db, 'help_requests', id), {
      volunteerCount: (currentCount || 0) + 1,
      status: 'HELPING'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteHelpRequest(id: string): Promise<void> {
  const path = `help_requests/${id}`;
  try {
    await deleteDoc(doc(db, 'help_requests', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// PUBLIC PROJECTS & BUDGET TRANSPARENCY
// -------------------------------------------------------------
export function subscribeProjects(callback: (projects: PublicProject[]) => void) {
  const path = 'public_projects';
  const q = query(collection(db, path), orderBy('startDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PublicProject));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function createProject(data: Omit<PublicProject, 'id'>): Promise<string> {
  const path = 'public_projects';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateProject(id: string, data: Partial<PublicProject>): Promise<void> {
  const path = `public_projects/${id}`;
  try {
    await updateDoc(doc(db, 'public_projects', id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const path = `public_projects/${id}`;
  try {
    await deleteDoc(doc(db, 'public_projects', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// COMMUNITY FORUM (PEOPLE'S FORUM)
// -------------------------------------------------------------
export function subscribeCommunityPosts(callback: (posts: CommunityPost[]) => void) {
  const path = 'community_posts';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function createCommunityPost(data: Omit<CommunityPost, 'id' | 'likesCount' | 'commentsCount'>): Promise<string> {
  const path = 'community_posts';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      likesCount: 0,
      commentsCount: 0
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function likeCommunityPost(postId: string, currentLikes: number): Promise<void> {
  const path = `community_posts/${postId}`;
  try {
    await updateDoc(doc(db, 'community_posts', postId), {
      likesCount: currentLikes + 1
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCommunityPost(id: string): Promise<void> {
  const path = `community_posts/${id}`;
  try {
    await deleteDoc(doc(db, 'community_posts', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeComments(postId: string, callback: (comments: PostComment[]) => void) {
  const path = 'post_comments';
  const q = query(collection(db, path), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PostComment));
    const filtered = all.filter(c => c.postId === postId);
    callback(filtered);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function addComment(data: Omit<PostComment, 'id'>): Promise<string> {
  const path = 'post_comments';
  try {
    const docRef = await addDoc(collection(db, path), data);
    // increment post commentsCount
    try {
      const postSnap = await getDoc(doc(db, 'community_posts', data.postId));
      if (postSnap.exists()) {
        const count = postSnap.data()?.commentsCount || 0;
        await updateDoc(doc(db, 'community_posts', data.postId), { commentsCount: count + 1 });
      }
    } catch {
      // safe fallback
    }
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
export function subscribeNotifications(callback: (notifs: VillageNotification[]) => void) {
  const path = 'notifications';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VillageNotification));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function addNotification(data: Omit<VillageNotification, 'id'>): Promise<string> {
  const path = 'notifications';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------
// SEED INITIAL REAL VILLAGE DATA (If collection is empty)
// -------------------------------------------------------------
export async function seedInitialVillageDataIfNeeded(): Promise<boolean> {
  try {
    const committeeSnap = await getDocs(collection(db, 'village_committee'));
    if (!committeeSnap.empty) {
      // Already has data
      return false;
    }

    // Seed Village Committee (ทำเนียบคณะกรรมการ 15 ท่าน)
    for (const member of OFFICIAL_15_COMMITTEE_MEMBERS) {
      await addDoc(collection(db, 'village_committee'), member);
    }

    // Seed Initial Census Residents
    const initialResidents: Omit<Resident, 'id'>[] = [
      {
        residentCode: 'RES-001-01',
        prefix: 'นาย',
        firstName: 'สมหมาย',
        lastName: 'คำมูล',
        houseNumber: '1',
        moo: '4',
        phone: '081-234-5678',
        householdCount: 4,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        residentCode: 'RES-012-01',
        prefix: 'นาย',
        firstName: 'ประสิทธิ์',
        lastName: 'สุขสมบูรณ์',
        houseNumber: '12',
        moo: '4',
        phone: '087-654-3210',
        householdCount: 3,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        residentCode: 'RES-025-01',
        prefix: 'นางสาว',
        firstName: 'จันทร์เพ็ญ',
        lastName: 'ศรีมณฑล',
        houseNumber: '25',
        moo: '4',
        phone: '083-999-8877',
        householdCount: 2,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        residentCode: 'RES-044-01',
        prefix: 'นาย',
        firstName: 'คำมูล',
        lastName: 'บัวคำมูล',
        houseNumber: '44',
        moo: '4',
        phone: '085-111-2233',
        householdCount: 5,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }
    ];

    for (const res of initialResidents) {
      await addDoc(collection(db, 'residents'), res);
    }

    // Seed Initial News
    const initialNews: Omit<NewsItem, 'id'>[] = [
      {
        title: 'ประกาศนัดประชุมประชาคมหมู่บ้านประจำเดือน ครั้งที่ 1/2569',
        content: 'ขอเชิญพ่อแม่พี่น้องชาวบ้านหนองบัวคำมูล หมู่ที่ 4 ทุกหลังคาเรือน เข้าร่วมประชุมประชาคมเพื่อรับฟังรายงานผลการดำเนินงานกองทุนหมู่บ้าน การจัดสรรงบประมาณซ่อมแซมไฟส่องสว่างสาธารณะ และแนวทางการพัฒนาถนนสายหลักเข้าหมู่บ้าน ณ ศาลาประชาคมหมู่ 4 เวลา 18:00 น. เป็นต้นไป',
        category: 'ข่าวประชาสัมพันธ์',
        priority: 'IMPORTANT',
        isPinned: true,
        author: 'ผู้ใหญ่บ้านธนพล เสนบี้',
        published: true,
        coverUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        title: 'แจ้งเตือนเฝ้าระวังพายุฤดูร้อนและลมกระโชกแรงในสัปดาห์นี้',
        content: 'กรมอุตุนิยมวิทยาแจ้งเตือนพื้นที่ภาคเหนือตอนบนอาจมีพายุฝนฟ้าคะนอง ลมกระโชกแรง และลูกเห็บตกบางพื้นที่ ขอให้ประชาชนตรวจตราหลังคาบ้าน ป้ายโฆษณา และตัดแต่งกิ่งไม้ใกล้สายไฟฟ้าเพื่อความปลอดภัย หากพบเสาไฟฟ้าล้มหรือกิ่งไม้พาดสายไฟให้แจ้งฝ่ายไฟฟ้าหรือแจ้งผ่านระบบ SMART MOO4 ได้ทันที',
        category: 'ข่าวแจ้งเตือนภัย',
        priority: 'URGENT',
        isPinned: false,
        author: 'ฝ่ายความมั่นคง ม.4',
        published: true,
        coverUrl: 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
      },
      {
        title: 'กำหนดการฉีดวัคซีนป้องกันโรคพิษสุนัขบ้าและทำหมันสัตว์เลี้ยงฟรี',
        content: 'ปศุสัตว์อำเภอร่วมกับ อบต. จะออกให้บริการฉีดวัคซีนป้องกันโรคพิษสุนัขบ้าให้กับสุนัขและแมวในหมู่บ้านหนองบัวคำมูล ในวันเสาร์นี้ ตั้งแต่เวลา 09:00 - 15:00 น. ณ ลานหน้าศาลาอเนกประสงค์ ขอให้เจ้าของสัตว์เลี้ยงนำสัตว์เลี้ยงมารับบริการได้โดยไม่มีค่าใช้จ่าย',
        category: 'ข่าวกิจกรรม',
        priority: 'NORMAL',
        isPinned: false,
        author: 'อสม. ม.4',
        published: true,
        coverUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];

    for (const news of initialNews) {
      await addDoc(collection(db, 'news'), news);
    }

    // Seed Initial Events
    const initialEvents: Omit<VillageEvent, 'id'>[] = [
      {
        title: 'ประชุมใหญ่ประชาคมหมู่บ้าน ประจำเดือน',
        description: 'รับฟังรายงานสถานะการเงินกองทุนหมู่บ้าน และพิจารณาโครงการขยายแนวท่อประปาเข้าซอย 2',
        eventDate: '2026-11-20',
        startTime: '18:00',
        endTime: '20:30',
        location: 'ศาลาประชาคมบ้านหนองบัวคำมูล ม.4',
        lat: 16.505663,
        lng: 103.005112,
        coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
        organizer: 'คณะกรรมการหมู่บ้าน ม.4',
        status: 'UPCOMING',
        registeredCount: 38,
        createdAt: new Date().toISOString()
      },
      {
        title: 'กิจกรรมบิ๊กคลีนนิ่งเดย์ พัฒนาหมู่บ้านและกำจัดลูกน้ำยุงลาย',
        description: 'รวมพลังจิตอาสาชาวบ้านหนองบัวคำมูลร่วมกันพัฒนาถนนหนทาง ลอกรางระบายน้ำ และฉีดพ่นหมอกควันกำจัดยุงลาย',
        eventDate: '2026-11-27',
        startTime: '08:30',
        endTime: '12:00',
        location: 'รวมพลที่หน้าวัดหนองบัวคำมูล',
        lat: 16.506800,
        lng: 103.006500,
        coverUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80',
        organizer: 'อสม. ร่วมกับ อปพร. ม.4',
        status: 'UPCOMING',
        registeredCount: 52,
        createdAt: new Date().toISOString()
      }
    ];

    for (const ev of initialEvents) {
      await addDoc(collection(db, 'events'), ev);
    }

    // Seed Initial Reports (Citizen Voice)
    const initialReports: Omit<Report, 'id'>[] = [
      {
        reportNumber: 'MOO4-2026-00001',
        title: 'โคมไฟถนนดับ บริเวณปากซอย 3 หน้าบ้านลุงจันทร์',
        category: 'ไฟฟ้าส่องสว่างดับ',
        description: 'หลอดไฟ LED ติดๆ ดับๆ มาสองวันแล้ว ตอนนี้ดับสนิท มืดมากทำให้เสี่ยงต่อการเกิดอุบัติเหตุเวลากลางคืน',
        lat: 16.505200,
        lng: 103.004800,
        locationName: 'ปากซอย 3 ถนนสายหลัก ม.4 ต.คูคำ',
        urgency: 'HIGH',
        isAnonymous: false,
        reporterName: 'นายประสิทธิ์ สุขสมบูรณ์',
        reporterPhone: '087-654-3210',
        status: 'IN_PROGRESS',
        statusNote: 'ผู้ใหญ่บ้านประสานงานช่างไฟฟ้า อบต. เข้าตรวจสอบและเปลี่ยนหลอดไฟในวันพรุ่งนี้',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        reportNumber: 'MOO4-2026-00002',
        title: 'ผิวถนนแอสฟัลต์ทรุดเป็นหลุมขนาดใหญ่ ช่วงทางโค้งวัด',
        category: 'ถนนชำรุด',
        description: 'ฝนตกหนักทำให้น้ำเซาะขอบทาง หลุมลึกประมาณ 15 ซม. รถจักรยานยนต์เกือบเสียหลักล้มหลายคัน',
        lat: 16.506500,
        lng: 103.006100,
        locationName: 'ทางโค้งก่อนถึงวัดหนองบัวคำมูล',
        urgency: 'NORMAL',
        isAnonymous: true,
        status: 'RECEIVED',
        statusNote: 'รับเรื่องแล้ว อยู่ระหว่างส่งผู้ช่วยผู้ใหญ่บ้านลงพื้นที่ประเมินความเสียหายเพื่อนำหินคลุกมาถมชั่วคราว',
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 26).toISOString()
      },
      {
        reportNumber: 'MOO4-2026-00003',
        title: 'ท่อส่งน้ำประปาหมู่บ้านแตกรั่ว น้ำไหลนองเต็มถนน',
        category: 'น้ำประปาไม่ไหล',
        description: 'ท่อ PVC เมนรองแตกรั่วข้างศาลาหมู่บ้าน น้ำไหลแรงมากทำให้แรงดันน้ำในบ้านท้ายซอยตก',
        lat: 16.505800,
        lng: 103.005300,
        locationName: 'ข้างศาลาประชาคม ม.4 ต.คูคำ',
        urgency: 'EMERGENCY',
        isAnonymous: false,
        reporterName: 'นางสาวจันทร์เพ็ญ',
        reporterPhone: '083-999-8877',
        status: 'RESOLVED',
        statusNote: 'ทีมช่างประปาหมู่บ้านได้ปิดวาล์วและทำการตัดต่อท่อใหม่เรียบร้อยแล้ว น้ำประปาจ่ายได้ตามปกติ',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 50).toISOString()
      }
    ];

    for (const rep of initialReports) {
      await addDoc(collection(db, 'reports'), rep);
    }

    // Seed Marketplace Items
    const initialMarket: Omit<MarketplaceItem, 'id'>[] = [
      {
        title: 'ผักกาดขาวอินทรีย์ ปลอดสารพิษ สดจากสวนลุงสมหมาย',
        description: 'ผักสดกรอบ เก็บตอนเช้าทุกวัน ปลูกแบบอินทรีย์ไม่ใช้สารเคมี สะอาดปลอดภัย กิโลกรัมละ 35 บาท มีบริการส่งถึงหน้าบ้านใน ม.4',
        price: 35,
        unit: 'กิโลกรัม',
        category: 'ผักและผลไม้',
        sellerName: 'ลุงสมหมาย',
        sellerPhone: '081-234-5678',
        sellerId: 'seller-seed-1',
        locationArea: 'สวนริมน้ำ ม.4',
        status: 'AVAILABLE',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        title: 'กล้วยน้ำว้ามะลิอ่อง หวานธรรมชาติ สดจากสวน',
        description: 'กล้วยน้ำว้าแก่จัด รสชาติหวานฉ่ำ ไร้เมล็ด หวีละ 25 บาท สั่งล่วงหน้าได้เลยครับ',
        price: 25,
        unit: 'หวี',
        category: 'ผักและผลไม้',
        sellerName: 'ป้าทองคำ บัวศรี',
        sellerPhone: '086-555-4321',
        sellerId: 'seller-seed-2',
        locationArea: 'บ้านเลขที่ 15 ม.4',
        status: 'AVAILABLE',
        imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        title: 'ไข่ไก่อารมณ์ดี สดใหม่ทุกวัน เบอร์ 1',
        description: 'ไก่ไข่เลี้ยงปล่อยแบบธรรมชาติ (Free-range) ไข่สด สะอาด ฟองใหญ่ แผงละ 30 ฟอง ราคา 130 บาท',
        price: 130,
        unit: 'แผง (30 ฟอง)',
        category: 'อาหาร',
        sellerName: 'น้านพดล ฟาร์มสุข',
        sellerPhone: '088-777-6655',
        sellerId: 'seller-seed-3',
        locationArea: 'ท้ายหมู่บ้าน ม.4',
        status: 'AVAILABLE',
        imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
      }
    ];

    for (const item of initialMarket) {
      await addDoc(collection(db, 'marketplace_items'), item);
    }

    // Seed Help Requests (People Helping People)
    const initialHelp: Omit<HelpRequest, 'id'>[] = [
      {
        title: 'ขอแรงจิตอาสาช่วยตัดหญ้าและปรับปรุงรั้วบ้านคุณยายสุข (อายุ 84 ปี)',
        description: 'คุณยายสุขอาศัยอยู่คนเดียว รั้วข้างบ้านมีวัชพืชรกทึบ เกรงว่าจะมีงูหรือสัตว์มีพิษ ต้องการอาสาสมัครประมาณ 3-4 คน ในช่วงเช้าวันอาทิตย์นี้',
        category: 'ช่วยเหลือผู้สูงอายุ',
        urgency: 'NORMAL',
        contactName: 'ประธาน อสม. ประนอม',
        contactPhone: '082-111-9988',
        area: 'บ้านเลขที่ 8 ม.4',
        status: 'OPEN',
        volunteerCount: 2,
        createdAt: new Date(Date.now() - 3600000 * 16).toISOString()
      },
      {
        title: 'ขอยืมรถเข็นวีลแชร์ชั่วคราว สำหรับผู้ป่วยพักฟื้นผ่าตัดข้อเข่า',
        description: 'ผู้ป่วยผ่าตัดกลับมาพักฟื้นที่บ้าน ต้องการใช้วีลแชร์ประมาณ 2 สัปดาห์ บ้านใดมีไม่ได้ใช้งานขออนุญาตยืมเพื่อใช้ประโยชน์ครับ',
        category: 'ช่วยเหลือผู้ป่วย',
        urgency: 'URGENT',
        contactName: 'นายวิรัช',
        contactPhone: '085-444-3322',
        area: 'บ้านเลขที่ 31 ม.4',
        status: 'HELPING',
        volunteerCount: 1,
        createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
      }
    ];

    for (const help of initialHelp) {
      await addDoc(collection(db, 'help_requests'), help);
    }

    // Seed Public Projects & Budget
    const initialProjects: Omit<PublicProject, 'id'>[] = [
      {
        title: 'โครงการติดตั้งกล้องวงจรปิด CCTV อัจฉริยะ และไฟโซลาร์เซลล์รอบหมู่บ้าน',
        budget: 185000,
        budgetSource: 'งบประมาณพัฒนาหมู่บ้านตามแผน อปท. ประจำปี 2569',
        responsibleAgency: 'คณะกรรมการหมู่บ้าน ร่วมกับ อบต.',
        description: 'ติดตั้งกล้องวงจรปิด 8 จุดยุทธศาสตร์รอบบ้านหนองบัวคำมูล พร้อมไฟส่องสว่างโซลาร์เซลล์ 20 ชุด เพื่อเพิ่มความปลอดภัยและป้องกันเหตุลักขโมย',
        startDate: '2026-10-01',
        endDate: '2026-12-15',
        progress: 75,
        status: 'IN_PROGRESS',
        beforeImageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
        duringImageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=800&auto=format&fit=crop&q=80'
      },
      {
        title: 'โครงการปรับปรุงระบบประปาหมู่บ้านและเปลี่ยนสารกรองน้ำดื่มสะอาด',
        budget: 120000,
        budgetSource: 'เงินสะสมกองทุนประปาหมู่บ้าน ม.4',
        responsibleAgency: 'คณะกรรมการประปาหมู่บ้าน ม.4',
        description: 'เปลี่ยนสารกรองทราย คาร์บอน และเรซิน พร้อมล้างถังพักน้ำขนาด 50 ลบ.ม. เพื่อให้ชาวบ้านได้ใช้น้ำอุปโภคบริโภคที่สะอาด ปลอดภัยตามมาตรฐาน',
        startDate: '2026-08-01',
        endDate: '2026-09-30',
        progress: 100,
        status: 'COMPLETED',
        beforeImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=800&auto=format&fit=crop&q=80',
        afterImageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'
      }
    ];

    for (const proj of initialProjects) {
      await addDoc(collection(db, 'public_projects'), proj);
    }

    // Seed Community Posts
    const initialPosts: Omit<CommunityPost, 'id'>[] = [
      {
        title: 'ขอขอบคุณคณะกรรมการหมู่บ้านที่เข้ามาเปลี่ยนหลอดไฟทางให้รวดเร็วมากครับ',
        content: 'แจ้งเรื่องผ่านระบบไปเมื่อวาน วันนี้ช่วงบ่ายช่างก็เข้ามาแก้ไขให้เรียบร้อยแล้ว ทางเดินสว่างปลอดภัยมากครับ ชื่นชมการทำงานที่รวดเร็ว',
        authorName: 'พี่สมศักดิ์ ซอย 2',
        authorId: 'post-user-1',
        likesCount: 14,
        commentsCount: 2,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        title: 'เสนอแนะอยากให้จัดตั้งจุดทิ้งขยะอันตรายและหลอดไฟแยกต่างหากที่ศาลา',
        content: 'อยากเสนอให้หมู่บ้านเรามีถังขยะสีแดงสำหรับทิ้งถ่านไฟฉาย หลอดไฟ และขวดสารเคมีเกษตรโดยเฉพาะ เพื่อไม่ให้ปะปนกับขยะทั่วไปและสิ่งแวดล้อม',
        authorName: 'ครูปราณี บ้าน ม.4',
        authorId: 'post-user-2',
        likesCount: 28,
        commentsCount: 4,
        createdAt: new Date(Date.now() - 3600000 * 32).toISOString()
      }
    ];

    for (const p of initialPosts) {
      await addDoc(collection(db, 'community_posts'), p);
    }

    // Seed Notifications
    const initialNotifications: Omit<VillageNotification, 'id'>[] = [
      {
        title: 'ยินดีต้อนรับสู่ SMART MOO4',
        message: 'ระบบแพลตฟอร์มดิจิทัลบริหารจัดการหมู่บ้านอัจฉริยะ บ้านหนองบัวคำมูล หมู่ที่ 4 เปิดใช้งานแล้วอย่างเป็นทางการ',
        type: 'SYSTEM',
        isRead: false,
        linkTab: 'home',
        createdAt: new Date().toISOString()
      },
      {
        title: 'ข่าวด่วน: นัดประชุมประชาคมหมู่บ้าน',
        message: 'ขอเชิญร่วมประชุมประชาคม ณ ศาลาหมู่บ้าน เวลา 18:00 น.',
        type: 'NEWS',
        isRead: false,
        linkTab: 'news',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ];

    for (const notif of initialNotifications) {
      await addDoc(collection(db, 'notifications'), notif);
    }

    console.log('Successfully seeded initial Firestore data for SMART MOO4');
    return true;
  } catch (error) {
    console.error('Error seeding initial village data:', error);
    return false;
  }
}

// -------------------------------------------------------------
// NEWS SOURCES CRUD & SQL GENERATOR
// -------------------------------------------------------------
export function subscribeNewsSources(callback: (sources: NewsSource[]) => void) {
  const path = 'news_sources';
  const q = query(collection(db, path), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NewsSource));
    callback(data);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

export async function addNewsSource(data: Omit<NewsSource, 'id'>): Promise<string> {
  const path = 'news_sources';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteNewsSource(id: string): Promise<void> {
  const path = `news_sources/${id}`;
  try {
    await deleteDoc(doc(db, 'news_sources', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Generate complete executable SQL DDL & INSERT statements from active state
export function generateVillageDatabaseSQL(
  residentsList: Resident[],
  newsList: NewsItem[],
  reportsList: Report[],
  committeeList: CommitteeMember[],
  projectsList: PublicProject[],
  marketList: MarketplaceItem[]
): string {
  const sqlLines: string[] = [];
  sqlLines.push('-- ==========================================================');
  sqlLines.push('-- SMART MOO4 EXPORTED DATABASE SQL DUMP');
  sqlLines.push(`-- ข่าวสาร บ้านหนองบัวคำมูล หมู่ที่ 4 (Exported at ${new Date().toISOString()})`);
  sqlLines.push('-- ==========================================================\n');

  // Residents INSERTs
  if (residentsList.length > 0) {
    sqlLines.push('-- 1. INSERT RESIDENTS CENSUS');
    sqlLines.push('INSERT INTO residents (resident_code, prefix, first_name, last_name, house_number, moo, phone, household_count, status) VALUES');
    const rValues = residentsList.map(r => 
      `('${r.residentCode}', '${r.prefix}', '${r.firstName.replace(/'/g, "''")}', '${r.lastName.replace(/'/g, "''")}', '${r.houseNumber}', '4', '${r.phone || ''}', ${r.householdCount || 1}, '${r.status}')`
    );
    sqlLines.push(rValues.join(',\n') + ';\n');
  }

  // News INSERTs
  if (newsList.length > 0) {
    sqlLines.push('-- 2. INSERT NEWS & ANNOUNCEMENTS');
    sqlLines.push('INSERT INTO news (title, content, category, priority, is_pinned, author, news_source_name, source_url) VALUES');
    const nValues = newsList.map(n => 
      `('${n.title.replace(/'/g, "''")}', '${n.content.replace(/'/g, "''")}', '${n.category}', '${n.priority}', ${n.isPinned ? 'TRUE' : 'FALSE'}, '${n.author.replace(/'/g, "''")}', '${(n.newsSource || '').replace(/'/g, "''")}', '${(n.sourceUrl || '').replace(/'/g, "''")}')`
    );
    sqlLines.push(nValues.join(',\n') + ';\n');
  }

  // Reports INSERTs
  if (reportsList.length > 0) {
    sqlLines.push('-- 3. INSERT CITIZEN VOICE REPORTS');
    sqlLines.push('INSERT INTO reports (report_number, title, category, description, urgency, location_name, lat, lng, status, status_note) VALUES');
    const repValues = reportsList.map(r => 
      `('${r.reportNumber}', '${r.title.replace(/'/g, "''")}', '${r.category}', '${r.description.replace(/'/g, "''")}', '${r.urgency}', '${(r.locationName || '').replace(/'/g, "''")}', ${r.lat || 18.7883}, ${r.lng || 98.9853}, '${r.status}', '${(r.statusNote || '').replace(/'/g, "''")}')`
    );
    sqlLines.push(repValues.join(',\n') + ';\n');
  }

  // Committee INSERTs
  if (committeeList.length > 0) {
    sqlLines.push('-- 4. INSERT VILLAGE COMMITTEE');
    sqlLines.push('INSERT INTO village_committee (prefix, first_name, last_name, role_category, position, phone, responsibilities, term_start, display_order) VALUES');
    const cValues = committeeList.map(c => 
      `('${c.prefix}', '${c.firstName.replace(/'/g, "''")}', '${c.lastName.replace(/'/g, "''")}', '${c.roleCategory}', '${c.position.replace(/'/g, "''")}', '${c.phone}', '${(c.responsibilities || '').replace(/'/g, "''")}', '${c.termStart || ''}', ${c.order || 0})`
    );
    sqlLines.push(cValues.join(',\n') + ';\n');
  }

  // Projects INSERTs
  if (projectsList.length > 0) {
    sqlLines.push('-- 5. INSERT PUBLIC PROJECTS & BUDGET');
    sqlLines.push('INSERT INTO public_projects (title, budget, budget_source, responsible_agency, description, progress, status) VALUES');
    const pValues = projectsList.map(p => 
      `('${p.title.replace(/'/g, "''")}', ${p.budget}, '${(p.budgetSource || '').replace(/'/g, "''")}', '${(p.responsibleAgency || '').replace(/'/g, "''")}', '${(p.description || '').replace(/'/g, "''")}', ${p.progress}, '${p.status}')`
    );
    sqlLines.push(pValues.join(',\n') + ';\n');
  }

  return sqlLines.join('\n');
}

