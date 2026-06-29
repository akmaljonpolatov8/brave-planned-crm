## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2026-06-29 - Accessible Search Interface with Shortcuts
**Learning:** When implementing global or prominent search bars, using `role="searchbox"` and providing a keyboard shortcut (e.g., ⌘K) significantly improves power-user efficiency. Crucially, the shortcut listener must guard against focus theft when the user is already typing in another input or textarea.
**Action:** Always include keyboard shortcut hints (using `<kbd>`) and focus-theft guards for primary action shortcuts.
