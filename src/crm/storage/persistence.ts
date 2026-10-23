import { CRM_SESSION_KEY, CRM_STORAGE_KEY } from '../constants';
import { createSeedState } from '../data/seed';
import type { AuthSession, CrmPersistedState } from '../types/crm.types';

export function loadState(): CrmPersistedState {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    if (!raw) {
      const seed = createSeedState();
      saveState(seed);
      return seed;
    }
    return JSON.parse(raw) as CrmPersistedState;
  } catch {
    const seed = createSeedState();
    saveState(seed);
    return seed;
  }
}

export function saveState(state: CrmPersistedState): void {
  localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(state));
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
