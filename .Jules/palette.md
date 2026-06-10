## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-14 - Modal Accessibility and UX
**Learning:** Adding standard modal behaviors like closing on `Escape` key press and providing correct ARIA roles/labels (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) makes the interface significantly more accessible and intuitive for all users.
**Action:** Always ensure modals have keyboard listeners and appropriate ARIA attributes for a complete accessible experience.
