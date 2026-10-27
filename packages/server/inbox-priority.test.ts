import { afterEach, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { InboxStore } from '@plannotator/shared/inbox/store';
import { createInboxPriority } from './inbox-priority';
const dirs: string[]=[];
afterEach(()=>{for(const dir of dirs.splice(0))rmSync(dir,{recursive:true,force:true});});
const id='msg_01K70000000000000000000001';
function setup(){
 const dir=mkdtempSync(join(tmpdir(),'plannotator-gmail-priority-'));dirs.push(dir);let changes=0;
 const store={dir,listRow:(key:string)=>key===id?{thread_id:id}:null} as unknown as InboxStore;
 const options={store,serverSession:'current',readBody:async(req:Request)=>req.json() as Promise<Record<string,unknown>>,json:(body:unknown,status=200)=>Response.json(body,{status}),onChange:()=>{changes++;}};
 const api=createInboxPriority(options);const url=new URL(`http://localhost/api/inbox/threads/${id}/priority`);
 const post=(body:unknown)=>api.route(new Request(url,{method:'POST',body:JSON.stringify(body)}),url);
 return {dir,api,post,reopen:()=>createInboxPriority(options),changes:()=>changes};
}
test('stars and importance merge independently, persist after reopen and use owner-only atomic storage',async()=>{
 const s=setup();await s.post({starred:true,serverSession:'current'});await s.post({important:false,serverSession:'current'});
 expect(s.reopen().read()[id]).toEqual({starred:true,important:false});expect(statSync(join(s.dir,'priority.json')).mode&0o777).toBe(0o600);expect(s.changes()).toBe(2);
});
test('stale and invalid writes change nothing; corrupt/future storage is preserved',async()=>{
 const s=setup();expect((await s.post({starred:true,serverSession:'stale'}))!.status).toBe(409);expect(s.api.read()).toEqual({});
 await expect(s.post({starred:'true'})).rejects.toThrow();await expect(s.post({starred:true,important:true})).rejects.toThrow();
 const file=join(s.dir,'priority.json');for(const raw of ['not json',JSON.stringify({v:2,marks:{}})]){writeFileSync(file,raw);await expect(s.post({starred:true})).rejects.toThrow();expect(readFileSync(file,'utf8')).toBe(raw);}
 expect(s.changes()).toBe(0);
});

test('the real Inbox door enforces origin and session guards and exposes the saved flag on its list',async()=>{
 const { startInboxServer }=await import('./inbox');
 const dir=mkdtempSync(join(tmpdir(),'plannotator-gmail-door-'));dirs.push(dir);
 const server=await startInboxServer({dataDir:dir,binaryPath:null});
 try{
  const project=server.store.ensureProject({name:'Synthetic',root:dir});
  const sent=server.store.sendMessage({project_id:project.id,author:{kind:'agent',host:'codex',session:'priority-test',name:'Priority test'},body:'Synthetic priority test.'}).message;
  const before=server.store.cursor();
  const endpoint=`http://127.0.0.1:${server.port}/api/inbox/threads/${sent.thread_id}/priority`;
  const post=(origin:string,session:string)=>fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({starred:true,serverSession:session})});
  expect((await post('https://elsewhere.invalid',server.serverSession)).status).toBe(403);
  expect((await post(new URL(endpoint).origin,'stale')).status).toBe(409);
  expect((await post(new URL(endpoint).origin,server.serverSession)).status).toBe(200);
  const model=await (await fetch(new URL('/api/inbox/threads',server.url))).json() as {priority:Record<string,{starred:boolean}>};
  expect(model.priority[sent.thread_id]!.starred).toBe(true);expect(server.store.cursor()).toBe(before);
 }finally{server.stop();}
});
