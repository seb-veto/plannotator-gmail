import { cookieStorage, type StorageBackend } from './storage';

/** The fork can run beside the original Inbox without changing its appearance or layout cookies. */
export const plannotatorGmailStorage: StorageBackend = {
  getItem: (key) => cookieStorage.getItem(`plannotator-gmail-${key}`),
  setItem: (key, value) => cookieStorage.setItem(`plannotator-gmail-${key}`, value),
  removeItem: (key) => cookieStorage.removeItem(`plannotator-gmail-${key}`),
};
