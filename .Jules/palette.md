## 2025-05-14 - Accessible Dynamic Counters
**Learning:** For interactive counters that update as the user types (like SMS character counts), using `aria-live="polite"` on the counter and linking it with `aria-describedby` ensures screen reader users are informed of the state without breaking their flow.
**Action:** Apply this pattern to all future dynamic counters or status indicators in the CRM.

## 2025-05-15 - Localized Accessibility Labels
**Learning:** In applications where the UI is in a specific language (like Uzbek), all accessibility labels (e.g., `aria-label`) must be localized to match the content language, as screen reader users expect consistency with the visual text.
**Action:** Always verify the language of existing UI elements before adding ARIA labels and ensure they match.
