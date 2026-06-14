## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-20 - Interactive Grid Accessibility
**Learning:** For interactive grid controls (like attendance toggles) in dark themes, combining `aria-label` with descriptive Uzbek status ('keldi', 'kelmadi'), `title` tooltips for mouse users, and explicit focus rings (`focus:ring-brand`) ensures the interface remains accessible and provides clear interaction feedback.
**Action:** Use descriptive Uzbek ARIA labels and brand-consistent focus states for all interactive data grid elements.
