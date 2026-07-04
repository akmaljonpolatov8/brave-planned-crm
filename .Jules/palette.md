## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Enhancing Global Search UX
**Learning:** Adding a global keyboard shortcut (e.g., ⌘K) and a clear button to search inputs significantly improves power-user efficiency and general usability. Visual shortcut hints and consistent icon placement (Search on left, Clear/Kbd on right) provide immediate affordance.
**Action:** Use the enhanced `SearchBar` pattern for all searchable interfaces and ensure keyboard shortcuts are globally registered where appropriate.
