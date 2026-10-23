/** Admin = full control · Sales = own leads + create/import · Staff = assigned leads + follow-up only */
export type UserRole = 'admin' | 'sales' | 'staff';

export type AccountStatus = 'active' | 'inactive';

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  password: string;
  createdAt: string;
}

export type LeadSource =
  | 'Phone'
  | 'WhatsApp'
  | 'Website'
  | 'Walk-in'
  | 'Facebook'
  | 'Instagram'
  | 'Referral'
  | 'Other';

export type LeadStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Interested'
  | 'Follow-up Required'
  | 'Visit Scheduled'
  | 'Negotiation'
  | 'Booking'
  | 'Converted / Sold'
  | 'Lost'
  | 'On Hold';

export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type LostReason =
  | 'Purchased elsewhere'
  | 'Price or budget issue'
  | 'No response after agreed attempts'
  | 'Not interested'
  | 'Purchase postponed or cancelled'
  | 'Vehicle requirement unavailable'
  | 'Other';

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';

export type Transmission = 'Manual' | 'Automatic';

export type PurchaseTimeline =
  | 'Immediately'
  | 'Within 7 days'
  | 'Within 30 days'
  | 'Later'
  | 'Undecided';

export interface Lead {
  id: string;
  customerName: string;
  mobile: string;
  alternateContact?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  source: LeadSource;
  preferredCar?: string;
  budget?: number;
  preferredYear?: string;
  fuelType?: FuelType;
  transmission?: Transmission;
  purchaseTimeline?: PurchaseTimeline;
  priority: LeadPriority;
  assignedStaffId: string | null;
  status: LeadStatus;
  lostReason?: LostReason;
  lostNotes?: string;
  remarks?: string;
  interestedVehicleId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
}

export type VehicleAvailability = 'Available' | 'Reserved' | 'Sold' | 'Inactive';

export interface StockVehicle {
  id: string;
  registrationNumber?: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  kilometres: number;
  fuelType: FuelType;
  transmission: Transmission;
  color: string;
  purchasePrice?: number;
  sellingPrice: number;
  image: string;
  /** Optional extra photos; share uses first two or front + side image. */
  gallery?: string[];
  description: string;
  availability: VehicleAvailability;
  showOnWebsite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FollowUpType = 'Call' | 'WhatsApp' | 'Visit' | 'Email' | 'Other';

export type FollowUpStatus = 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';

export interface FollowUp {
  id: string;
  leadId: string;
  scheduledAt: string;
  type: FollowUpType;
  assignedStaffId: string;
  notes?: string;
  status: FollowUpStatus;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | 'lead_created'
  | 'lead_updated'
  | 'contact'
  | 'note'
  | 'status_change'
  | 'assignment'
  | 'follow_up'
  | 'lost_reason';

export interface LeadActivity {
  id: string;
  leadId: string;
  actorId: string;
  type: ActivityType;
  title: string;
  detail?: string;
  meta?: Record<string, string>;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  recordType: 'lead' | 'vehicle' | 'user' | 'auth';
  recordId: string;
  detail?: string;
  createdAt: string;
}

export interface CrmPersistedState {
  users: CrmUser[];
  leads: Lead[];
  vehicles: StockVehicle[];
  followUps: FollowUp[];
  activities: LeadActivity[];
  auditLogs: AuditLog[];
  leadCounter: number;
}

export interface AuthSession {
  userId: string;
  signedInAt: string;
}
