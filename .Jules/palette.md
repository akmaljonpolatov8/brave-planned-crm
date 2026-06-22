## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Dense Grid Context and Accessibility
**Learning:** In dense interactive grids (like attendance records), icon-only or color-only controls require descriptive ARIA labels that combine row (e.g., student name) and column (e.g., date) context. Additionally, for data-heavy tables, implementing sticky columns for primary identifiers (e.g., student names) using `sticky left-0 z-10` with a matching theme background is essential for maintaining user context during horizontal scrolling.
**Action:** Always provide combined context in ARIA labels for grid cells and use sticky positioning for key columns in wide tables.
