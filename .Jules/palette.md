# Palette's Journal - Critical UX/Accessibility Learnings

This journal documents critical learnings regarding UX and accessibility patterns in the Brave and Planet CRM.

## 2025-05-14 - Attendance Grid Accessibility
**Learning:** Icon-only interactive grids (like the Attendance Grid) lack context for screen reader users and visual affordance for keyboard navigation. Using localized `aria-label` and `title` attributes provides essential context, while standardizing on `hover:brightness-125` and explicit `focus-visible` rings ensures a consistent interactive experience in the dark theme.
**Action:** Always provide descriptive, localized ARIA labels for grid-based controls and ensure they have distinct hover and focus states.
