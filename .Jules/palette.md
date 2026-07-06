## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Keyboard Accessible Custom Controls
**Learning:** Custom interactive elements (like `div` based checkboxes) require explicit ARIA roles (`role="checkbox"`), state management (`aria-checked`), and keyboard event listeners (`onKeyDown` for Space/Enter) to be accessible to all users.
**Action:** Ensure all custom interactive components implement full keyboard and ARIA support.
