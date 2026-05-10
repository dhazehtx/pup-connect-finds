# Accessibility (a11y)

This doc summarizes accessibility features and how to improve them.

## Current

- **Skip link**: "Skip to main content" link at the top of the layout (visible on keyboard focus). Use Tab once after load to focus it.
- **Landmarks**: `<main id="main-content">` for main content; header/footer structure.
- **Focus**: Buttons and links are focusable; modal traps focus where implemented (e.g. dialogs).
- **Color**: Not relied on alone for meaning; status uses badges/text as well as color.
- **Forms**: Labels and inputs are associated where Label/Input are used.

## Recommendations

1. **Headings**: Use a single `<h1>` per page and logical heading order (h1 → h2 → h3).
2. **Images**: Ensure `alt` text on all meaningful images; use `alt=""` for decorative ones.
3. **ARIA**: Add `aria-label` on icon-only buttons (e.g. "Close", "Mute", "Notifications").
4. **Live regions**: For toasts and dynamic updates, consider `aria-live="polite"` so screen readers announce them.
5. **Focus management**: After opening a modal, move focus to the dialog; on close, return focus to the trigger.
6. **Reduced motion**: Respect `prefers-reduced-motion` for animations (e.g. in CSS or theme).

## Testing

- Use **keyboard only** (Tab, Enter, Space, Escape) to navigate and activate controls.
- Use a **screen reader** (e.g. VoiceOver on Mac, NVDA on Windows) to check announcements.
- Check **color contrast** (e.g. DevTools Lighthouse or contrast checker) for text and interactive elements.
