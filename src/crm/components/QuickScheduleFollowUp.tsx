import { useState, type FormEvent } from 'react';
import { CalendarPlus } from 'lucide-react';
import type { FollowUpType } from '../types/crm.types';
import { addDaysFromNow } from '../utils/followUpDue';

const TYPES: FollowUpType[] = ['Call', 'WhatsApp', 'Visit', 'Email', 'Other'];

interface QuickScheduleFollowUpProps {
  leadId: string;
  staffId: string;
  onSchedule: (input: {
    leadId: string;
    scheduledAt: string;
    type: FollowUpType;
    assignedStaffId: string;
    notes?: string;
  }) => void;
}

export function QuickScheduleFollowUp({ leadId, staffId, onSchedule }: QuickScheduleFollowUpProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FollowUpType>('Call');
  const [when, setWhen] = useState<'today' | 'tomorrow' | 'week'>('tomorrow');
  const [notes, setNotes] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const iso =
      when === 'today'
        ? addDaysFromNow(0, 16, 0)
        : when === 'tomorrow'
          ? addDaysFromNow(1, 10, 30)
          : addDaysFromNow(3, 11, 0);
    onSchedule({
      leadId,
      scheduledAt: iso,
      type,
      assignedStaffId: staffId,
      notes: notes.trim() || undefined,
    });
    setOpen(false);
    setNotes('');
  }

  if (!open) {
    return (
      <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setOpen(true)}>
        <CalendarPlus size={16} aria-hidden />
        Schedule follow-up
      </button>
    );
  }

  return (
    <form className="crm-quick-schedule" onSubmit={submit}>
      <select value={type} onChange={(e) => setType(e.target.value as FollowUpType)}>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select value={when} onChange={(e) => setWhen(e.target.value as typeof when)}>
        <option value="today">Today (4 PM)</option>
        <option value="tomorrow">Tomorrow (10:30 AM)</option>
        <option value="week">In 3 days</option>
      </select>
      <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <button type="submit" className="crm-btn crm-btn-primary">
        Save
      </button>
      <button type="button" className="crm-btn crm-btn-ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}
