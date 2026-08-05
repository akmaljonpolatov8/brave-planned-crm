## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Contextual Accessibility in Dense Grids
**Learning:** In dense interactive grids (like attendance records), icon-only or color-only controls require descriptive ARIA labels that combine row (e.g., student name) and column (e.g., date) context for screen readers to provide sufficient location and action information.
**Action:** Ensure all interactive grid cells have ARIA labels providing full row/column context.

## 2025-05-15 - Sticky Context for Large Tables
**Learning:** For data-heavy tables that scroll horizontally, keeping the primary identifier (e.g., name) sticky is crucial for maintaining user context. Using `border-separate` and `outline` on sticky cells avoids border-collapse rendering issues.
**Action:** Implement sticky primary columns for all wide horizontal-scrolling tables.

## 2026-05-19 - Accessible and Non-Intrusive Search Navigation
**Learning:** Implementing keyboard shortcuts (e.g., `Ctrl+K` / `⌘K`) to focus search bars greatly speeds up power user workflows. To prevent frustrating focus hijacking, shortcut listeners must include safety guards checking `document.activeElement?.tagName` to ensure they do not trigger if the user is already interacting with another input or textarea. Additionally, detecting userAgent rather than deprecated navigator properties provides stable platform-specific key indicator rendering.
**Action:** Include safety guards on all global hotkeys and utilize modern userAgent checks for system-specific keyboard hints.
