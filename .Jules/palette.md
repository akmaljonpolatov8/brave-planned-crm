## 2025-05-14 - Accessible and Interactive Modals
**Learning:** Modals in this application were missing core ARIA attributes (role, aria-modal, aria-labelledby) and keyboard/backdrop interactions, which are essential for accessibility and a "polished" feel.
**Action:** Always ensure modals have `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` linked to the title. Implement `Escape` key and backdrop click handlers for a smoother user experience.
