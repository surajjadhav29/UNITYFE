import type { CrmPersistedState } from '../types/crm.types';
import { createRichDemoSeed } from './richDemoSeed';

export function createSeedState(): CrmPersistedState {
  return createRichDemoSeed();
}
