import { useSidebar } from '../shell/sidebar';
import { Icon } from '../icons';
import { Tip } from './Tip';
export function GmailHeader({ onSearch, onSettings }: { onSearch: (opener: HTMLElement) => void; onSettings: () => void }) {
  const { toggleSidebar } = useSidebar();
  return <header className="gm-header">
    <div className="gm-identity"><Tip content="Toggle navigation"><button type="button" className="gm-icon" aria-label="Toggle navigation" onClick={toggleSidebar}><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg></button></Tip><Icon name="inbox" size={28}/><span>Plannotator</span></div>
    <Tip content="Search conversations"><button type="button" className="gm-search" aria-label="Search mail" aria-keyshortcuts="Meta+K Control+K" aria-haspopup="dialog" onClick={e=>onSearch(e.currentTarget)}><Icon name="search" size={22}/><span>Search mail</span><kbd>⌘K</kbd></button></Tip>
    <span className="gm-spacer"/><Tip content="Open settings"><button type="button" className="gm-icon" aria-label="Settings" onClick={onSettings}><Icon name="settings" size={23}/></button></Tip><span className="gm-avatar" aria-label="Plannotator Gmail fork">P</span>
  </header>;
}
