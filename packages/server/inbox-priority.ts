import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkServerSession, INBOX_SERVER_SESSION_MISMATCH_ERROR, serverSessionMismatchBody } from '@plannotator/core/server-session';
import { isInboxId, type InboxPriorityMark } from '@plannotator/core/inbox-types';
import { InboxError } from '@plannotator/shared/inbox/schema';
import type { InboxStore } from '@plannotator/shared/inbox/store';
import { writeAgentFileAtomic } from './agent-files';

/** Private window furniture, outside agent events. An unreadable file is never silently overwritten. */
export function createInboxPriority(options: {
  store: InboxStore;
  serverSession: string;
  readBody: (req: Request) => Promise<Record<string, unknown>>;
  json: (body: unknown, status?: number) => Response;
  onChange: () => void;
}) {
  const file = join(options.store.dir, 'priority.json');
  function read(): Record<string, InboxPriorityMark> {
    let value: unknown;
    try { value = JSON.parse(readFileSync(file, 'utf8')); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
      throw new InboxError('validation_error', 'Cannot read priority.json; preserve it before repairing it.');
    }
    const saved = value as { v?: unknown; marks?: unknown } | null;
    if (!saved || saved.v !== 1 || !saved.marks || typeof saved.marks !== 'object' || Array.isArray(saved.marks)) throw new InboxError('validation_error', 'Unsupported priority.json; it has not been changed.');
    const marks = saved.marks as Record<string, InboxPriorityMark>;
    for (const [id, mark] of Object.entries(marks)) {
      if (!isInboxId('msg', id) || !mark || typeof mark !== 'object' || Array.isArray(mark) || Object.entries(mark).some(([k,v]) => !['starred', 'important'].includes(k) || typeof v !== 'boolean')) throw new InboxError('validation_error', 'Invalid priority.json; it has not been changed.');
    }
    return marks;
  }
  async function route(req: Request, url: URL): Promise<Response | null> {
    const match = /^\/api\/inbox\/threads\/([A-Za-z0-9_]+)\/priority$/.exec(url.pathname);
    if (!match) return null;
    if (req.method !== 'POST') return options.json({ error: 'Use POST.' }, 405);
    const body = await options.readBody(req);
    if (checkServerSession(body, options.serverSession) === 'mismatch') return options.json(serverSessionMismatchBody(INBOX_SERVER_SESSION_MISMATCH_ERROR), 409);
    if (!isInboxId('msg', match[1]) || !options.store.listRow(match[1])) throw new InboxError('thread_not_found', 'The thread no longer exists.');
    const changes = Object.fromEntries(Object.entries(body).filter(([k]) => k !== 'serverSession'));
    if (Object.keys(changes).length !== 1 || !Object.entries(changes).every(([k,v]) => ['starred','important'].includes(k) && typeof v === 'boolean')) throw new InboxError('validation_error', 'Send one boolean: starred or important.');
    const marks = read();
    marks[match[1]] = { ...marks[match[1]], ...changes };
    writeAgentFileAtomic(file, JSON.stringify({ v: 1, marks })+'\n', 0o600);
    options.onChange();
    return options.json({ priority: marks });
  }
  return { read, route };
}
