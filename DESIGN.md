---
name: Advay’s personal website
description: A minimal personal portfolio in a centered reading column.
colors:
  paper-gray: "#171717"
  paper-black: "#000000"
  paper-white: "#ffffff"
  paper-cream: "#f4f1ea"
  ink-dark: "#efeeec"
  muted-dark: "#aaa6a2"
  line-gray: "#383735"
  wash-gray: "#252422"
  line-black: "#303030"
  wash-black: "#181818"
  ink-light: "#242321"
  muted-light: "#68635e"
  line-light: "#dcd8d2"
  wash-white: "#f1efec"
  wash-cream: "#e9e5dc"
  accent-dark: "#ff6a42"
  accent-light: "#b83213"
  selection: "#ff3908"
  anatomy-lo-dark: "#72706c"
  anatomy-mid-dark: "#99968f"
  anatomy-hi-dark: "#b4b2ad"
  anatomy-lit-dark: "#f0efeb"
  anatomy-top-dark: "#242422"
  anatomy-shade-0-dark: "#191918"
  anatomy-shade-1-dark: "#1e1e1c"
  anatomy-shade-2-dark: "#222220"
  anatomy-shade-3-dark: "#292927"
  anatomy-lo-light: "#8d8981"
  anatomy-mid-light: "#96928a"
  anatomy-hi-light: "#625f58"
  anatomy-lit-light: "#2c2b28"
  anatomy-top-light: "#eeece6"
  anatomy-shade-0-light: "#bbb7ae"
  anatomy-shade-1-light: "#cdc9c0"
  anatomy-shade-2-light: "#dad7cd"
  anatomy-shade-3-light: "#e6e3da"
typography:
  headline:
    fontFamily: '"Helvetica Neue", Helvetica, ui-sans-serif, sans-serif'
    fontSize: "32px"
    fontWeight: 450
    lineHeight: 1.2
    letterSpacing: "-.035em"
  title:
    fontFamily: '"Helvetica Neue", Helvetica, ui-sans-serif, sans-serif'
    fontSize: "20px"
    fontWeight: 450
    lineHeight: 1.4
    letterSpacing: "-.025em"
  introduction:
    fontFamily: '"Helvetica Neue", Helvetica, ui-sans-serif, sans-serif'
    fontSize: "19px"
    lineHeight: 1.75
    letterSpacing: "-.013em"
  body:
    fontFamily: '"Helvetica Neue", Helvetica, ui-sans-serif, sans-serif'
    fontSize: "16px"
    lineHeight: 1.6
  project-body:
    fontFamily: '"Helvetica Neue", Helvetica, ui-sans-serif, sans-serif'
    fontSize: "17px"
    lineHeight: 1.8
  label:
    fontFamily: '"Helvetica Neue", Helvetica, ui-sans-serif, sans-serif'
    fontSize: "12px"
    fontWeight: 400
rounded:
  small: "3px"
  instrument: "4px"
  control: "5px"
  rail: "20px"
  dialog: "12px"
spacing:
  compact: "8px"
  small: "12px"
  row: "16px"
  medium: "20px"
  inset: "24px"
components:
  command-result:
    rounded: "{rounded.control}"
    padding: "11px 14px"
  appearance-rail:
    rounded: "{rounded.rail}"
    height: "24px"
  instrument-button:
    rounded: "{rounded.instrument}"
    padding: "5px 9px"
  command-dialog:
    rounded: "{rounded.dialog}"
    width: "min(520px, calc(100% - 32px))"
  reading-column:
    padding: "0 24px"
---

# Design System: Advay’s personal website

## Overview

**Creative North Star: "A centered reading column"**

The portfolio is a quiet, personal page built around readable paragraphs, restrained navigation, and existing photographs and project images. Helvetica Neue supplies a consistent voice across headings, writing, and controls. The owner's chosen gray is the default background.

This system describes the implemented home, project index and details, interactive systems gallery, and command center. The timeline implementation is parked for possible future use and is not linked or routed. The archived desktop at `/archive` remains directly available and is also shown in the website history viewer. `/machines` redirects to `/systems`, which presents the ATmega128, a movable cube, chronograph, planetary gearbox, GPU, PID controller, and Kalman filter studies.

**Key Characteristics:**

- A centered column with generous vertical space.
- Neutral backgrounds, subdued secondary text, and small orange accents.
- Flat rows and original imagery instead of decorative containers.
- Compact navigation, a searchable command center, and a shared four-stop appearance slider.

## Colors

A warm neutral palette keeps the writing prominent; orange identifies small interactive details.

### Primary

The dark and light accent tokens supply the name's final dot, link hover, active navigation underline, keyboard focus, and selected command text. The independent selection token colors text selection and the retained drag-selection rectangle.

**The Restrained Accent Rule.** Use orange for interaction and small identifying details, as in the existing links and focus rings.

### Neutral

Gray and black backgrounds share light ink and muted text; white and cream share dark ink and muted text. Black supplies its own line and wash colors. Cream supplies its own wash. Dividers and preview borders use the active line token, while selected controls and preview placeholders use the active wash token. Runtime CSS exposes these roles as `--paper`, `--ink`, `--muted`, `--line`, `--wash`, and `--accent`.

The systems drawings extend the palette with the recorded anatomy tokens: theme-specific neutral faces, outlines, and shading. Orange marks selected graph edges, a watch hand, and other active mechanisms. These drawing tokens belong to the figures, not ordinary page surfaces.

**The Four Backgrounds Rule.** Offer gray, black, white, and cream, retaining gray as the initial background.

## Typography

**Display and Body Font:** Helvetica Neue, with Helvetica and sans-serif fallbacks. The command dialog omits the `ui-sans-serif` fallback but retains the same named face.

The hierarchy is modest and uses sentence-sized headings. Text is predominantly lowercase in the implemented navigation and personal writing; project names retain their supplied capitalization.

### Hierarchy

- **Headline:** Page headings use the headline token, reducing to 28px at the mobile breakpoint.
- **Title:** Section headings use the title token. Project index titles use 19px, reducing to 18px on mobile.
- **Introduction:** Opening paragraphs use the introduction token; mobile uses 17px with 1.8 line height.
- **Body:** General content inherits the body token. Project descriptions use the project-body token; project summaries use 18px with 1.65 line height, reducing to 17px on mobile.
- **Label:** Quiet supporting information uses the label role. Links and commands generally use 14px; experience titles use 15px, details 13px. Footer metadata and project technology lists use 10–12px.

**The One Typeface Rule.** Retain Helvetica Neue throughout the redesigned portfolio and keep font switching out of its controls.

## Layout

The outer column has a maximum width of 728px including 24px padding on each side, leaving 680px of content at full width. Its width contracts fluidly. The standard portfolio breakpoint is 540px. Timeline and systems use a 1120px maximum-width variant and switch composition at 700px.

The header separates the name from two navigation links and uses 57px top and 75px bottom padding; mobile uses 30px and 49px. Major home sections begin after 62–78px of space. The footer begins after 80px on desktop and 62px on mobile, with a thin top divider.

Experience is a three-column row: logo, flexible text, and year range. Dates use 11px muted tabular numerals, reducing to 10px on mobile. Project index rows put text beside an existing preview and arrow. Project rows use a `minmax(0, 1fr)` text column beside a fixed image column. Previews are 260 × 164px on desktop and full-width 16:10 below the text on mobile; the trailing project arrow disappears. Project details retain full-column images at their natural aspect ratio. Phone screenshots are capped at 300px wide; photographs are contained within a 580px maximum height. Supplemental image galleries use auto-fit columns with a 220px minimum and 20px gaps.

Systems use a two-to-one diagram/copy grid with a 50px gap. At 700px and below, the name and sentence appear above the drawing with a 24px gap. Timeline events alternate above and below a horizontal spine in 280px slots on desktop; at the same breakpoint they become a vertical list with a left border and small outlined event dots.

## Elevation & Depth

Page rows remain flat. Thin dividers, borders, and changes in neutral tone establish structure. Link-preview tooltips use the sole small floating-surface shadow (`0 8px 24px #0002`). Isometric studies use shaded SVG geometry to explain physical mechanisms; this depth does not extend to page chrome. The command dialog is distinguished by a dark translucent backdrop (`rgb(0 0 0 / .62)`), with no decorative blur or shadow.

**The Flat Surface Rule.** Use lines and tonal selection states for the portfolio's page and control structure.

## Shapes

Portraits and project images remain rectangular. Experience logos have the small corner radius; keyboard hints use the same radius. Command results use the control radius, instrument buttons use the instrument radius, and the dialog uses the dialog radius. The appearance slider has a pill-shaped rail and circular thumb. Timeline navigation buttons are circular. Focus outlines use a 2px corner radius, 2px stroke, and 5px offset.

## Components

### Navigation and text links

Header links are muted at rest; the current projects link uses ink with an orange underline. Links transition color over 150ms. Underlined prose links have a 5px underline offset and 1px thickness. Small directional icons are SVGs, usually 13–14px.

The compact homepage introduction incorporates the Jane Street archive and six-month streak link directly into the opening prose. Queen’s, Magic Hour, and Jane Street links reveal previews on hover or keyboard focus. The preview is a fixed-position, 260px-wide bordered surface with 14px padding, a 12px description, optional contained image, and the floating-surface shadow. Its position is clamped away from horizontal viewport edges. Escape, blur, scroll, or resize dismisses it; a 150ms mouse-leave delay allows the pointer to enter the preview.

### Experience and project rows

Experience rows retain existing 28px logos with year ranges at the right. The content groups distinguish now from before; Seva Eats appears in before. Project titles also pair with small dates. All nine current projects have sourced images, including the 67 detector exhibition photographs. Project rows use thin top dividers and contained previews; hover scales the preview slightly (1.025 over 220ms). Image provenance is recorded in `docs/systems-and-assets.md`; Wrapped uses its actual template with explicitly labeled synthetic sample data.

### Portrait

The original portrait is 112px square, reducing to 88px on mobile. Its existing ASCII image overlays on hover or keyboard focus with a 180ms opacity transition. A small orange “old site” strip slides into its lower edge on hover or focus. The portrait and footer control open a three-version viewer with an accessible slider, the archived desktop, a supplied advay.ca snapshot, and the current home page.

### Command center and search field

The native dialog is limited to 520px wide and the smaller of 700px or 85dvh high. Its search field has a transparent background, an accent caret, and a bottom divider that becomes accent-colored on focus. Results scroll within the dialog. The selected result uses the wash background and accent text.

The command center opens with the footer trigger or Command/Ctrl K. Search filters destinations; arrow keys change the selected result, Enter opens it, and Escape closes the dialog. Focus returns to the preceding control on close. The shared four-stop appearance slider is the only appearance control.

### Background controls and footer

The native range input has four discrete positions in the order black, gray, cream, white. Its visible label reports the current background, and `aria-valuetext` gives the same name to assistive technology. The footer rail is 142px wide, reducing to 125px on mobile; the command-center version fills available width up to 260px. The 24px rail has a neutral wash, fine border, four small stop markers, and a circular ink thumb with a paper border. The input itself is 32px high. The footer keeps systems access, archive access, the small hit count, contact link, and command trigger together without decorative scenery.

### Systems studies

Seven studies share a diagram-left, bold-name-and-sentence-right presentation: ATmega128, the Tornado cube, chronograph, planetary gearbox, GPU, PID controller, and Kalman filter. Copy titles use 18px at weight 600, reducing to 17px on narrow screens. Descriptions use 14px text and 1.65 line height.

New instrument controls are compact, bordered buttons with a 32px minimum height, small range inputs, and native selects. Hover and pressed states use the active wash, ink, and muted border; disabled buttons have reduced opacity. Readouts use muted 10px tabular numerals. The diagrams use SVG geometry, neutral shading, and restrained active accents. Mechanism assumptions, preserved figures, and image sources are documented in `docs/systems-and-assets.md`.

### Selection and motion

The retained drag-selection box uses a thin selection-colored border and faint fill. Text selection uses the same orange with greater opacity. Reduced-motion preferences remove portfolio and dialog transitions and animations. Keyboard focus remains visible; a skip link provides access to the main content.

## Do's and Don'ts

### Do:

- **Do** keep the centered reading column and Helvetica Neue.
- **Do** preserve the original portrait, experience logos, and supplied project images.
- **Do** use active theme roles for text, dividers, selected states, and focus.
- **Do** preserve keyboard navigation, visible focus, reduced-motion handling, and drag selection.

### Don't:

- **Don't** add mountain scenery, background patterns, or font switching to the redesigned portfolio.
- **Don't** pass generated imagery or unlabeled sample data off as actual project evidence.
- **Don't** promote archive styling or diagram-specific shading into ordinary portfolio page chrome.

### Mechanism inspection

Chronograph and planetary gearbox drawings include an eased closer-look control, selectable mechanism descriptions, and manual stepping. The chronograph can expose its movement and run the stopwatch clutch separately. The gearbox has three kinematic configurations and a liftable bearing bridge. PID and Kalman studies expose live model parameters and animated response plots. Continuous motion pauses offscreen and under reduced-motion preferences; manual controls remain available.

Project previews use a centered crop at 260 × 164px on desktop, with full-width 16:10 previews beneath the text on mobile. Detail-page images keep their natural aspect ratio and do not use letterbox bars. Hover and keyboard focus tint the project title; images gently enlarge and reveal their zoom affordance.

The site history viewer opens from the portrait, footer, or command center. Its slider selects one of three site versions. The version-two copy is a static snapshot of the supplied advay.ca content, and the third version arrives with a brief horizontal reveal. Reduced-motion preferences remove that spatial entrance.
