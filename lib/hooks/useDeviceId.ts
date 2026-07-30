import { useSyncExternalStore } from 'react';
import { getDeviceId } from '@/lib/storage/deviceStorage';

const subscribe = () => () => {};

export const useDeviceId = (): string | null =>
  useSyncExternalStore(subscribe, getDeviceId, () => null);