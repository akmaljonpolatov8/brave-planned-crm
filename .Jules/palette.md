## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Uzbek ARIA Labels for Icon-Only Controls
**Learning:** In a non-English application, ensuring all icon-only interactive elements (like modal closes or hamburger menus) have descriptive ARIA labels in the local language (Uzbek) is crucial for an accessible experience.
**Action:** Always check for `aria-label` on components using icon-only buttons and ensure the label is localized in Uzbek.
