# Plannotator Gmail

A separate fork of Plannotator with Gmail's light Priority Inbox as the target. Built from [Craft-style v2 commit 070dba1](https://github.com/seb-veto/plannotator-v2/commit/070dba1a79b67217d0301b861f57b04ce57e563a). This independent GitHub repository starts with the complete verified source snapshot; the base history remains in that linked fork and the local `gmail-source-history` branch. GitHub reused the existing fork when asked for a second one, so v2 was restored and this repository was created separately. It is an agent Inbox, not a connection to a Gmail account.

Four sections follow Sebastian's request: **Important and unread**, **Important**, **Starred**, **Everything else**. A thread appears once, in the first matching section. The Inbox and project badges count unseen threads, independently of outstanding questions. Opening it clears unread emphasis but leaves its questions/actions open. The Important section contains seen important threads; Starred contains remaining starred threads. The sidebar's Starred and Important filters include all matching conversations, independently of section placement. Unread, Sent, All mail and project labels also work; All mail includes archived conversations.

The star and yellow importance marker are separate durable controls. Default importance follows stopped/holding/waiting work; an explicit importance choice overrides that rule. This is a transparent local rule, not Gmail's learned importance algorithm. Markers are saved in the fork's `inbox/priority.json` with owner-only permissions and atomic writes; updates merge one flag at a time, and windows receive a priority event. They never enter agent messages or acknowledge a question.

Checkboxes select conversations; Archive acts on the selection and Undo restores successfully archived threads. Partial failure is shown and never rolls back unrelated threads. Clicking a conversation opens the existing reader; Escape returns to the Inbox. E/Z, J/K and Command-period retain their original guards. In this layout focus mode hides navigation because opening a conversation already replaces the mail list. Existing question, reply, review, Board and attachment workflows remain available.

The pill-shaped Search mail control opens Plannotator's working search palette. Compose starts a message to an agent. Gmail's identity, account integration, AI classification, snooze, spam, labels engine, email delivery and Google side apps are not included.

## Run separately

Use Bun 1.4.4 with the frozen lockfile and the repository's review → hook → OpenCode build order. Then compile:

```sh
bun install --frozen-lockfile --ignore-scripts
bun run --cwd apps/review build
bun run --bun build:hook
bun run --bun build:opencode
mkdir -p .local/runtime
bun build apps/hook/server/index.ts --compile --no-compile-autoload-bunfig \
  --define '__CLI_VERSION__="0.28.33+plannotator-gmail.6"' \
  --outfile .local/runtime/plannotator
./scripts/run-plannotator-gmail.sh
```

Always use the launcher: it defaults to `~/.plannotator-gmail` and disables automatic agent reconnection. Browser cookies use a separate Gmail prefix. The original Inbox, Craft-style v2, their settings and data are preserved. Real agent connection or existing-data migration is a separate activation decision.

References and acceptance are in [DESIGN.md](DESIGN.md). Google branding and private Gmail content are not distributed.

## Regression test adaptations

Gmail's four priority sections replace the original state-section placement. The existing read/archive suite keeps its server-state, question/skip, Undo and typing-guard assertions; its visual placement assertions now target the priority groups. The attachment suite's uniqueness check is scoped to the attachment-bearing article: its original purpose is to prevent duplicate attachment detail IDs, while the new mail controls legitimately share one help description. Failed pre-adaptation runs are retained in the private receipts.

## Qualification status

65 focused checks pass across priority/server, storage, mail controls, existing read/archive, shortcuts, attachment and theme suites. Both server and Inbox TypeScript checks pass; the review → hook → OpenCode build chain and compiled Bun trust check pass. The current executable is `0.28.33+plannotator-gmail.6`.

The first executable rebuild failed at about 250 MB free. When concurrent activity raised available space to about 890 MB, the same packaging command passed; no extra files were deleted. Both receipts are preserved privately.

Aside initially recolored the light header and read rows into dark color mixes. The scoped native-theme compatibility rule restores authored light backgrounds and text without changing browser settings. The final compiled `.6` candidate passes native Aside light palette/form-control, stars/Starred/importance, unread transition, batch archive/Undo, Search/Compose, reader focus, E/Z, draft-preserving Command-period and attachment/thread Escape checks; only owned synthetic tabs are closed. functional/browser verification uses an isolated context in an already-running shared test browser, preserves its original targets, and launches no browser. Physical keyboard input remains unqualified.

The compiled `.4` candidate passed a 1440×900 and 390×844 browser journey: priority placement, keyboard stars, importance, persistence across reload, cross-tab updates, Unread, viewing without closing a question, batch archive and Undo, Search/Compose, E/Z/J/K, attachment Escape, reader focus and draft-preserving focus mode. No page errors were observed. Its trace is retained; its owned context closed with all pre-existing targets preserved. The final change is scoped to Aside's native recoloring and light form controls. The shared test browser was no longer running for the final replay; it was not relaunched. Native Aside provides the final candidate's palette and interaction checks. This proves synthetic workflows; real agent delivery, production data migration, printing and the full repository suite were not tested.

![Gmail-style Priority Inbox with synthetic data](inbox.png)

![Conversation reader](thread.png)

[Mobile screenshot from the compiled `.4` responsive check](mobile.png).
