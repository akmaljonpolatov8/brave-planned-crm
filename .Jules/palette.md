## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Sticky Grid Context and Dense ARIA Labels
**Learning:** In dense interactive grids (like attendance records), sticky identifiers (row headers) are essential for maintaining context. To preserve visual borders while using sticky positioning in Tailwind, using `border-separate` on the table and `outline` on the cells is more reliable than standard borders. Furthermore, icon-only or color-only controls require descriptive ARIA labels that combine both row (student name) and column (date) context for screen readers.
**Action:** Use `border-separate` + `outline` for sticky tables and ensure ARIA labels include full spatial context in grid-based controls.
