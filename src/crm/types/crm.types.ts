/** Form roles: Admin · Sales · Staff (manager kept for legacy seed data) */
export type UserRole = 'admin' | 'manager' | 'sales' | 'staff';

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
  | 'OLX'
  | 'Cars24'
  | 'CarWale'
  | 'Website'
  | 'Phone Call'
  | 'Walk-in'
  | 'WhatsApp'
  | 'Facebook'
  | 'Instagram'
  | 'Referral'
  | 'Other';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Visit/Test Drive Scheduled'
  | 'Test Drive Completed'
  | 'Negotiation'
  | 'Booking'
  | 'Won'
  | 'Lost'
  | 'On Hold';

export type LeadPriority = 'Hot' | 'Warm' | 'Cold';

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
  /** Max budget (legacy single field). */
  budget?: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredYear?: string;
  fuelType?: FuelType;
  transmission?: Transmission;
  purchaseTimeline?: PurchaseTimeline;
  priority: LeadPriority;
  assignedStaffId: string | null;
  status: LeadStatus;
  lostReason?: LostReason;
  lostNotes?: string;
  onHoldReason?: string;
  remarks?: string;
  interestedVehicleId?: string;
  /** Set when lead is Won via booking/sale workflow. */
  bookingId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
}

export type VehicleAvailability = 'Available' | 'Reserved' | 'Sold' | 'Inactive';

export type VehicleCondition = 'Excellent' | 'Good' | 'Fair' | 'Needs work';

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
  previousOwners?: number;
  registrationCity?: string;
  condition?: VehicleCondition;
  purchaseDate?: string;
  purchasePrice?: number;
  refurbishmentCost?: number;
  otherExpenses?: number;
  sellingPrice: number;
  minSellingPrice?: number;
  image: string;
  gallery?: string[];
  description: string;
  inspectionNotes?: string;
  addedById?: string;
  availability: VehicleAvailability;
  showOnWebsite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FollowUpType = 'Call' | 'WhatsApp' | 'Visit' | 'Email' | 'Other';

export type FollowUpStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface FollowUp {
  id: string;
  leadId: string;
  scheduledAt: string;
  type: FollowUpType;
  assignedStaffId: string;
  notes?: string;
  status: FollowUpStatus;
  outcome?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentType = 'Showroom Visit' | 'Test Drive' | 'Delivery' | 'Other';

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'No-show';

export interface Appointment {
  id: string;
  leadId: string;
  vehicleId?: string;
  type: AppointmentType;
  scheduledAt: string;
  assignedStaffId: string;
  location?: string;
  notes?: string;
  status: AppointmentStatus;
  outcome?: string;
  feedback?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'Booking Pending' | 'Booked' | 'Cancelled' | 'Sold/Delivered';

export interface Booking {
  id: string;
  leadId: string;
  vehicleId: string;
  agreedPrice: number;
  tokenAmount?: number;
  bookingDate: string;
  paymentMode?: string;
  paymentReference?: string;
  remainingAmount?: number;
  paymentStatus?: string;
  deliveryDate?: string;
  notes?: string;
  status: BookingStatus;
  assignedStaffId: string;
  createdById: string;
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
  | 'lost_reason'
  | 'appointment'
  | 'booking';

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
  recordType: 'lead' | 'vehicle' | 'user' | 'auth' | 'booking' | 'appointment' | 'settings';
  recordId: string;
  detail?: string;
  createdAt: string;
}

export interface CrmSettings {
  dealershipName: string;
  dealershipPhone: string;
  dealershipAddress: string;
  leadSources: LeadSource[];
  leadStatuses: LeadStatus[];
  stockAgingDaysThreshold: number;
  defaultFollowUpDays: number;
}

export interface CrmPersistedState {
  version: 2;
  users: CrmUser[];
  leads: Lead[];
  vehicles: StockVehicle[];
  followUps: FollowUp[];
  appointments: Appointment[];
  bookings: Booking[];
  activities: LeadActivity[];
  auditLogs: AuditLog[];
  settings: CrmSettings;
  leadCounter: number;
}

export interface AuthSession {
  userId: string;
  signedInAt: string;
}

/** Pre-v2 persisted shape (for migration). */
export interface CrmPersistedStateV1 {
  users: CrmUser[];
  leads: Lead[];
  vehicles: StockVehicle[];
  followUps: FollowUp[];
  activities: LeadActivity[];
  auditLogs: AuditLog[];
  leadCounter: number;
}
