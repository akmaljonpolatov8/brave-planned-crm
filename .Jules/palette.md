## 2025-05-14 - Accessible Attendance Grid and Dynamic Counters
**Learning:** For grid-based interactive elements like the Attendance Grid, using dynamic ARIA labels (e.g., student name + date + status) significantly improves screen reader navigation. For dynamic text counters, combining `aria-live="polite"` with `aria-describedby` on the input ensures the count is accessible without being intrusive.
**Action:** Always use descriptive ARIA labels for icon-only grid buttons and ensure live regions are properly linked to their respective inputs in future components.
