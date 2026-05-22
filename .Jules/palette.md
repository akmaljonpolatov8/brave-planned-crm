## 2025-05-15 - [Accessibility] ARIA labels for icon-only and color-only buttons
**Learning:** In a CRM with attendance grids, simple colored boxes or icon buttons (like ✓/✕) are common but completely inaccessible to screen readers without descriptive labels. These labels should include both the student's context (name), the temporal context (date/day), and the current state (status).
**Action:** Always add `aria-label` to grid-based toggle buttons, including multiple dimensions of context (who, when, what status).
