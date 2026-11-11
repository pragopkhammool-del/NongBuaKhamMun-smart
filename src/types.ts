export type UserRole = 
  | 'GUEST' 
  | 'MEMBER' 
  | 'VERIFIED_MEMBER' 
  | 'MODERATOR' 
  | 'ADMIN' 
  | 'SUPER_ADMIN';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  firstName: string;
  lastName: string;
  houseNumber: string;
  moo: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export interface Resident {
  id: string;
  residentCode: string;
  prefix: string;
  firstName: string;
  lastName: string;
  houseNumber: string;
  moo?: string;
  phone?: string;
  householdCount?: number;
  status: 'ACTIVE' | 'MOVED_OUT' | 'DECEASED';
  photoURL?: string;
  createdAt: string;
}

export type CommitteeCategory = 
  | 'HEADMAN' 
  | 'ASSISTANT' 
  | 'COMMITTEE' 
  | 'HEALTH_VOLUNTEER' 
  | 'VOLUNTEER' 
  | 'OTHER';

export interface CommitteeMember {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  roleCategory: CommitteeCategory;
  position: string;
  phone: string;
  responsibilities?: string;
  termStart?: string;
  status: 'ACTIVE' | 'INACTIVE';
  photoURL?: string;
  order?: number;
}

export type ReportStatus = 
  | 'RECEIVED' 
  | 'PENDING_CHECK' 
  | 'IN_PROGRESS' 
  | 'COORDINATED' 
  | 'RESOLVED' 
  | 'CANNOT_PROCEED';

export type ReportUrgency = 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';

export interface Report {
  id: string;
  reportNumber: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  urgency: ReportUrgency;
  isAnonymous: boolean;
  reporterName?: string;
  reporterPhone?: string;
  reporterId?: string;
  status: ReportStatus;
  statusNote?: string;
  resolutionImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportUpdate {
  id: string;
  reportId: string;
  status: ReportStatus;
  note: string;
  updatedBy: string;
  imageUrl?: string;
  createdAt: string;
}

export interface NewsSource {
  id: string;
  name: string;
  category: string;
  agency?: string;
  url?: string;
  active: boolean;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  coverUrl?: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  isPinned?: boolean;
  author: string;
  newsSource?: string;
  sourceUrl?: string;
  sourceType?: 'LOCAL' | 'GOV' | 'WEATHER' | 'DISASTER' | 'HEALTH' | 'PRESS';
  published: boolean;
  createdAt: string;
}

export interface VillageEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  lat?: number;
  lng?: number;
  coverUrl?: string;
  organizer: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  registeredCount?: number;
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  unit?: string;
  category: string;
  imageUrl?: string;
  sellerName: string;
  sellerPhone: string;
  sellerId: string;
  locationArea?: string;
  status: 'AVAILABLE' | 'SOLD' | 'CLOSED';
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  contactName: string;
  contactPhone: string;
  area: string;
  userId?: string;
  status: 'OPEN' | 'HELPING' | 'COMPLETED';
  volunteerCount?: number;
  createdAt: string;
}

export interface PublicProject {
  id: string;
  title: string;
  budget: number;
  budgetSource: string;
  responsibleAgency: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'PROPOSED' | 'WAITING_APPROVAL' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
  beforeImageUrl?: string;
  duringImageUrl?: string;
  afterImageUrl?: string;
  documentUrl?: string;
  updatedAt?: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorName: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface VillageNotification {
  id: string;
  title: string;
  message: string;
  type: 'NEWS' | 'REPORT' | 'EVENT' | 'HELP' | 'SYSTEM';
  isRead: boolean;
  linkTab?: string;
  createdAt: string;
}
