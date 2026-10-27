import { defineShortcutScope } from '@plannotator/ui/shortcuts';

/**
 * The thread and Inbox list's keys (App.tsx). Bare letters stand down
 * while typing; all stand down in a dialog, menu, listbox or open file
 * (guards.ts and the handler's `when`).
 */
export const inboxThreadShortcuts = defineShortcutScope({
  id: 'inbox-thread',
  title: 'Thread',
  shortcuts: {
    toggleFocusMode: {
      description: 'Toggle thread focus mode',
      bindings: ['Mod+.'],
      section: 'View',
      hint: 'Hide the Inbox column; press again to restore it. Keeps the thread and reply draft open.',
      preventDefault: true,
      displayOrder: 4,
    },
    archive: {
      description: 'Archive thread',
      bindings: ['E'],
      section: 'Threads',
      hint: 'The row the keyboard is on, else the open thread. Z undoes while the toast is up.',
      preventDefault: true,
      displayOrder: 0,
    },
    undo: {
      description: 'Undo what the toast offers',
      bindings: ['Z'],
      section: 'Threads',
      hint: 'While the toast shows Undo.',
      preventDefault: true,
      displayOrder: 1,
    },
    nextThread: {
      description: 'Next Inbox thread',
      bindings: ['J'],
      section: 'Inbox list',
      hint: 'Open the next visible row. Stops at the end; never while typing or in a file or dialog.',
      preventDefault: true,
      displayOrder: 2,
    },
    previousThread: {
      description: 'Previous Inbox thread',
      bindings: ['K'],
      section: 'Inbox list',
      hint: 'Open the previous visible row. Stops at the beginning; never while typing or in a file or dialog.',
      preventDefault: true,
      displayOrder: 3,
    },
  },
});
