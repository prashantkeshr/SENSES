import { jsonProvider } from './jsonProvider';
import type { SensesDataProvider } from '@/types/index';

// V1 uses JSON provider.
// Future: swap for apiProvider when backend is ready.
export const provider: SensesDataProvider = jsonProvider;

export * from './types';
