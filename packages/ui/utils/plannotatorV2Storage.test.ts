import { expect, test } from 'bun:test';
import { cookieStorage } from './storage';
import { plannotatorV2Storage } from './plannotatorV2Storage';

test.skipIf(typeof document === 'undefined')('the v2 fork keeps the original Inbox cookies independent', () => {
  const key = 'fork-isolation-test';
  const previousUrl = window.location.href;
  const dom = (window as unknown as { happyDOM: { setURL(url: string): void } }).happyDOM;
  dom.setURL('http://127.0.0.1:4000/');
  try {
    cookieStorage.setItem(key, 'original');
    expect(cookieStorage.getItem(key)).toBe('original');
    expect(plannotatorV2Storage.getItem(key)).toBeNull();
    plannotatorV2Storage.setItem(key, 'fork');
    expect(cookieStorage.getItem(key)).toBe('original');
    expect(plannotatorV2Storage.getItem(key)).toBe('fork');
    plannotatorV2Storage.removeItem(key);
    expect(plannotatorV2Storage.getItem(key) || null).toBeNull();
    expect(cookieStorage.getItem(key)).toBe('original');
  } finally {
    plannotatorV2Storage.removeItem(key);
    cookieStorage.removeItem(key);
    dom.setURL(previousUrl);
  }
});
