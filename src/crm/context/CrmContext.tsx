import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Appointment,
  Booking,
  CrmPersistedState,
  CrmSettings,
  CrmUser,
  FollowUp,
  FollowUpType,
  Lead,
  LeadActivity,
  LeadStatus,
  StockVehicle,
} from '../types/crm.types';
import {
  loadSession,
  loadState,
  resetDemoData,
  saveSession,
  saveState,
} from '../storage/persistence';
import { formatLeadNumber, newId } from '../utils/ids';
import { canReserveVehicle } from '../utils/bookingRules';
import {
  canManageBookings,
  canManageSettings,
  filterLeadsForUser,
  isTeamLead,
} from '../utils/permissions';

type LeadInput = Omit<
  Lead,
  'id' | 'createdAt' | 'updatedAt' | 'createdById'
> & { id?: string };

type VehicleInput = Omit<StockVehicle, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

type UserInput = Omit<CrmUser, 'id' | 'createdAt'> & { id?: string };

export interface LogContactInput {
  leadId: string;
  contactType: FollowUpType;
  clientResponse: string;
  newStatus?: LeadStatus;
  assignStaffId?: string | null;
  nextFollowUpAt?: string;
  nextFollowUpType?: FollowUpType;
  completeScheduledFollowUpId?: string;
  setInterestedVehicleId?: string;
  markContacted?: boolean;
  /** Update priority from call outcome */
  priority?: Lead['priority'];
  budget?: number;
  lostReason?: Lead['lostReason'];
  /** Stop all future call reminders (already purchased / do not call) */
  stopFollowUps?: boolean;
}

interface CrmContextValue {
  state: CrmPersistedState;
  currentUser: CrmUser | null;
  visibleLeads: Lead[];
  login: (email: string, password: string) => { ok: true } | { ok: false; message: string };
  logout: () => void;
  resetData: () => void;
  getUserById: (id: string | null | undefined) => CrmUser | undefined;
  createLead: (input: LeadInput) => Lead | { error: string };
  updateLead: (id: string, patch: Partial<LeadInput>) => Lead | { error: string };
  assignLead: (leadId: string, staffId: string | null) => void;
  addActivity: (
    leadId: string,
    activity: Omit<LeadActivity, 'id' | 'leadId' | 'actorId' | 'createdAt'>,
  ) => void;
  scheduleFollowUp: (
    input: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
      status?: FollowUp['status'];
    },
  ) => void;
  completeFollowUp: (followUpId: string, outcome: string) => void;
  logContact: (input: LogContactInput) => { ok: true } | { ok: false; error: string };
  createVehicle: (input: VehicleInput) => StockVehicle;
  updateVehicle: (id: string, patch: Partial<VehicleInput>) => StockVehicle | null;
  createUser: (input: UserInput) => CrmUser | { error: string };
  updateUser: (id: string, patch: Partial<UserInput>) => CrmUser | { error: string };
  deleteUser: (id: string) => { ok: true } | { ok: false; error: string };
  findDuplicateMobile: (mobile: string, excludeLeadId?: string) => Lead | undefined;
  bulkAssignLeads: (leadIds: string[], staffId: string | null) => { ok: true } | { ok: false; error: string };
  deleteLeads: (leadIds: string[]) => { ok: true } | { ok: false; error: string };
  visibleAppointments: Appointment[];
  visibleBookings: Booking[];
  createAppointment: (
    input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'createdById'>,
  ) => Appointment | { error: string };
  updateAppointment: (
    id: string,
    patch: Partial<Omit<Appointment, 'id' | 'createdById' | 'createdAt'>>,
  ) => Appointment | { error: string };
  createBooking: (
    input: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'status'> & {
      status?: Booking['status'];
    },
  ) => Booking | { error: string };
  updateBooking: (
    id: string,
    patch: Partial<Omit<Booking, 'id' | 'createdById' | 'createdAt'>>,
  ) => Booking | { error: string };
  updateSettings: (patch: Partial<CrmSettings>) => { ok: true } | { ok: false; error: string };
}

const CrmContext = createContext<CrmContextValue | null>(null);

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, '').slice(-10);
}

function appendAudit(
  state: CrmPersistedState,
  entry: Omit<CrmPersistedState['auditLogs'][0], 'id' | 'createdAt'>,
): CrmPersistedState['auditLogs'] {
  return [
    {
      ...entry,
      id: newId('log'),
      createdAt: new Date().toISOString(),
    },
    ...state.auditLogs,
  ].slice(0, 200);
}

export function CrmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CrmPersistedState>(() => loadState());
  const [session, setSession] = useState(() => loadSession());

  const persist = useCallback((next: CrmPersistedState) => {
    setState(next);
    saveState(next);
  }, []);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === session?.userId && u.status === 'active') ?? null,
    [session, state.users],
  );

  const visibleLeads = useMemo(
    () => filterLeadsForUser(currentUser, state.leads),
    [currentUser, state.leads],
  );

  const visibleAppointments = useMemo(() => {
    if (!currentUser || currentUser.status !== 'active') return [];
    if (isTeamLead(currentUser)) return state.appointments;
    return state.appointments.filter((a) => a.assignedStaffId === currentUser.id);
  }, [currentUser, state.appointments]);

  const visibleBookings = useMemo(() => {
    if (!currentUser || currentUser.status !== 'active') return [];
    if (isTeamLead(currentUser)) return state.bookings;
    return state.bookings.filter((b) => b.assignedStaffId === currentUser.id);
  }, [currentUser, state.bookings]);

  const getUserById = useCallback(
    (id: string | null | undefined) => (id ? state.users.find((u) => u.id === id) : undefined),
    [state.users],
  );

  const login = useCallback(
    (email: string, password: string) => {
      const user = state.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      );
      if (!user) {
        return { ok: false as const, message: 'Invalid email or password.' };
      }
      if (user.status !== 'active') {
        return { ok: false as const, message: 'This account is deactivated.' };
      }
      const auth = { userId: user.id, signedInAt: new Date().toISOString() };
      setSession(auth);
      saveSession(auth);
      persist({
        ...state,
        auditLogs: appendAudit(state, {
          actorId: user.id,
          action: 'login_success',
          recordType: 'auth',
          recordId: user.id,
        }),
      });
      return { ok: true as const };
    },
    [persist, state],
  );

  const logout = useCallback(() => {
    if (currentUser) {
      persist({
        ...state,
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'logout',
          recordType: 'auth',
          recordId: currentUser.id,
        }),
      });
    }
    setSession(null);
    saveSession(null);
  }, [currentUser, persist, state]);

  const resetData = useCallback(() => {
    const seed = resetDemoData();
    setState(seed);
    setSession(null);
    saveSession(null);
  }, []);

  const findDuplicateMobile = useCallback(
    (mobile: string, excludeLeadId?: string) => {
      const norm = normalizeMobile(mobile);
      return state.leads.find(
        (lead) =>
          lead.id !== excludeLeadId && normalizeMobile(lead.mobile) === norm,
      );
    },
    [state.leads],
  );

  const addActivity = useCallback(
    (
      leadId: string,
      activity: Omit<LeadActivity, 'id' | 'leadId' | 'actorId' | 'createdAt'>,
    ) => {
      if (!currentUser) return;
      const entry: LeadActivity = {
        ...activity,
        id: newId('act'),
        leadId,
        actorId: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      persist({
        ...state,
        activities: [entry, ...state.activities],
      });
    },
    [currentUser, persist, state],
  );

  const createLead = useCallback(
    (input: LeadInput): Lead | { error: string } => {
      if (!currentUser) return { error: 'Not signed in.' };
      if (input.status === 'Lost' && !input.lostReason) {
        return { error: 'Lost reason is required.' };
      }
      const duplicate = findDuplicateMobile(input.mobile);
      const now = new Date().toISOString();
      const counter = state.leadCounter + 1;
      const lead: Lead = {
        ...input,
        id: formatLeadNumber(counter),
        createdById: currentUser.id,
        createdAt: now,
        updatedAt: now,
      };
      const activities: LeadActivity[] = [
        {
          id: newId('act'),
          leadId: lead.id,
          actorId: currentUser.id,
          type: 'lead_created',
          title: 'Lead created',
          detail: duplicate
            ? `Warning: similar mobile exists on ${duplicate.id}.`
            : undefined,
          createdAt: now,
        },
      ];
      persist({
        ...state,
        leadCounter: counter,
        leads: [lead, ...state.leads],
        activities: [...activities, ...state.activities],
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'lead_created',
          recordType: 'lead',
          recordId: lead.id,
        }),
      });
      return lead;
    },
    [currentUser, findDuplicateMobile, persist, state],
  );

  const updateLead = useCallback(
    (id: string, patch: Partial<LeadInput>): Lead | { error: string } => {
      if (!currentUser) return { error: 'Not signed in.' };
      const existing = state.leads.find((l) => l.id === id);
      if (!existing) return { error: 'Lead not found.' };
      const nextStatus = patch.status ?? existing.status;
      const lostReason = patch.lostReason ?? existing.lostReason;
      if (nextStatus === 'Lost' && !lostReason) {
        return { error: 'Select a lost reason before marking Lost.' };
      }
      const onHoldReason = patch.onHoldReason ?? existing.onHoldReason;
      if (nextStatus === 'On Hold' && !onHoldReason?.trim()) {
        return { error: 'Add a reason before putting the lead on hold.' };
      }
      if (nextStatus === 'Won' && !existing.bookingId && !patch.bookingId) {
        return { error: 'Complete a booking/sale before marking Won.' };
      }
      if (
        patch.mobile &&
        normalizeMobile(patch.mobile) !== normalizeMobile(existing.mobile)
      ) {
        const dup = findDuplicateMobile(patch.mobile, id);
        if (dup) {
          return { error: `Mobile already used on lead ${dup.id}.` };
        }
      }
      const now = new Date().toISOString();
      const updated: Lead = {
        ...existing,
        ...patch,
        id: existing.id,
        createdById: existing.createdById,
        createdAt: existing.createdAt,
        updatedAt: now,
      };
      const activities = [...state.activities];
      if (patch.status && patch.status !== existing.status) {
        activities.unshift({
          id: newId('act'),
          leadId: id,
          actorId: currentUser.id,
          type: 'status_change',
          title: 'Status updated',
          detail: `${existing.status} → ${patch.status}`,
          meta: { from: existing.status, to: patch.status },
          createdAt: now,
        });
      }
      if (patch.priority && patch.priority !== existing.priority) {
        activities.unshift({
          id: newId('act'),
          leadId: id,
          actorId: currentUser.id,
          type: 'lead_updated',
          title: 'Priority updated',
          detail: `${existing.priority} → ${patch.priority}`,
          meta: { from: existing.priority, to: patch.priority },
          createdAt: now,
        });
      }
      if (
        patch.assignedStaffId !== undefined &&
        patch.assignedStaffId !== existing.assignedStaffId
      ) {
        activities.unshift({
          id: newId('act'),
          leadId: id,
          actorId: currentUser.id,
          type: 'assignment',
          title: 'Lead reassigned',
          detail: `${getUserById(existing.assignedStaffId)?.name ?? 'Unassigned'} → ${getUserById(patch.assignedStaffId)?.name ?? 'Unassigned'}`,
          createdAt: now,
        });
      }
      persist({
        ...state,
        leads: state.leads.map((l) => (l.id === id ? updated : l)),
        activities,
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'lead_updated',
          recordType: 'lead',
          recordId: id,
        }),
      });
      return updated;
    },
    [currentUser, findDuplicateMobile, getUserById, persist, state],
  );

  const assignLead = useCallback(
    (leadId: string, staffId: string | null) => {
      updateLead(leadId, { assignedStaffId: staffId });
    },
    [updateLead],
  );

  const scheduleFollowUp = useCallback(
    (
      input: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
        status?: FollowUp['status'];
      },
    ) => {
      if (!currentUser) return;
      const now = new Date().toISOString();
      const followUp: FollowUp = {
        ...input,
        id: newId('fu'),
        status: input.status ?? 'Pending',
        createdById: currentUser.id,
        createdAt: now,
        updatedAt: now,
      };
      persist({
        ...state,
        followUps: [followUp, ...state.followUps],
        leads: state.leads.map((l) =>
          l.id === input.leadId ? { ...l, nextFollowUpAt: input.scheduledAt, updatedAt: now } : l,
        ),
        activities: [
          {
            id: newId('act'),
            leadId: input.leadId,
            actorId: currentUser.id,
            type: 'follow_up',
            title: 'Follow-up scheduled',
            detail: `${input.type} at ${new Date(input.scheduledAt).toLocaleString('en-IN')}`,
            createdAt: now,
          },
          ...state.activities,
        ],
      });
    },
    [currentUser, persist, state],
  );

  const completeFollowUp = useCallback(
    (followUpId: string, outcome: string) => {
      if (!currentUser) return;
      const now = new Date().toISOString();
      const target = state.followUps.find((f) => f.id === followUpId);
      if (!target) return;
      persist({
        ...state,
        followUps: state.followUps.map((f) =>
          f.id === followUpId
            ? { ...f, status: 'Completed', outcome, updatedAt: now }
            : f,
        ),
        leads: state.leads.map((l) =>
          l.id === target.leadId ? { ...l, lastContactAt: now, updatedAt: now } : l,
        ),
        activities: [
          {
            id: newId('act'),
            leadId: target.leadId,
            actorId: currentUser.id,
            type: 'follow_up',
            title: 'Follow-up completed',
            detail: outcome,
            createdAt: now,
          },
          ...state.activities,
        ],
      });
    },
    [currentUser, persist, state],
  );

  const logContact = useCallback(
    (input: LogContactInput): { ok: true } | { ok: false; error: string } => {
      if (!currentUser) return { ok: false, error: 'Not signed in.' };
      const response = input.clientResponse.trim();
      if (!response) return { ok: false, error: 'Add what the customer said or what you discussed.' };

      const existing = state.leads.find((l) => l.id === input.leadId);
      if (!existing) return { ok: false, error: 'Lead not found.' };

      if (
        input.newStatus === 'Lost' &&
        !(input.lostReason || existing.lostReason)
      ) {
        return { ok: false, error: 'Select a reason when marking Lost / do not call.' };
      }

      const now = new Date().toISOString();
      let followUps = [...state.followUps];
      let activities = [...state.activities];

      if (input.completeScheduledFollowUpId) {
        followUps = followUps.map((f) =>
          f.id === input.completeScheduledFollowUpId
            ? { ...f, status: 'Completed' as const, outcome: response, updatedAt: now }
            : f,
        );
        activities.unshift({
          id: newId('act'),
          leadId: input.leadId,
          actorId: currentUser.id,
          type: 'follow_up',
          title: 'Scheduled follow-up completed',
          detail: response,
          createdAt: now,
        });
      }

      activities.unshift({
        id: newId('act'),
        leadId: input.leadId,
        actorId: currentUser.id,
        type: 'contact',
        title: `${input.contactType} logged`,
        detail: response,
        createdAt: now,
      });

      const ownerId =
        input.assignStaffId !== undefined ? input.assignStaffId : existing.assignedStaffId;

      if (
        input.assignStaffId !== undefined &&
        input.assignStaffId !== existing.assignedStaffId
      ) {
        activities.unshift({
          id: newId('act'),
          leadId: input.leadId,
          actorId: currentUser.id,
          type: 'assignment',
          title: 'Ownership updated',
          detail: `${getUserById(existing.assignedStaffId)?.name ?? 'Unassigned'} → ${getUserById(input.assignStaffId)?.name ?? 'Unassigned'}`,
          createdAt: now,
        });
      }

      if (input.newStatus && input.newStatus !== existing.status) {
        activities.unshift({
          id: newId('act'),
          leadId: input.leadId,
          actorId: currentUser.id,
          type: 'status_change',
          title: 'Status updated',
          detail: `${existing.status} → ${input.newStatus}`,
          meta: { from: existing.status, to: input.newStatus },
          createdAt: now,
        });
      }

      let nextFollowUpAt = existing.nextFollowUpAt;
      if (input.stopFollowUps) {
        followUps = followUps.map((f) =>
          f.leadId === input.leadId && f.status === 'Pending'
            ? {
                ...f,
                status: 'Cancelled' as const,
                outcome: response,
                updatedAt: now,
              }
            : f,
        );
        nextFollowUpAt = undefined;
        activities.unshift({
          id: newId('act'),
          leadId: input.leadId,
          actorId: currentUser.id,
          type: 'follow_up',
          title: 'Follow-ups stopped',
          detail: 'No further call reminders for this lead.',
          createdAt: now,
        });
      } else if (input.nextFollowUpAt) {
        const fuType = input.nextFollowUpType ?? input.contactType;
        const followUp: FollowUp = {
          id: newId('fu'),
          leadId: input.leadId,
          scheduledAt: input.nextFollowUpAt,
          type: fuType,
          assignedStaffId: ownerId ?? currentUser.id,
          notes: `Reminder after ${input.contactType.toLowerCase()}: ${response.slice(0, 120)}`,
          status: 'Pending',
          createdById: currentUser.id,
          createdAt: now,
          updatedAt: now,
        };
        followUps = [followUp, ...followUps];
        nextFollowUpAt = input.nextFollowUpAt;
        activities.unshift({
          id: newId('act'),
          leadId: input.leadId,
          actorId: currentUser.id,
          type: 'follow_up',
          title: 'Next follow-up set',
          detail: `${fuType} on ${new Date(input.nextFollowUpAt).toLocaleString('en-IN')}`,
          createdAt: now,
        });
      }

      let status = existing.status;
      if (input.newStatus) {
        status = input.newStatus;
      } else if (existing.status === 'New' && input.markContacted !== false) {
        status = 'Contacted';
        activities.unshift({
          id: newId('act'),
          leadId: input.leadId,
          actorId: currentUser.id,
          type: 'status_change',
          title: 'Status updated',
          detail: 'New → Contacted',
          createdAt: now,
        });
      }

      if (input.priority && input.priority !== existing.priority) {
        activities.unshift({
          id: newId('act'),
          leadId: input.leadId,
          actorId: currentUser.id,
          type: 'lead_updated',
          title: 'Priority updated',
          detail: `${existing.priority} → ${input.priority}`,
          createdAt: now,
        });
      }

      const updatedLead: Lead = {
        ...existing,
        status,
        assignedStaffId: ownerId,
        lastContactAt: now,
        updatedAt: now,
        nextFollowUpAt,
        interestedVehicleId: input.setInterestedVehicleId ?? existing.interestedVehicleId,
        priority: input.priority ?? existing.priority,
        budget: input.budget !== undefined ? input.budget : existing.budget,
        lostReason:
          status === 'Lost'
            ? (input.lostReason ?? existing.lostReason ?? 'Other')
            : existing.lostReason,
        remarks: response
          ? [existing.remarks, response].filter(Boolean).join('\n—\n')
          : existing.remarks,
      };

      persist({
        ...state,
        leads: state.leads.map((l) => (l.id === input.leadId ? updatedLead : l)),
        followUps,
        activities,
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'contact_logged',
          recordType: 'lead',
          recordId: input.leadId,
        }),
      });

      return { ok: true };
    },
    [currentUser, getUserById, persist, state],
  );

  const createVehicle = useCallback(
    (input: VehicleInput): StockVehicle => {
      if (!currentUser) throw new Error('Not signed in');
      const now = new Date().toISOString();
      const vehicle: StockVehicle = {
        ...input,
        id: input.id ?? newId('veh'),
        createdAt: now,
        updatedAt: now,
      };
      persist({
        ...state,
        vehicles: [vehicle, ...state.vehicles],
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'vehicle_created',
          recordType: 'vehicle',
          recordId: vehicle.id,
        }),
      });
      return vehicle;
    },
    [currentUser, persist, state],
  );

  const updateVehicle = useCallback(
    (id: string, patch: Partial<VehicleInput>): StockVehicle | null => {
      if (!currentUser) return null;
      const existing = state.vehicles.find((v) => v.id === id);
      if (!existing) return null;
      const now = new Date().toISOString();
      const updated = { ...existing, ...patch, id, updatedAt: now };
      persist({
        ...state,
        vehicles: state.vehicles.map((v) => (v.id === id ? updated : v)),
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'vehicle_updated',
          recordType: 'vehicle',
          recordId: id,
        }),
      });
      return updated;
    },
    [currentUser, persist, state],
  );

  const createUser = useCallback(
    (input: UserInput): CrmUser | { error: string } => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { error: 'Only admins can create users.' };
      }
      if (state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
        return { error: 'Email already in use.' };
      }
      const user: CrmUser = {
        ...input,
        id: newId('user'),
        createdAt: new Date().toISOString(),
      };
      persist({
        ...state,
        users: [user, ...state.users],
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'user_created',
          recordType: 'user',
          recordId: user.id,
        }),
      });
      return user;
    },
    [currentUser, persist, state],
  );

  const bulkAssignLeads = useCallback(
    (leadIds: string[], staffId: string | null): { ok: true } | { ok: false; error: string } => {
      if (!currentUser || !isTeamLead(currentUser)) {
        return { ok: false, error: 'Only admins or managers can bulk assign.' };
      }
      if (leadIds.length === 0) return { ok: false, error: 'No leads selected.' };
      const now = new Date().toISOString();
      const idSet = new Set(leadIds);
      let activities = [...state.activities];
      const leads = state.leads.map((lead) => {
        if (!idSet.has(lead.id)) return lead;
        if (lead.assignedStaffId === staffId) return lead;
        activities.unshift({
          id: newId('act'),
          leadId: lead.id,
          actorId: currentUser.id,
          type: 'assignment',
          title: 'Bulk reassignment',
          detail: `${getUserById(lead.assignedStaffId)?.name ?? 'Unassigned'} → ${getUserById(staffId)?.name ?? 'Unassigned'}`,
          createdAt: now,
        });
        return { ...lead, assignedStaffId: staffId, updatedAt: now };
      });
      persist({
        ...state,
        leads,
        activities,
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'leads_bulk_assigned',
          recordType: 'lead',
          recordId: leadIds.join(','),
          detail: `${leadIds.length} leads → ${getUserById(staffId)?.name ?? 'Unassigned'}`,
        }),
      });
      return { ok: true };
    },
    [currentUser, getUserById, persist, state],
  );

  const deleteLeads = useCallback(
    (leadIds: string[]): { ok: true } | { ok: false; error: string } => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { ok: false, error: 'Only admins can delete leads.' };
      }
      if (leadIds.length === 0) return { ok: false, error: 'No leads selected.' };
      const idSet = new Set(leadIds);
      persist({
        ...state,
        leads: state.leads.filter((l) => !idSet.has(l.id)),
        followUps: state.followUps.filter((f) => !idSet.has(f.leadId)),
        activities: state.activities.filter((a) => !idSet.has(a.leadId)),
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'leads_deleted',
          recordType: 'lead',
          recordId: leadIds.slice(0, 3).join(',') + (leadIds.length > 3 ? '…' : ''),
          detail: `${leadIds.length} lead(s) removed`,
        }),
      });
      return { ok: true };
    },
    [currentUser, persist, state],
  );

  const createAppointment = useCallback(
    (
      input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'createdById'>,
    ): Appointment | { error: string } => {
      if (!currentUser) return { error: 'Not signed in.' };
      const lead = state.leads.find((l) => l.id === input.leadId);
      if (!lead) return { error: 'Lead not found.' };
      if (lead.status === 'Won' || lead.status === 'Lost') {
        return { error: 'Cannot schedule appointments for closed leads.' };
      }
      const duplicate = state.appointments.find(
        (a) =>
          a.leadId === input.leadId &&
          a.scheduledAt === input.scheduledAt &&
          !['Cancelled', 'No-show'].includes(a.status),
      );
      if (duplicate) return { error: 'An appointment already exists at this time for this lead.' };
      const now = new Date().toISOString();
      const appointment: Appointment = {
        ...input,
        id: newId('appt'),
        createdById: currentUser.id,
        createdAt: now,
        updatedAt: now,
      };
      persist({
        ...state,
        appointments: [appointment, ...state.appointments],
        leads: state.leads.map((l) =>
          l.id === input.leadId && l.status === 'Qualified'
            ? { ...l, status: 'Visit/Test Drive Scheduled' as LeadStatus, updatedAt: now }
            : l.id === input.leadId
              ? { ...l, updatedAt: now }
              : l,
        ),
        activities: [
          {
            id: newId('act'),
            leadId: input.leadId,
            actorId: currentUser.id,
            type: 'appointment',
            title: `${input.type} scheduled`,
            detail: new Date(input.scheduledAt).toLocaleString('en-IN'),
            createdAt: now,
          },
          ...state.activities,
        ],
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'appointment_created',
          recordType: 'appointment',
          recordId: appointment.id,
        }),
      });
      return appointment;
    },
    [currentUser, persist, state],
  );

  const updateAppointment = useCallback(
    (
      id: string,
      patch: Partial<Omit<Appointment, 'id' | 'createdById' | 'createdAt'>>,
    ): Appointment | { error: string } => {
      if (!currentUser) return { error: 'Not signed in.' };
      const existing = state.appointments.find((a) => a.id === id);
      if (!existing) return { error: 'Appointment not found.' };
      const now = new Date().toISOString();
      const updated = { ...existing, ...patch, updatedAt: now };
      let leads = state.leads;
      if (patch.status === 'Completed' && existing.leadId) {
        leads = state.leads.map((l) =>
          l.id === existing.leadId && l.status === 'Visit/Test Drive Scheduled'
            ? { ...l, status: 'Test Drive Completed' as LeadStatus, updatedAt: now }
            : l.id === existing.leadId
              ? { ...l, updatedAt: now }
              : l,
        );
      }
      persist({
        ...state,
        appointments: state.appointments.map((a) => (a.id === id ? updated : a)),
        leads,
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'appointment_updated',
          recordType: 'appointment',
          recordId: id,
          detail: patch.status,
        }),
      });
      return updated;
    },
    [currentUser, persist, state],
  );

  const createBooking = useCallback(
    (
      input: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'status'> & {
        status?: Booking['status'];
      },
    ): Booking | { error: string } => {
      if (!currentUser || !canManageBookings(currentUser)) {
        return { error: 'You cannot create bookings.' };
      }
      const lead = state.leads.find((l) => l.id === input.leadId);
      const vehicle = state.vehicles.find((v) => v.id === input.vehicleId);
      if (!lead) return { error: 'Lead not found.' };
      if (!vehicle) return { error: 'Vehicle not found.' };
      if (lead.status === 'Won' || lead.status === 'Lost') {
        return { error: 'Lead is already closed.' };
      }
      const reserveCheck = canReserveVehicle(vehicle, state.bookings);
      if (!reserveCheck.ok) return { error: reserveCheck.reason };
      const now = new Date().toISOString();
      const status = input.status ?? 'Booked';
      const booking: Booking = {
        ...input,
        status,
        id: newId('bkg'),
        createdById: currentUser.id,
        createdAt: now,
        updatedAt: now,
      };
      const vehicleAvailability =
        status === 'Sold/Delivered' ? 'Sold' : ('Reserved' as StockVehicle['availability']);
      const leadStatus: LeadStatus =
        status === 'Sold/Delivered' ? 'Won' : 'Booking';
      persist({
        ...state,
        bookings: [booking, ...state.bookings],
        vehicles: state.vehicles.map((v) =>
          v.id === input.vehicleId
            ? { ...v, availability: vehicleAvailability, updatedAt: now }
            : v,
        ),
        leads: state.leads.map((l) =>
          l.id === input.leadId
            ? { ...l, status: leadStatus, bookingId: booking.id, updatedAt: now }
            : l,
        ),
        followUps: state.followUps.map((f) =>
          f.leadId === input.leadId && f.status === 'Pending'
            ? { ...f, status: 'Cancelled' as const, updatedAt: now }
            : f,
        ),
        activities: [
          {
            id: newId('act'),
            leadId: input.leadId,
            actorId: currentUser.id,
            type: 'booking',
            title: 'Booking recorded',
            detail: `${vehicle.brand} ${vehicle.model} · ${status}`,
            createdAt: now,
          },
          ...state.activities,
        ],
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'booking_created',
          recordType: 'booking',
          recordId: booking.id,
        }),
      });
      return booking;
    },
    [currentUser, persist, state],
  );

  const updateBooking = useCallback(
    (
      id: string,
      patch: Partial<Omit<Booking, 'id' | 'createdById' | 'createdAt'>>,
    ): Booking | { error: string } => {
      if (!currentUser || !canManageBookings(currentUser)) {
        return { error: 'You cannot update bookings.' };
      }
      const existing = state.bookings.find((b) => b.id === id);
      if (!existing) return { error: 'Booking not found.' };
      const now = new Date().toISOString();
      const nextStatus = patch.status ?? existing.status;
      const vehicle = state.vehicles.find((v) => v.id === existing.vehicleId);
      let vehicles = state.vehicles;
      let leads = state.leads;
      if (nextStatus === 'Sold/Delivered') {
        vehicles = state.vehicles.map((v) =>
          v.id === existing.vehicleId ? { ...v, availability: 'Sold', updatedAt: now } : v,
        );
        leads = state.leads.map((l) =>
          l.id === existing.leadId
            ? { ...l, status: 'Won', bookingId: id, updatedAt: now }
            : l,
        );
      } else if (nextStatus === 'Cancelled') {
        const otherActive = state.bookings.some(
          (b) =>
            b.id !== id &&
            b.vehicleId === existing.vehicleId &&
            (b.status === 'Booked' || b.status === 'Booking Pending'),
        );
        if (!otherActive && vehicle) {
          vehicles = state.vehicles.map((v) =>
            v.id === existing.vehicleId && v.availability !== 'Sold'
              ? { ...v, availability: 'Available', updatedAt: now }
              : v,
          );
        }
      }
      const updated = { ...existing, ...patch, status: nextStatus, updatedAt: now };
      persist({
        ...state,
        bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
        vehicles,
        leads,
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'booking_updated',
          recordType: 'booking',
          recordId: id,
          detail: nextStatus,
        }),
      });
      return updated;
    },
    [currentUser, persist, state],
  );

  const updateSettings = useCallback(
    (patch: Partial<CrmSettings>): { ok: true } | { ok: false; error: string } => {
      if (!currentUser || !canManageSettings(currentUser)) {
        return { ok: false, error: 'Only administrators can change settings.' };
      }
      if (patch.stockAgingDaysThreshold !== undefined && patch.stockAgingDaysThreshold < 1) {
        return { ok: false, error: 'Stock aging threshold must be at least 1 day.' };
      }
      persist({
        ...state,
        settings: { ...state.settings, ...patch },
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'settings_updated',
          recordType: 'settings',
          recordId: 'crm',
        }),
      });
      return { ok: true };
    },
    [currentUser, persist, state],
  );

  const updateUser = useCallback(
    (id: string, patch: Partial<UserInput>): CrmUser | { error: string } => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { error: 'Only admins can update users.' };
      }
      const existing = state.users.find((u) => u.id === id);
      if (!existing) return { error: 'User not found.' };
      if (
        patch.email &&
        state.users.some(
          (u) => u.id !== id && u.email.toLowerCase() === patch.email!.toLowerCase(),
        )
      ) {
        return { error: 'Email already in use.' };
      }
      const updated = { ...existing, ...patch, id };
      persist({
        ...state,
        users: state.users.map((u) => (u.id === id ? updated : u)),
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'user_updated',
          recordType: 'user',
          recordId: id,
          detail: patch.status === 'inactive' ? 'Account deactivated' : undefined,
        }),
      });
      return updated;
    },
    [currentUser, persist, state],
  );

  const deleteUser = useCallback(
    (id: string): { ok: true } | { ok: false; error: string } => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { ok: false, error: 'Only admins can delete users.' };
      }
      if (id === currentUser.id) {
        return { ok: false, error: 'You cannot delete your own account.' };
      }
      const existing = state.users.find((u) => u.id === id);
      if (!existing) return { ok: false, error: 'User not found.' };
      if (existing.role === 'admin') {
        const adminCount = state.users.filter((u) => u.role === 'admin').length;
        if (adminCount <= 1) {
          return { ok: false, error: 'Cannot delete the last admin account.' };
        }
      }
      persist({
        ...state,
        users: state.users.filter((u) => u.id !== id),
        auditLogs: appendAudit(state, {
          actorId: currentUser.id,
          action: 'user_deleted',
          recordType: 'user',
          recordId: id,
          detail: existing.name,
        }),
      });
      return { ok: true };
    },
    [currentUser, persist, state],
  );

  const value = useMemo(
    () => ({
      state,
      currentUser,
      visibleLeads,
      login,
      logout,
      resetData,
      getUserById,
      createLead,
      updateLead,
      assignLead,
      addActivity,
      scheduleFollowUp,
      completeFollowUp,
      logContact,
      createVehicle,
      updateVehicle,
      createUser,
      updateUser,
      deleteUser,
      findDuplicateMobile,
      bulkAssignLeads,
      deleteLeads,
      visibleAppointments,
      visibleBookings,
      createAppointment,
      updateAppointment,
      createBooking,
      updateBooking,
      updateSettings,
    }),
    [
      state,
      currentUser,
      visibleLeads,
      visibleAppointments,
      visibleBookings,
      login,
      logout,
      resetData,
      getUserById,
      createLead,
      updateLead,
      assignLead,
      addActivity,
      scheduleFollowUp,
      completeFollowUp,
      logContact,
      createVehicle,
      updateVehicle,
      createUser,
      updateUser,
      deleteUser,
      findDuplicateMobile,
      bulkAssignLeads,
      deleteLeads,
      createAppointment,
      updateAppointment,
      createBooking,
      updateBooking,
      updateSettings,
    ],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used within CrmProvider');
  return ctx;
}
