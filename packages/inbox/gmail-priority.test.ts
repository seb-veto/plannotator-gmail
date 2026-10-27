import { expect, test } from 'bun:test';
import type { InboxListRow, InboxListSection } from '@plannotator/core/inbox-types';
import { priorityGroups } from './gmail-priority';
const row = (id: string, section: InboxListRow['section'], unseen: number, extra = {}): InboxListRow => ({ thread_id: id, section, unseen, last_at: '2026-10-27T12:00:00Z', resolved_at: null, ...extra }) as InboxListRow;
const sections = (...threads: InboxListRow[]): InboxListSection[] => [{ id: 'new', label: 'New', threads }];
test('priority partitions every thread once, separates unseen importance and preserves read waiting work', () => {
  const source = sections(row('a','holding',1),row('b','waiting',0),row('c','quiet',0),row('d','new',1));
  const marks = { c: { starred:true }, d: { important:false,starred:true } };
  const groups = priorityGroups(source,marks,'inbox');
  expect(groups.map(g=>g.label)).toEqual(['Important and unread','Important','Starred','Everything else']);
  expect(groups.map(g=>g.rows.map(r=>r.thread_id))).toEqual([['a'],['b'],['d','c'],[]]);
  expect(source[0]!.threads.map(r=>r.thread_id)).toEqual(['a','b','c','d']);
  expect(priorityGroups(source,{a:{important:false}},'inbox')[3]!.rows.map(r=>r.thread_id)).toContain('a');
});
test('filters keep read stars, exclude archive except All mail, and use unseen rather than pending-work unread', () => {
  const source=sections(row('a','waiting',0,{unread:true}),row('b','new',1),row('c','quiet',0,{resolved_at:'2026-10-27T12:01:00Z'}),row('d','sent',0,{last_author:'person'}));
  const ids=(view:Parameters<typeof priorityGroups>[2])=>priorityGroups(source,{a:{starred:true}},view).flatMap(g=>g.rows.map(r=>r.thread_id));
  expect(ids('starred')).toEqual(['a']);expect(ids('important')).toEqual(['a']);expect(ids('unread')).toEqual(['b']);expect(ids('sent')).toEqual(['d']);expect(ids('all')).toEqual(['d','c','b','a']);
});
