## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Sticky Context in Dark Theme Tables
**Learning:** In dense interactive grids (like attendance), horizontal scrolling is inevitable. Sticky primary columns (e.g., names) are essential for context. Using `border-separate` with `outline` on sticky cells preserves visual borders where `border-collapse` fails, and using theme variables like `var(--bg-deep)` ensures the sticky element blends perfectly with the background.
**Action:** Use `sticky`, `border-separate`, and `outline` for all data-heavy horizontal scrolling tables.
