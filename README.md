# StudyBuddy

Static site for Pakistan entry test preparation (NUST, FAST, ECAT, NTS, PIEAS, USAT).
No build step — plain HTML, CSS, and JS served directly.

## Structure

```
.
├── index.html               Landing page (tests, materials, calculator, about)
├── nust-guidance.html       NUST 2025 merit predictor + sortable merit table
├── robots.txt
├── sitemap.xml
├── favicon.ico / favicon.svg
└── assets/
    ├── css/
    │   ├── main.css             Styles for index.html
    │   ├── chat-overrides.css   Overrides for the embedded n8n chat widget
    │   └── nust-guidance.css    Styles for nust-guidance.html
    ├── js/
    │   ├── main.js              Nav, scroll reveal, and UI effects
    │   ├── nust-merit-data.js   NUST 2025 closing merit dataset
    │   └── nust-guidance.js     Predictor, merit table, lightbox, FAQ
    └── images/
        ├── apple-touch-icon.png      180x180, iOS home-screen icon
        ├── profile.jpg, profile-250.webp, profile-500.webp
        └── nust-meritlist-2025.jpg / .webp / -alt.jpg
```

Favicons stay at the repo root because browsers request `/favicon.ico` by default.
`favicon.ico` is a multi-size icon (16/32/48) generated from `favicon.svg`; if you
change the SVG, regenerate the `.ico` and `apple-touch-icon.png` to match.

`assets/js/nust-merit-data.js` must load before `assets/js/nust-guidance.js` —
the latter reads the dataset the former defines.

## Running locally

```sh
python3 -m http.server 8000
```

Then open http://127.0.0.1:8000.
