# CLAUDE.md — OrionCSS (single source of truth for Orion styling)

## What this repo is

**OrionCSS owns the styling for every Orion course site.** `style.css` and `main.js` are the single
source of truth. No course content lives here.

Course pages live in one repo per vak and link back to this repo's GitHub Pages URLs:

| Repo | Vak |
|---|---|
| `tdmts/ICEES` | ICEES |
| `tdmts/DeN` | Datacommunicatie en Netwerken |
| `tdmts/Microcontrollers` | Microcontrollers |

One repo per vak is deliberate: collaborators are scoped to a single course and cannot affect
another course's content. This repo stays owned by the course lead and is consumed read-only.

## The contract

Every content page, in every vak repo, starts from this:

```html
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>...</title>
    <link rel="stylesheet" href="https://tdmts.github.io/OrionCSS/style.css">
    <script type="text/javascript" src="https://tdmts.github.io/OrionCSS/main.js"></script>
</head>
<body>
    <div class="container">
        <h1>...</h1>
    </div>
</body>
</html>
```

Always the **absolute GitHub Pages URL** — a relative path only resolves inside this repo.

A page is embedded in Brightspace through the iframe wrapper in `tdmts/OrionContent/index.html`, so
it must work standalone in an iframe: no cross-page navigation, no shared header or footer.

**Filenames in vak repos:** PascalCase Dutch nouns — `Studiemateriaal.html`, `Evaluatie.html`.

## Components

`main.js` wires components up by class name on load — content pages need no JS of their own.

- `.info-box` + `.info-title`, variants `remark` / `warning` / `tip` / `evaluation`; sizes
  `.info-box.normal` / `.info-box.small` — callouts
- `.checklist` — material lists, prerequisites
- `.code-wrapper` with `.language-*`, `.linenumbers`, `.show-language` — code blocks
- `.terminal-window` + `.term-line` / `.term-cmd` / `.term-out` — shell sessions
- `.config-window` + `.conf-line.new` / `.conf-line.mod` — config file diffs
- `.accordion-container` / `.accordion-item` — collapsible sections (FAQ, optional reading)
- `.steps-container` / `.step-item` — step-by-step wizard (`data-title`, `data-caption`)
- `.spoiler-container` + `.btn-spoiler` — hidden answer / solution reveal
- `.download-container` — file downloads with instructions
- `.figure-zoom` — zoomable images (auto-appends "Klik op de afbeelding om te vergroten")
- `.stl-viewer` (`data-src="..."`) — 3D STL preview
- `.math-tex` — inline / block math (MathJax)
- `.json-wrapper` — pretty-printed collapsible JSON
- `.list-details` — `<strong>` label above `<small>` detail
- `.table-responsive.table-spacer` + `.table-header-custom` — styled tables

`tdmts/OrionContent/template.html` renders every component with its exact markup. Read it before
authoring rather than reproducing markup from this list, which will drift.

## Voice & language

- All content in **Dutch**.
- Address students with **`je`** (informal second person).

## Changing these files

A change here reaches every course at once.

- Never restyle to fix one page — fix the page, or report the issue.
- Never remove or rename a class without checking the vak repos first. Pages reference these names
  over an absolute URL and break silently on the live site.
- Adding a component: add the CSS, wire it in `main.js` if it needs behaviour, and document it in
  `OrionContent/template.html` in the same commit.
- `example.html` is a Brightspace iframe probe, not a styleguide. Leave it alone.
