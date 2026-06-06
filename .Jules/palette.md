# Palette's Journal

## 2025-05-15 - Accessible Modal Implementation
**Learning:** Standardizing the `Modal.tsx` component with accessibility attributes (role="dialog", aria-modal="true", aria-labelledby) and interaction patterns (Escape key, backdrop click) significantly improves the UX and screen reader support across the entire app, as the component is used for critical student and teacher management tasks. Stopping event propagation on the modal content is essential when implementing backdrop click closure to prevent accidental dismissal during internal interactions.
**Action:** Always include basic ARIA roles and keyboard listeners in core layout components like Modals and Dropdowns to ensure a consistent, accessible foundation.
