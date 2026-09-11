# Saffron & Sage — Restaurant Website

A responsive, animated marketing site for a fictional modern restaurant, built with
**semantic HTML5, architected CSS, and dependency-free vanilla JavaScript**.

> Open `index.html` in any modern browser — no build step, no server required.

```
saffron-sage-restaurant/
├── index.html          # Semantic markup, ARIA, one page / anchored sections
├── css/
│   └── styles.css      # Design tokens + BEM + mobile-first media queries
├── js/
│   └── main.js         # 13 vanilla-JS interaction modules
├── images/             # Optimised photography (local, self-contained)
└── README.md
```

---

## How this maps to the four skill areas

### 1. Markup & Styling (HTML / CSS)
- **Semantic HTML5** throughout: `<header> <nav> <main> <section> <article>`-style
  cards, `<figure>/<figcaption>`, `<address>`, `<blockquote>/<cite>`, `<form>` with
  real labels. Landmarks + a skip-link + ARIA (`aria-expanded`, `aria-controls`,
  `role="dialog"`, `aria-modal`, `aria-live`) for accessibility.
- **Maintainable CSS architecture** modelled on the SCSS *7-1 / ITCSS* mindset but in
  modern vanilla CSS: a documented table of contents, **design tokens** as custom
  properties (`--gold`, `--space-section`, `--fs-hero`…), and **BEM naming**
  (`.dish__price`, `.carousel__btn--next`, `.nav__link.is-active`). Change one token,
  restyle the whole site.

### 2. Responsive Web Design
- **Mobile-first**: base styles target phones; `@media (min-width: …)` queries
  progressively enhance at `600 / 768 / 992 / 1400px`.
- **Fluid design** with `clamp()` for typography and spacing (fewer breakpoints,
  smoother scaling), plus CSS Grid + Flexbox and `aspect-ratio`.
- The navigation collapses into an off-canvas **hamburger drawer** below 992px and
  expands to an inline bar above it.

### 3. Working with Design Files
- Built from a defined **design system**: a fixed palette (charcoal / cream / saffron
  gold / sage), a type pairing (**Playfair Display** display + **Inter** body), a
  spacing scale, radii, and elevation/shadow tokens — the same artefacts you'd receive
  in a Figma/XD hand-off, translated 1:1 into tokens and reusable components.

### 4. Interactive UI & Dynamics (JavaScript)
**Preferred approach: vanilla JavaScript** (no jQuery / framework), using modern
`IntersectionObserver` for performant scroll work. Implemented:

| Interaction | Where |
|---|---|
| Hamburger menu (drawer, overlay, scroll-lock, Esc/resize close) | `initMobileNav` |
| Slider / carousel (autoplay, dots, prev/next, swipe, pause-on-hover, tab-hidden pause) | `initCarousel` |
| Testimonial cross-fade rotator | `initTestimonials` |
| Modals — reservation confirmation **and** gallery lightbox (keyboard + focus mgmt) | `initReserveForm`, `initLightbox` |
| Scroll-triggered reveal animations | `initReveal` |
| Animated stat counters | `initCounters` |
| Menu category filtering | `initMenuFilter` |
| Scroll-spy active-link highlighting | `initScrollSpy` |
| Sticky/condensing header, back-to-top, form validation, newsletter | others |

All animations respect **`prefers-reduced-motion`**.

### Accessibility
Built to be usable by keyboard and screen reader:
- **Focus management** — both modals (reservation confirmation + gallery lightbox)
  trap `Tab`, close on `Esc`, and restore focus to the trigger on close.
- **WCAG AA contrast** — gold price/stat text and the sage accents use darker
  on-light variants (`--gold-ink`, darkened `--sage`); the focus ring pairs a dark
  edge with a gold halo so it's visible on every background.
- **Announced forms** — inputs use `aria-invalid` + `aria-describedby` wired to
  `role="alert"` error messages, so validation is spoken, not just shown in red.
- **Correct semantics** — the menu filters are `aria-pressed` toggle buttons (not a
  fake tablist); auto-rotating carousels have a **pause/play** control (WCAG 2.2.2);
  touch targets meet 44px on small screens.

---

## Notes
- Photography is loaded locally from `images/` (sourced via Unsplash) so the folder is
  fully self-contained and works offline; Google Fonts fall back to system fonts.
- Content is placeholder copy for a fictional venue.
