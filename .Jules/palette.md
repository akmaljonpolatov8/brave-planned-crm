## 2024-06-03 - Accessible SMS Character Counter
**Learning:** For dynamic counters that provide real-time feedback (like SMS character counts), using `aria-live="polite"` on the counter and linking it to the input via `aria-describedby` ensures that the status is accessible to screen reader users without being overly disruptive.
**Action:** Always include ARIA live regions for character counters and ensure they are programmatically associated with their respective inputs.
