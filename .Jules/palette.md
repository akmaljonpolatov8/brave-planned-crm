## 2026-06-01 - Standardized Modal Accessibility
**Learning:** The existing `Modal` component lacked standard accessibility features (ARIA roles, keyboard support, backdrop dismissal), which is a common pattern in projects without a dedicated UI library. Standardizing these at the component level ensures all modals in the app benefit immediately.
**Action:** Always include `role="dialog"`, `aria-modal="true"`, `Escape` key listeners, and backdrop click handlers when implementing or refining modal components.
