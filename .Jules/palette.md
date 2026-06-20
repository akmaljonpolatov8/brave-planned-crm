## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Contextual ARIA Labels and Sticky Columns in Grids
**Learning:** In dense interactive grids, icon-only controls require descriptive ARIA labels combining row and column context. Additionally, sticky columns for primary identifiers (like names) are essential for maintaining user context during horizontal scrolling in data-heavy tables.
**Action:** Use 'sticky left-0 z-10' with a theme-matching background for first columns and combine row/column data in 'aria-label' for all grid-based interactive elements.
