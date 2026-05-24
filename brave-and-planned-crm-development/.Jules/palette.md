## 2025-05-14 - Accessibility improvements in core components
**Learning:** Adding ARIA labels and context to interactive elements is crucial for screen reader users, especially in custom grids like the attendance tracker where icon-only buttons are used. Using aria-expanded and dynamic labels for toggles improves state communication.
**Action:** Always include aria-label or descriptive titles for icon-only buttons and use aria-expanded for stateful toggle components.
