import { useId, useRef, useState } from 'react';
import type { InboxListRow, InboxPriorityMark } from '@plannotator/core/inbox-types';
import type { InboxListProps } from './InboxList';
import { rowAgent } from './InboxList';
import { agentName, shortTime } from '../format';
import { priorityGroups, isImportant, type MailView, type PriorityMarks } from '../gmail-priority';
import { Icon } from '../icons';
import { Tip } from './Tip';
import { ThreadRowMenu } from './RowMenu';
import { offersRowMarkRead } from '../markRead';

export interface GmailInboxProps extends InboxListProps {
  mailView: MailView;
  marks: PriorityMarks;
  onPriority: (id: string, mark: InboxPriorityMark) => Promise<void>;
  onArchiveSelected: (rows: InboxListRow[]) => Promise<void>;
}
export function GmailInbox(props: GmailInboxProps) {
  const groups = priorityGroups(props.sections, props.marks, props.mailView);
  const rows = groups.flatMap(g => g.rows);
  const [selected, select] = useState<ReadonlySet<string>>(new Set());
  const [collapsed, collapse] = useState<ReadonlySet<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const help = useId();
  const root = useRef<HTMLElement>(null);
  const picked = rows.filter(r => selected.has(r.thread_id));
  const toggle = (id: string) => select(old => { const next = new Set(old); if(next.has(id))next.delete(id);else next.add(id);return next; });
  const save = async (id: string, mark: InboxPriorityMark) => {
    const pressed = document.activeElement;
    setBusy(id);setError('');
    try { await props.onPriority(id, mark); } catch(e) { setError(e instanceof Error ? e.message : 'The marker was not saved.'); }
    finally { setBusy(null); requestAnimationFrame(() => { if(pressed && !pressed.isConnected && document.activeElement === document.body && root.current?.getClientRects().length) root.current.querySelector<HTMLElement>('[data-thread-id], h1')?.focus(); }); }
  };
  return <section ref={root} className="ib-listcol gm-mail" aria-label={props.title}>
    <h1 tabIndex={-1} className="ib-sr">{props.title}</h1>
    <div className="gm-tools">
      <input type="checkbox" aria-label="Select all visible conversations" checked={rows.length > 0 && picked.length === rows.length} aria-describedby={help} onChange={e => select(e.target.checked ? new Set(rows.map(r => r.thread_id)) : new Set())} />
      {picked.length ? <>
        <Tip content="Archive selected"><button type="button" className="gm-icon" aria-label="Archive selected conversations" aria-describedby={help} disabled={busy !== null || picked.every(r=>!!r.resolved_at)} onClick={async()=>{setBusy('archive');setError('');try{await props.onArchiveSelected(picked);select(new Set());}catch(e){setError(e instanceof Error?e.message:'The archive failed.');}finally{setBusy(null);}}}><Icon name="archive" size={20}/></button></Tip>
        <span>{picked.length} selected</span>
      </> : <Tip content="Refresh inbox"><button type="button" className="gm-icon" aria-label="Refresh inbox" aria-describedby={help} onClick={props.onRefresh}><Icon name="refresh" size={19}/></button></Tip>}
      <span className="gm-spacer" />
      {props.onUnreadOnlyChange && <Tip content={props.unreadOnly ? 'Show all messages' : 'Show unread only'}><button type="button" className="gm-unread" aria-label="Unread threads only" aria-pressed={props.unreadOnly === true} aria-describedby={help} onClick={()=>props.onUnreadOnlyChange?.(!props.unreadOnly)}>Unread</button></Tip>}
      <span className="gm-count">{rows.length ? `1–${rows.length} of ${rows.length}` : '0 conversations'}</span>
    </div>
    <span id={help} className="ib-sr">Tab to a control; Enter or Space activates it. Section headings hide or show their conversations. Stars save threads for later. Importance changes priority. Select conversations, then Archive to remove them from Inbox; Undo restores them.</span>
    {error && <p role="alert" className="gm-error">{error}</p>}
    <ThreadRowMenu className="ib-lbody gm-mail-body" rowOf={id=>rows.find(r=>r.thread_id===id)??null} canMarkRead={props.onMarkRead!==undefined} listedInNew={id=>props.sections.some(s=>s.id==='new'&&s.threads.some(r=>r.thread_id===id))} pinnedOf={props.pinned ? id=>props.pinned!.has(id) : undefined} onTarget={()=>{}} onAction={(row,action)=>props.onRowAction?.(row,action)} disabled={!props.onRowAction} held={props.selectedThreadId!==null}>
      {props.ask}
      {props.notice && <button type="button" className="ib-notice" data-inbox-notice="" onClick={props.onShowNew}>{props.notice}<b>Show</b></button>}
      {groups.map(group=><section key={group.id} className="gm-group" aria-label={group.label} data-priority-group={group.id}>
        <Tip content={collapsed.has(group.id)?'Show section':'Hide section'}><button type="button" aria-describedby={help} className="gm-section" aria-expanded={!collapsed.has(group.id)} onClick={()=>collapse(old=>{const next=new Set(old);if(next.has(group.id))next.delete(group.id);else next.add(group.id);return next;})}>
          <Icon name={collapsed.has(group.id)?'chevR':'chevD'} size={16}/><span>{group.label}</span><span className="gm-section-count">{group.rows.length}</span>
        </button></Tip>
        {!collapsed.has(group.id) && (group.rows.length ? group.rows.map(row=>{
          const id=row.thread_id;const starred=props.marks[id]?.starred===true;const important=isImportant(row,props.marks);
          return <div key={id} data-row={id} className={`gm-row${row.unseen>0?' ib-u':''}${selected.has(id)?' gm-checked':''}`}>
            <input type="checkbox" aria-label={`Select ${row.subject??'conversation'}`} aria-describedby={help} checked={selected.has(id)} onChange={()=>toggle(id)}/>
            <Tip content={starred?'Remove star':'Add star'}><button type="button" className={`gm-marker gm-star${starred?' gm-marked':''}`} aria-label={`Star: ${row.subject??'conversation'}`} aria-pressed={starred} aria-describedby={help} disabled={busy!==null} onClick={()=>void save(id,{starred:!starred})}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.55 4.45 1.08 6.28L12 17.36l-5.63 2.97 1.08-6.28L2.9 9.6l6.3-.9Z"/></svg></button></Tip>
            <Tip content={important?'Mark not important':'Mark as important'}><button type="button" className={`gm-marker gm-important${important?' gm-marked':''}`} aria-label={`Important: ${row.subject??'conversation'}`} aria-pressed={important} aria-describedby={help} disabled={busy!==null} onClick={()=>void save(id,{important:!important})}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h10l7 7-7 7H4l6-7Z"/></svg></button></Tip>
            <button type="button" className={`gm-open ib-row${row.unseen>0?' ib-u':''}`} data-thread-id={id} aria-keyshortcuts="Shift+F10" aria-current={props.selectedThreadId===id?'true':undefined} onClick={()=>props.onOpen(row)} aria-label={`Open ${row.subject??'conversation'}`}>
              <span className="gm-sender">{agentName(rowAgent(row))}{row.message_count>1 && <span className="gm-message-count"> {row.message_count}</span>}</span>
              <span className="gm-summary"><span className="gm-project">{row.project.name}</span><span className="gm-subject">{row.subject??'(no subject)'}</span>{row.questions.open>0 && <span className="gm-preview"> — {row.questions.open} question{row.questions.open===1?'':'s'} waiting on you</span>}</span>
              <time className="gm-date">{shortTime(row.last_at)}</time>
            </button>
            {row.read_at && <span className="ib-c ib-sr">Read</span>}
            {props.onMarkRead && offersRowMarkRead(row,props.sections.some(s=>s.id==='new'&&s.threads.some(r=>r.thread_id===id))) && <Tip content="Quiet; closes unanswered questions"><button type="button" data-row-mark-read="" className="gm-row-action" aria-label={`Mark read: ${row.subject??'conversation'}`} aria-describedby={help} onClick={()=>props.onMarkRead?.(row)}><Icon name="checkCircle" size={18}/><span className="ib-sr">Mark read</span></button></Tip>}
          </div>;
        }) : <div className="gm-no-mail">No conversations in this section.</div>)}
      </section>)}
      <footer className="gm-footer">Esc: back to Inbox · E: archive · J / K: next / previous · ⌘.: focus</footer>
    </ThreadRowMenu>
  </section>;
}
