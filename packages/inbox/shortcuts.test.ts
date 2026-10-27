/**
 * The Inbox's keys in the shared registry (shortcuts/): a surface like plan
 * review's and code review's. What would regress: a binding the registry
 * cannot read (it would never fire), two scopes with one id (one would shadow
 * the other in a help list), the full-screen chord drifting from plan
 * review's, or a new bare letter slipping in (the owner's rule: none until the
 * shared shortcut system lists them; E and Z predate it, J/K are owner-approved).
 */
import { describe, expect, test } from 'bun:test';
import { htmlAnnotateShortcuts, listRegistryShortcuts, matchesShortcutBinding, validateShortcutRegistry } from '@plannotator/ui/shortcuts';
import { inboxFileViewerShortcuts, inboxShortcutRegistry, inboxSurface, inboxThreadShortcuts } from './shortcuts';

describe('the Inbox surface', () => {
  test('validates: every binding normalized, every scope id unique and the Inbox’s own', () => {
    expect(validateShortcutRegistry(inboxShortcutRegistry)).toEqual([]);
    const ids = inboxShortcutRegistry.map((scope) => scope.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.startsWith('inbox-')).toBe(true);
    expect(inboxSurface.registry).toBe(inboxShortcutRegistry);
  });

  test('the approved bare letters are E, Z, J and K (Archive, Undo, Inbox navigation)', () => {
    const letters = listRegistryShortcuts(inboxShortcutRegistry)
      .flatMap((entry) => entry.bindings)
      .filter((binding) => /^[A-Z]$/.test(binding));
    expect(letters.sort()).toEqual(['E', 'J', 'K', 'Z']);
  });

  test('the full-screen toolbar takes plan review’s Hide tools chord', () => {
    expect(inboxFileViewerShortcuts.shortcuts.toggleTools.bindings).toEqual(htmlAnnotateShortcuts.shortcuts.toggleTools.bindings);
  });

  test('focus mode uses Command-period on Mac and Control-period elsewhere', () => {
    const shortcut = inboxThreadShortcuts.shortcuts.toggleFocusMode;
    expect(shortcut.bindings).toEqual(['Mod+.']);
    const key = (init: KeyboardEventInit) => ({ key: '.', code: 'Period', metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...init }) as KeyboardEvent;
    expect(matchesShortcutBinding(key({ metaKey: true }), shortcut.bindings[0]!)).toBe(true);
    expect(matchesShortcutBinding(key({ ctrlKey: true }), shortcut.bindings[0]!)).toBe(true);
    expect(matchesShortcutBinding(key({}), shortcut.bindings[0]!)).toBe(false);
    expect(matchesShortcutBinding(key({ metaKey: true, shiftKey: true }), shortcut.bindings[0]!)).toBe(false);
  });

  test('the bindings match the keys the Inbox reacts to, and only without ⌘ / Ctrl / Alt', () => {
    const keydown = (init: KeyboardEventInit) => ({ key: '', code: '', metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...init }) as KeyboardEvent;
    const { escape, next, previous } = inboxFileViewerShortcuts.shortcuts;
    expect(escape.bindings.some((b) => matchesShortcutBinding(keydown({ key: 'Escape' }), b))).toBe(true);
    for (const key of [']', 'ArrowRight']) expect(next.bindings.some((b) => matchesShortcutBinding(keydown({ key }), b))).toBe(true);
    for (const key of ['[', 'ArrowLeft']) expect(previous.bindings.some((b) => matchesShortcutBinding(keydown({ key }), b))).toBe(true);
    // ⌘] is the browser's Forward; Shift+→ extends a selection.
    expect(next.bindings.some((b) => matchesShortcutBinding(keydown({ key: ']', metaKey: true }), b))).toBe(false);
    expect(next.bindings.some((b) => matchesShortcutBinding(keydown({ key: 'ArrowRight', shiftKey: true }), b))).toBe(false);
    const { archive } = inboxThreadShortcuts.shortcuts;
    expect(archive.bindings.some((b) => matchesShortcutBinding(keydown({ key: 'e' }), b))).toBe(true);
    expect(archive.bindings.some((b) => matchesShortcutBinding(keydown({ key: 'e', ctrlKey: true }), b))).toBe(false);
    expect(archive.bindings.some((b) => matchesShortcutBinding(keydown({ key: 'e', altKey: true }), b))).toBe(false);
    for (const [key, shortcut] of [['j', inboxThreadShortcuts.shortcuts.nextThread], ['k', inboxThreadShortcuts.shortcuts.previousThread]] as const) {
      expect(shortcut.bindings.some((b) => matchesShortcutBinding(keydown({ key }), b))).toBe(true);
      for (const modifier of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
        expect(shortcut.bindings.some((b) => matchesShortcutBinding(keydown({ key, ...modifier }), b))).toBe(false);
      }
    }
  });
});
