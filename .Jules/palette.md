## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Interactive Grid Feedback
**Learning:** For interactive grid controls in a dark theme, using `brightness-125` on hover and explicit focus rings (e.g., `focus:outline-none focus:ring-2 focus:ring-brand`) provides necessary visual feedback and accessibility for keyboard navigation.
**Action:** Ensure all interactive grid cells or status buttons have hover states and visible focus rings.
