import { useSyncExternalStore } from 'react';
import { getLead, type StoredLead } from '@/lib/storage/leadStorage';

const subscribe = () => () => {};

export const useLead = (): StoredLead | null =>
  useSyncExternalStore(subscribe, getLead, () => null);
