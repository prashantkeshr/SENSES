import { compositeProvider } from './compositeProvider';
import type { SensesDataProvider } from '@/types/index';

// Composite provider: curated JSON data + 86k Pixabay images (lazy-loaded chunks)
export const provider: SensesDataProvider = compositeProvider;

export * from './types';
