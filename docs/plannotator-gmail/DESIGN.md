# Gmail Priority Inbox reference lock

Build a separate Plannotator fork named `plannotator-gmail`, based on qualified v2 commit 070dba1, with its history linked from the independent source snapshot. Preserve the existing Inbox, review, question, attachment and keyboard behavior underneath the Gmail presentation.

Primary references: [Google's Priority Inbox guide](https://support.google.com/mail/answer/18522?hl=en), [Google's inbox types walkthrough](https://blog.google/products-and-platforms/products/gmail/gmail-inbox-types/), and its public illustrated Gmail interface. Gmail's exact UI is the user's explicit target, overriding the generic design skill's synthesis preference. Use Plannotator identity and real agent messages.

Lock: light blue-gray app canvas, white rounded mail surface, 256px navigation, pale blue Compose button, pill search field across the top, 40px horizontal mail rows, 14px system/Arial typography, yellow star and importance markers, bold unseen messages, horizontal section headings. Opening a thread replaces the mail list, as Gmail's default does; Escape returns. No decorative gradients, dashboard cards or added branding assets.

Use the user's four named sections in order: Important and unread; Important (already seen); Starred (remaining starred threads); Everything else. Each thread appears once. Importance is explicit and defaults on for work holding up the person; the person can override it. Stars and importance persist on the isolated Inbox server, outside agent messages. Sidebar filters provide Starred, Important, Unread, Sent and All mail; project folders remain available as labels. Selection enables archive using the existing archive action. Do not turn viewing into answering or skipping a question.

New controls must have names, short pointer tips and keyboard help. Existing E/Z/J/K and Command-period remain; no additional bare-letter shortcuts. Keep data and browser preferences separate from both other forks, and do not connect real agents or replace the installed Inbox.

Acceptance: meaningful priority partition/flag persistence and validation tests; build order review → hook → OpenCode; compiled candidate in Aside with synthetic data; compare its light layout with the reference, verify stars/importance/filtering, selection/archive, read transitions, thread return, keyboard focus and original cookie isolation. No Gmail account access or email sending is part of this fork.
