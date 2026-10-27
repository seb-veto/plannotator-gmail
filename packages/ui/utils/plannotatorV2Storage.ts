import { cookieStorage, type StorageBackend } from './storage';

/** The fork can run beside the original Inbox without changing its appearance or layout cookies. */
export const plannotatorV2Storage: StorageBackend = {
  getItem: (key) => cookieStorage.getItem(`plannotator-v2-${key}`),
  setItem: (key, value) => cookieStorage.setItem(`plannotator-v2-${key}`, value),
  removeItem: (key) => cookieStorage.removeItem(`plannotator-v2-${key}`),
};
