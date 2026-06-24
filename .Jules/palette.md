## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Sticky Context and Descriptive Labels in Grids
**Learning:** In dense interactive grids (like attendance records), icon-only or color-only controls require descriptive ARIA labels that combine row (e.g., student name) and column (e.g., date) context. Additionally, implementing sticky columns for primary identifiers maintains user context during horizontal scrolling.
**Action:** Use 'sticky left-0' for primary row identifiers and provide combined context ARIA labels for grid cell actions.
