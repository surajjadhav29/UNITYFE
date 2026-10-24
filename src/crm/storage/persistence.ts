import { CRM_SESSION_KEY, CRM_STORAGE_KEY } from '../constants';
import { createSeedState } from '../data/seed';
import type { AuthSession, CrmPersistedState } from '../types/crm.types';
import { normalizeLoadedState } from '../utils/migrateState';

export function loadState(): CrmPersistedState {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    // Fresh demo seed for v4 (richer follow-ups). Older keys are ignored.
    if (!raw) {
      const seed = createSeedState();
      saveState(seed);
      return seed;
    }
    const normalized = normalizeLoadedState(JSON.parse(raw) as unknown);
    if (normalized.leads.length < 100) {
      const seed = createSeedState();
      saveState(seed);
      return seed;
    }
    saveState(normalized);
    return normalized;
  } catch {
    const seed = createSeedState();
    saveState(seed);
    return seed;
  }
}

export function saveState(state: CrmPersistedState): void {
  localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(state));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('unity-crm-update'));
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(CRM_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession | null): void {
  if (!session) {
    sessionStorage.removeItem(CRM_SESSION_KEY);
    return;
  }
  sessionStorage.setItem(CRM_SESSION_KEY, JSON.stringify(session));
}

export function resetDemoData(): CrmPersistedState {
  const seed = createSeedState();
  saveState(seed);
  return seed;
}
