# Shanglong Hu — Academic Homepage

Static academic website: https://shanglonghu.github.io/.

## Files

- `index.html`: biography, research interests, education, publication, and experience. The display portrait is embedded in this file.
- `style.css`: all styling, responsive layouts, keyboard focus, and reduced-motion support.
- `thoughtfulness-award.jpg`: certificate linked from the Experience award.

## Preview and update

Run `python -m http.server 8000` in this directory, then open http://localhost:8000. Edit the HTML for content or the CSS for appearance. Commit updates to `main` for GitHub Pages to publish them. When updating CSS, change its version query in `index.html` to avoid an older cached stylesheet.

No build step, JavaScript, analytics, or external font service is required.

The embedded portrait can still be extracted by website visitors. Removing a separate image file from the current branch does not remove it from earlier Git history.
