# Airu UI/UX Design

Status: completed for issue #1, phase 2.

Sources:

- `AIRU-DEVELOPMENT-GUIDE.md`
- `docs/planning-architecture.md`

Related artifacts:

- `docs/design-tokens.css`
- `docs/prototype/index.html`

## Scope

This phase defines the initial product experience for Airu before frontend implementation. It covers page inventory, low-fidelity wireframes, high-fidelity screen direction, interactive prototype behavior, design tokens, component specifications, accessibility expectations, and validation criteria.

This is a design handoff. It does not create the production Next.js app.

## Experience Principles

| Principle | Design Decision |
|---|---|
| Map first | The `/map` route is the core workspace. Search and route comparison sit on top of the map instead of replacing it. |
| Fast comparison | Users should understand fastest versus healthiest route within one glance. |
| Health signal with text | AQI and health score use color plus explicit labels so color is never the only signal. |
| Mobile-first | The mobile bottom sheet is the primary pattern. Desktop adapts into side panels. |
| Quiet and practical | The interface uses restrained surfaces, dense information, and clear route metrics. |
| Indonesian-first | User-facing recommendation copy is written in Bahasa Indonesia. |

## Information Architecture

| Page | Route | Priority | Primary Job |
|---|---|---|---|
| Landing | `/` | Must | Introduce Airu and send users into map or login. |
| Login | `/login` | Must | Authenticate with Google or email. |
| Health Profile Setup | `/profile` | Must | Collect conditions, travel mode, family mode, and alert threshold. |
| Map Core | `/map` | Must | Search, analyze, compare, and inspect route alternatives. |
| Result Detail | `/result/:id` | Must | Show saved route details, segment scores, AQI breakdown, and AI recommendation. |
| Alert List | `/alerts` | Should | Review AQI alerts and safety notes. |
| Route History | `/history` | Should | Review previous routes and personal exposure trend. |

## Low-Fidelity Wireframes

### Landing - `/`

```text
+------------------------------------------------+
| Airu                         Login    Open Map |
+------------------------------------------------+
|                                                |
|  Airu                                          |
|  Route planning for cleaner daily movement.    |
|                                                |
|  [Plan route] [Set health profile]             |
|                                                |
|  Full-bleed map preview with colored routes    |
|                                                |
+------------------------------------------------+
|  Fastest route | Healthier route | AQI context |
+------------------------------------------------+
```

### Login - `/login`

```text
+--------------------------------------+
| Airu                                 |
+--------------------------------------+
|                                      |
|  Sign in                             |
|  [Continue with Google]              |
|                                      |
|  Email                               |
|  [____________________]              |
|  Password                            |
|  [____________________]              |
|  [Sign in]                           |
|                                      |
|  Secondary link: Create account      |
+--------------------------------------+
```

### Health Profile Setup - `/profile`

```text
+--------------------------------------+
| Back                            Save |
+--------------------------------------+
| Health profile                       |
|                                      |
| Conditions                           |
| [Asthma] [Sensitive] [Child]         |
| [Pregnant] [Elderly]                 |
|                                      |
| Travel mode                          |
| [Walk] [Bicycle]                     |
|                                      |
| Family mode                          |
| [toggle]                             |
|                                      |
| AQI alert threshold                  |
| [ slider 50..200 ]                   |
+--------------------------------------+
```

### Map Core - `/map`

```text
+--------------------------------------+
| Search origin                        |
| Search destination        [GPS]      |
+--------------------------------------+
|                                      |
|                                      |
|             Google Map               |
|        colored route segments        |
|                                      |
|                                      |
+--------------------------------------+
|  bottom sheet collapsed              |
|  [Search or compare route]           |
+--------------------------------------+
```

Bottom sheet states:

```text
Collapsed: 56px search/action handle.
Mid: 45vh route comparison cards.
Expanded: 85vh segment details, AQI breakdown, AI recommendation, CTA.
```

### Result Detail - `/result/:id`

```text
+--------------------------------------+
| Back                       Share     |
+--------------------------------------+
| Route summary                         |
| Health score 81 | AQI 64 | 23 min    |
|                                      |
| [Map preview with colored route]     |
|                                      |
| AI recommendation                    |
| [Bahasa Indonesia explanation]       |
|                                      |
| Segment list                         |
| 1. Safe      AQI 42                  |
| 2. Caution   AQI 96                  |
| 3. Risky     AQI 154                 |
+--------------------------------------+
```

### Alert List - `/alerts`

```text
+--------------------------------------+
| Alerts                               |
+--------------------------------------+
| AQI near home reached 126            |
| Caution | 08:20                      |
+--------------------------------------+
| AQI near office improved to 68       |
| Moderate | Yesterday                 |
+--------------------------------------+
| Empty state: no active alerts        |
+--------------------------------------+
```

### Route History - `/history`

```text
+--------------------------------------+
| History                         Map  |
+--------------------------------------+
| Exposure summary                     |
| This week: avg AQI 72                |
|                                      |
| Route item                           |
| Home -> Office | 23 min | Score 81  |
|                                      |
| Route item                           |
| Station -> Campus | 18 min | Score 69|
+--------------------------------------+
```

## High-Fidelity Direction

### Visual System

| Area | Direction |
|---|---|
| Background | Warm off-white app background with white surfaces and low-contrast borders. |
| Primary action | Health green button for main commands such as planning a route. |
| Risk states | Green, amber, red, deep red, and dark violet AQI states. Labels are always shown. |
| Map overlays | White panels with 8px radius on compact tools, subtle shadow, and clear focus rings. |
| Typography | Inter, compact scale from 11px to 32px. No viewport-based font scaling. |
| Cards | 8px radius for repeated route, alert, and history items. No nested cards. |

### Mobile Layout

| Page | Layout Rule |
|---|---|
| Landing | Full-bleed route scene in first viewport, Airu as the H1, primary CTA above the fold. |
| Login | Centered form surface, 16px side padding, full-width buttons. |
| Profile | Single-column settings with segmented controls and checkbox chips. |
| Map | Full viewport map with top search panel and bottom sheet. |
| Result | Stacked summary, map preview, AI recommendation, segment list. |
| Alerts | Dense notification list with read/unread state. |
| History | Summary band followed by searchable route list. |

### Desktop Layout

| Page | Layout Rule |
|---|---|
| Landing | Wide route scene with content overlay, next section visible below first viewport. |
| Login | Two-column composition with form and product route preview. |
| Profile | Two-column settings and preview summary. |
| Map | Full viewport map with fixed left search panel and right route detail panel. |
| Result | Map on left, route metrics and details on right. |
| Alerts | List and selected alert detail side by side. |
| History | Filter sidebar, route list, and selected route preview. |

## Interactive Prototype

The static prototype is in `docs/prototype/index.html`.

Prototype coverage:

| Flow | Screens | Interaction |
|---|---|---|
| First visit | Landing -> Login -> Profile -> Map | Top navigation and CTA buttons switch screens. |
| Route search | Map | Destination field, Analyze button, route cards, and bottom sheet states. |
| Route detail | Map -> Result | Route card and detail buttons open result screen. |
| Notifications | Alerts | Alert rows show active and read states. |
| Review history | History -> Result | History rows open the saved result screen. |

Prototype constraints:

- Uses static sample data for Jakarta-style daily commute context.
- Does not call Google Maps, Firebase, Gemini, or Air Quality APIs.
- Uses the same tokens as `docs/design-tokens.css`.

## Design Tokens

Token source of truth for implementation handoff is `docs/design-tokens.css`.

### Color Tokens

| Token | Value | Use |
|---|---|---|
| `--color-healthy` | `#1D9E75` | Good AQI and high health score. |
| `--color-healthy-light` | `#E1F5EE` | Healthy badge background. |
| `--color-caution` | `#BA7517` | Moderate or sensitive-risk AQI. |
| `--color-caution-light` | `#FAEEDA` | Caution badge background. |
| `--color-danger` | `#E24B4A` | Unhealthy AQI. |
| `--color-danger-light` | `#FAEBEB` | Danger badge background. |
| `--color-danger-deep` | `#A32D2D` | Very unhealthy AQI. |
| `--color-hazard` | `#501313` | Hazardous AQI. |
| `--color-brand-primary` | `#1D9E75` | Primary actions. |
| `--color-brand-dark` | `#0F6E56` | Active or pressed primary actions. |
| `--color-bg` | `#F9F9F7` | App background. |
| `--color-surface` | `#FFFFFF` | Panels, cards, forms. |
| `--color-border` | `#E8E6DF` | Dividers and field borders. |
| `--color-text-primary` | `#2C2C2A` | Main text. |
| `--color-text-muted` | `#6B6B66` | Secondary text. |

### Typography Tokens

| Token | Value |
|---|---|
| `--font-sans` | `Inter, ui-sans-serif, system-ui, sans-serif` |
| `--font-size-xs` | `11px` |
| `--font-size-sm` | `13px` |
| `--font-size-md` | `15px` |
| `--font-size-lg` | `18px` |
| `--font-size-xl` | `24px` |
| `--font-size-2xl` | `32px` |

### Spacing and Shape Tokens

| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-full` | `9999px` |

## Component Specification

### Primitives

| Component | Variants | Key States |
|---|---|---|
| Button | primary, secondary, ghost, danger, icon | default, hover, active, focus, disabled, loading |
| Badge | healthy, caution, danger, neutral | default, compact |
| AQIBadge | AQI 0-50, 51-100, 101-150, 151-200, 201-300, 300+ | includes number and label |
| Card | default, selected, interactive | default, hover, focus, selected |
| ProgressBar | health score, AQI risk | value 0-100 with text label |
| BottomSheet | collapsed, mid, expanded | drag, keyboard close, focus trapped when expanded |
| Spinner | small, default | aria-live status text nearby |

### Feature Components

| Component | Purpose | Required Content |
|---|---|---|
| SearchBar | Origin and destination entry. | Origin, destination, GPS action, submit action. |
| RouteCard | Compare route options. | Label, duration, distance, health score, AQI label. |
| RouteCompare | Show fastest and healthiest together. | Two RouteCards and active selected state. |
| HealthScoreBar | Visualize route score. | Numeric score, label, progress indicator. |
| AIRecommendation | Show Gemini text. | Streaming state, final text, fallback error. |
| MapContainer | Render map surface. | Accessible label and loading state. |
| RoutePolyline | Draw route risk segments. | Segment color plus segment metadata. |
| AQIMarker | Highlight AQI hotspots. | AQI number and category label. |
| ConditionSelector | Save user health conditions. | Multi-select chips with selected state. |

## Accessibility Requirements

| Area | Requirement |
|---|---|
| Buttons | Every icon-only button has `aria-label`. |
| Color | AQI and score status always include visible text labels. |
| Focus | Interactive elements use visible focus ring. |
| Bottom sheet | Escape closes expanded sheet, focus remains inside expanded sheet. |
| Map | Map container has an accessible label and non-map route summary nearby. |
| Loading | Route analysis and AI recommendation use `aria-live="polite"`. |
| Forms | Field errors use `aria-describedby`. |
| Touch | Primary tap targets are at least 44px high. |

## Validation

### Stakeholder Review Checklist

| Check | Pass Criteria |
|---|---|
| Core value is clear | Reviewer can explain fastest versus healthiest route without additional context. |
| Route comparison is scannable | Reviewer identifies recommended route in less than 5 seconds. |
| Health labels are understandable | Reviewer understands `Baik`, `Sedang`, and `Berisiko` labels. |
| Bottom sheet states are clear | Reviewer can describe collapsed, mid, and expanded states. |
| Profile settings are complete | Reviewer finds conditions, travel mode, family mode, and AQI threshold. |
| Alert and history pages are useful | Reviewer can find latest AQI alert and reopen a previous route. |

### User Testing Script

Target participants:

- 2 daily pedestrians
- 1 cyclist
- 1 user with air-quality sensitivity such as asthma or allergy

Tasks:

1. Start from the landing screen and open the map.
2. Set a health profile with one condition and an AQI threshold.
3. Search a route from home to office.
4. Pick the healthier route and explain why.
5. Open result details and identify the riskiest segment.
6. Find the latest AQI alert.
7. Reopen a previous route from history.

Success metrics:

| Metric | Target |
|---|---|
| Route comparison comprehension | 4 of 4 participants identify fastest and healthiest route. |
| Health score comprehension | 3 of 4 participants explain why a route is healthier. |
| Task completion | 85% of scripted tasks completed without help. |
| Accessibility issue severity | No blocker issue in keyboard and color-label review. |

## Phase 2 Acceptance

- Low-fidelity wireframes exist for all required pages.
- High-fidelity visual direction and responsive layout rules are defined.
- Interactive prototype exists as a browser-openable HTML file.
- Design tokens are documented in CSS-ready form.
- Component, accessibility, and validation criteria are documented.
