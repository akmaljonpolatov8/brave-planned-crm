## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Contextual Accessibility in Dense Grids
**Learning:** In dense interactive grids (like attendance records), icon-only or color-only controls require descriptive ARIA labels that combine row (e.g., student name) and column (e.g., date) context for screen readers to provide sufficient location and action information.
**Action:** Ensure all interactive grid cells have ARIA labels providing full row/column context.

## 2025-05-15 - Sticky Context for Large Tables
**Learning:** For data-heavy tables that scroll horizontally, keeping the primary identifier (e.g., name) sticky is crucial for maintaining user context. Using `border-separate` and `outline` on sticky cells avoids border-collapse rendering issues.
**Action:** Implement sticky primary columns for all wide horizontal-scrolling tables.

## 2025-10-24 - Empty State Celebrations for Reinforcement UX
**Learning:** For administrator-facing dashboards (e.g., debt tracking), replacing blank/empty tables with a delightful celebration-themed card (e.g. "Qarzdorlar mavjud emas 🎉") acts as a strong positive visual feedback. Combining this with dynamic network loading state handlers prevents confusing layout shifts during asynchronous state loading.
**Action:** Always wrap async table views in explicit loading, empty-state celebration, and data-bound conditional blocks.
