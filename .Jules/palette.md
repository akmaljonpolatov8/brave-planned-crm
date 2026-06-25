## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Sticky Grid Context and Dense Action Accessibility
**Learning:** In dense interactive grids (like attendance records), sticky columns for primary identifiers (student names) are critical for maintaining user context during horizontal scrolling. Furthermore, icon-only or color-only controls require descriptive ARIA labels that combine row (e.g., student name) and column (e.g., date) context to be fully accessible for screen readers.
**Action:** Implement sticky primary columns in horizontal grids and use contextual ARIA labels for grid-based actions.
