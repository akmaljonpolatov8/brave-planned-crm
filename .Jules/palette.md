## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Uzbek ARIA Labels for Abstract UI Elements
**Learning:** In a specialized CRM where many interactive elements are icon-only or color-coded (like the attendance grid), explicit Uzbek ARIA labels and titles (e.g., 'keldi' for present, 'kelmadi' for absent) are crucial for both accessibility and user clarity.
**Action:** Use descriptive Uzbek labels for all non-textual interactive components to maintain consistency with the application's localized content.
