## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Interactive Grid Accessibility
**Learning:** In dense interactive grids (like attendance records), icon-only or color-only controls require descriptive ARIA labels that combine row (student name) and column (date) context for screen readers. Adding `title` tooltips and distinct focus/hover states (e.g., `brightness-125` and `focus:ring-brand`) improves the experience for all users.
**Action:** Always include contextual labels and clear interactive states for grid-based status toggles.
