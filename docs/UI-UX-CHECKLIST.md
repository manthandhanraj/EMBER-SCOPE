# UI/UX delivery checklist — 15 November 2026

All ten requested interface changes have been implemented. This checklist records implementation and defined checks; it is not a guarantee that every device or future data input is defect-free.

| # | Requested change | Delivered |
| --- | --- | --- |
| 1 | Larger, readable fonts | Main body, form and table text uses a 16px minimum; labels and controls use at least 14px. Headings and key figures have a clear size hierarchy. |
| 2 | White text | Dark mode uses near-white primary text and brighter supporting text. Light mode uses dark text for readable contrast. |
| 3 | More attractive design | Consistent charcoal/orange styling, clearer cards, spacing, typography and chart colors throughout the research tools. |
| 4 | Light and dark modes | Header toggle, saved theme cookie and matching server-rendered theme; no reload required when switching. |
| 5 | Easier navigation | Overview, Studies and Reports are the primary destinations. Advanced tools are in one menu. The four research steps are Explore, Compare, Insights and Report. Conditions and technical detail expand on request. PSI catalog shows six cards per page with search and filters. |
| 6 | Restore visual explanations | Real-data relevance bars, outcome/material charts, condition coverage, evidence counts, comparison tables and short takeaways. |
| 7 | Fix overlap | Replaced blocked inline map positions with a CSS grid. Six studies per map page, all fifteen available in list mode, and two-column cards on small screens. |
| 8 | Animate the inner fireball | Masked flame flicker, heat curls and blue glow move independently of the stationary chamber frame. |
| 9 | Background burning effect | Warm moving fire glow and drifting embers behind the chamber artwork. Decorative illustration remains labelled. |
| 10 | Clearer data and reports | At-a-glance report, labelled charts, top-study comparison, original source links, expandable limits/methods, print, Markdown and JSON exports. Briefs open in the short view first. |

## Verification

- 146 JavaScript/TypeScript tests passed, including chart aggregation and zero/unknown-value checks.
- Type checking, targeted lint and the optimized Webpack production build passed.
- Twelve production pages were checked in both saved themes: all 24 responses returned HTTP 200 with the expected theme and strict nonce-based security headers.
- Markdown and JSON research-report attachments returned valid downloadable content.
- Browser checks covered desktop and 432px mobile layouts. Tested research, report, study and PSI pages had no horizontal page overflow. Wide scientific tables retain their own scroll containers.
- Map cards had separate bounding boxes and spacing; next-page navigation and the complete fifteen-study list worked.
- Theme switching and reload persistence worked. Light-mode primary download button has white text on a brown background; dark mode uses dark text on a light orange background.
- Inner flame transforms changed while running; pause set the animation state to paused and resume restored running. System reduced-motion rules are also included.
- PSI next-page navigation and search worked; search reduced the catalog to one page and hid unnecessary pagination.
- Browser error logs were empty in the final production checks. Temporary viewport overrides and the owned verification server were cleaned up.

## Preview and start

- Dark overview: [ui-overview-dark.jpg](ui-overview-dark.jpg)
- Light report chart: [ui-report-light.jpg](ui-report-light.jpg)
- Start from the workspace root with `python runner.py`, or open `START-EMBERSCOPE.cmd`. Refresh an already-open browser after restarting the app.

Scientific records, source quotations, licensing and attribution were retained. These interface checks do not replace scientific validation. No hosting, Git push or paid AI request was performed for this revision.
