# Shanglong Hu — Academic Homepage

Static academic website: https://shanglonghu.github.io/.

## Files

- `index.html`: about, news, research interests, education, paper and experience.
- `style.css`: all styling. Colors, fonts and spacing are design tokens at the top of the file; the dark theme redefines the same tokens.
- `script.js`: progressive enhancements only — light/dark toggle (remembered in `localStorage`), active-section highlight in the top bar, scroll reveal, and the BibTeX copy button. The page reads fine without it.
- `analytics.js`: first-party visitor analytics (see `privacy.html`).
- `headshot.webp`: display portrait (480 px). `headshot.png` is the 800 px original, used for link previews.
- `question-drift-figure.webp`: Figure 1 of the paper, shown on the paper card.
- `thoughtfulness-award.jpg`: certificate linked from the Experience award.

Fonts (Inter and Newsreader) load from Google Fonts without blocking rendering; if they are unavailable, system fonts are used.

## Preview and update

Run `python -m http.server 8000` in this directory, then open http://localhost:8000. Edit the HTML for content or the CSS for appearance. Commit updates to `main` for GitHub Pages to publish them. When updating CSS or JS, change its version query in `index.html` (and the CSS one in `privacy.html`) to avoid an older cached file.

To add a news item, add an `<li>` at the top of `.news-list`. To add a paper, copy the `<article class="paper">` block.
