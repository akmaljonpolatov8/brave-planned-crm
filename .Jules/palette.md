## 2025-05-15 - Uzbek Accessibility Labels
**Learning:** The application's UI is localized in Uzbek (e.g., 'O'quvchi', 'Chiqish'). Adding accessibility labels in English would create an inconsistent experience for screen reader users.
**Action:** Use Uzbek for all ARIA labels and title attributes (e.g., 'Keldi' for present, 'Kelmadi' for absent).

## 2025-05-15 - Interactive Grid Feedback
**Learning:** In the application's dark theme, the icon-only buttons in the Attendance Grid lacked clear interactive feedback, making it hard to know which cell was being hovered or focused.
**Action:** Apply `hover:brightness-125` and explicit focus rings (`focus:ring-[#46CFB0]/50`) to provide clear visual cues for interactive elements.
