import type { InboxListRow, InboxListSection, InboxPriorityMark } from '@plannotator/core/inbox-types';
export type MailView = 'inbox' | 'starred' | 'important' | 'unread' | 'sent' | 'all';
export type PriorityMarks = Readonly<Record<string, InboxPriorityMark>>;
export const MAIL_VIEWS: { id: MailView; label: string }[] = [
  { id: 'inbox', label: 'Inbox' }, { id: 'starred', label: 'Starred' },
  { id: 'important', label: 'Important' }, { id: 'unread', label: 'Unread' },
  { id: 'sent', label: 'Sent' }, { id: 'all', label: 'All mail' },
];
export function isImportant(row: InboxListRow, marks: PriorityMarks): boolean {
  return marks[row.thread_id]?.important ?? ['stopped', 'holding', 'waiting'].includes(row.section);
}
export function priorityGroups(sections: readonly InboxListSection[], marks: PriorityMarks, view: MailView) {
  const rows = sections.flatMap(s => s.threads).filter(row => view === 'all' || !row.resolved_at || row.agent_after_archive === true);
  rows.sort((a,b) => b.last_at.localeCompare(a.last_at) || b.thread_id.localeCompare(a.thread_id));
  if (view !== 'inbox') return [{ id: view, label: MAIL_VIEWS.find(v => v.id === view)!.label, rows: rows.filter(r => view === 'all' || (view === 'starred' ? marks[r.thread_id]?.starred : view === 'important' ? isImportant(r, marks) : view === 'unread' ? r.unseen > 0 : r.last_author === 'person')) }];
  const groups = ['Important and unread', 'Important', 'Starred', 'Everything else'].map((label, i) => ({ id: `priority-${i}`, label, rows: [] as InboxListRow[] }));
  for (const row of rows) {
    const important = isImportant(row, marks);
    groups[important && row.unseen > 0 ? 0 : important ? 1 : marks[row.thread_id]?.starred ? 2 : 3]!.rows.push(row);
  }
  return groups;
}

/** Gmail badges count unseen threads, independently of questions still waiting on the person. */
export function gmailUnreadCounts(sections: readonly InboxListSection[]) {
  const projects = new Map<string, number>();
  let total = 0;
  for (const section of sections) for (const row of section.threads) {
    if (!(row.unseen > 0) || (row.resolved_at && row.agent_after_archive !== true)) continue;
    total++;
    projects.set(row.project.id, (projects.get(row.project.id) ?? 0) + 1);
  }
  return { total, projects };
}
