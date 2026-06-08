# Palette's Journal - Brave and Planet CRM

## 2025-05-14 - Modal Accessibility and UX
**Learning:** The existing Modal component lacks basic accessibility features (ARIA roles) and common UX patterns (Escape key to close, backdrop click to close). In a CRM where users frequently interact with modals for data entry, these shortcuts and screen reader supports are essential.
**Action:** Implement `role="dialog"`, `aria-modal="true"`, Escape key listener, and backdrop click handler in the `Modal` component.
