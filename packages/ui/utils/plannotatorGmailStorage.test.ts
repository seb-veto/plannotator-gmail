import { expect, test } from 'bun:test';
import { plannotatorV2Storage } from './plannotatorV2Storage';
import { cookieStorage } from './storage';
import { plannotatorGmailStorage } from './plannotatorGmailStorage';

test.skipIf(typeof document === 'undefined')('the Gmail fork keeps both existing Inboxes cookies independent', () => {
  const key = 'fork-isolation-test';
  const previousUrl = window.location.href;
  const dom = (window as unknown as { happyDOM: { setURL(url: string): void } }).happyDOM;
  dom.setURL('http://127.0.0.1:4000/');
  try {
    cookieStorage.setItem(key, 'original');
    plannotatorV2Storage.setItem(key, 'craft');
    expect(cookieStorage.getItem(key)).toBe('original');
    expect(plannotatorV2Storage.getItem(key)).toBe('craft');
    expect(plannotatorGmailStorage.getItem(key)).toBeNull();
    plannotatorGmailStorage.setItem(key, 'fork');
    expect(cookieStorage.getItem(key)).toBe('original');
    expect(plannotatorV2Storage.getItem(key)).toBe('craft');
    expect(plannotatorGmailStorage.getItem(key)).toBe('fork');
    plannotatorGmailStorage.removeItem(key);
    expect(plannotatorGmailStorage.getItem(key) || null).toBeNull();
    expect(cookieStorage.getItem(key)).toBe('original');
    expect(plannotatorV2Storage.getItem(key)).toBe('craft');
  } finally {
    plannotatorGmailStorage.removeItem(key);
    cookieStorage.removeItem(key);
    plannotatorV2Storage.removeItem(key);
    dom.setURL(previousUrl);
  }
});
