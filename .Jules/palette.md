## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Accessible Sticky Data Grids
**Learning:** In dense interactive grids like attendance records, sticky headers and columns require careful border management. Using `border-separate` on the table and `outline` on sticky cells avoids the layout issues of `border-collapse` while maintaining visual consistency. Additionally, buttons in these grids must provide both visual context (hover/focus) and screen reader context (aria-labels combining row and column headers).
**Action:** Use `border-separate` + `outline` for sticky tables and ensure ARIA labels in dense grids include full contextual information (e.g., "Student: Date, Status").
