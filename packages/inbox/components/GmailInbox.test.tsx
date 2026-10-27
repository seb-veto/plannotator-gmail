import { afterEach, expect, test } from 'bun:test';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { TooltipProvider } from '@plannotator/ui/components/Tooltip';
import type { InboxListRow } from '@plannotator/core/inbox-types';
import { GmailInbox, type GmailInboxProps } from './GmailInbox';
let root: Root|null=null;let host: HTMLDivElement|null=null;
afterEach(()=>{if(root)act(()=>root!.unmount());host?.remove();root=null;host=null;});
const item=(id:string,subject:string):InboxListRow=>({thread_id:id,subject,project_id:'p',created_at:'2026-10-27T12:00:00Z',last_author:'agent',thread_name:null,answered_not_sent:false,waiting_since:null,sent:null,guide:false,waiting_on_person:true,section:'new',unseen:1,unread:true,resolved_at:null,last_at:'2026-10-27T12:00:00Z',message_count:1,project:{id:'p',name:'Synthetic'},author:{kind:'agent',name:'Test agent',host:'codex',session:'test'},questions:{open:0,picked:0,stopped:false,holds_up:[],prompt:null}});
const one=item('one','One');const two=item('two','Two');
function render(overrides: Partial<GmailInboxProps>={}){
 host=document.createElement('div');document.body.append(host);root=createRoot(host);
 const props:GmailInboxProps={title:'Inbox',path:null,sections:[{id:'new',label:'New',threads:[one,two]}],filtered:false,narrow:false,selectedThreadId:null,notice:null,onShowNew:()=>{},onOpen:()=>{},mailView:'inbox',marks:{},onPriority:async()=>{},onArchiveSelected:async()=>{},...overrides};
 act(()=>root!.render(<TooltipProvider><GmailInbox {...props}/></TooltipProvider>));return host;
}
const click=(el:Element)=>act(()=>(el as HTMLElement).click());
const settle=async()=>{await act(async()=>{await new Promise(done=>setTimeout(done,0));});};
test.skipIf(typeof document==='undefined')('checkboxes select the actual conversations and archive passes only the selection',async()=>{
 let archived:InboxListRow[]=[];const el=render({onArchiveSelected:async rows=>{archived=rows;}});
 click(el.querySelector('[aria-label="Select One"]')!);
 expect((el.querySelector('[aria-label="Select all visible conversations"]') as HTMLInputElement).checked).toBe(false);
 click(el.querySelector('[aria-label="Archive selected conversations"]')!);await settle();
 expect(archived.map(r=>r.thread_id)).toEqual(['one']);expect(el.textContent).not.toContain('1 selected');
 click(el.querySelector('[aria-label="Select all visible conversations"]')!);expect(el.textContent).toContain('2 selected');
});
test.skipIf(typeof document==='undefined')('marker controls save one flag without opening the thread and expose a save failure',async()=>{
 let opened=0;let saved:unknown;const el=render({onOpen:()=>{opened++;},onPriority:async(id,mark)=>{saved={id,mark};throw new Error('Disk is full; marker not saved.');}});
 click(el.querySelector('[aria-label="Star: One"]')!);await settle();
 expect(saved).toEqual({id:'one',mark:{starred:true}});expect(opened).toBe(0);
 expect(el.querySelector('[role="alert"]')!.textContent).toContain('Disk is full');
 expect(el.querySelector('[aria-label="Star: One"]')!.getAttribute('aria-pressed')).toBe('false');
});
test.skipIf(typeof document==='undefined')('archived conversations in All mail cannot be bulk-archived then incorrectly restored by Undo',()=>{
 const el=render({mailView:'all',sections:[{id:'quiet',label:'Quiet',threads:[{...one,resolved_at:'2026-10-27T12:01:00Z'}]}]});
 click(el.querySelector('[aria-label="Select One"]')!);
 expect((el.querySelector('[aria-label="Archive selected conversations"]') as HTMLButtonElement).disabled).toBe(true);
});
