# Systems studies and project images

## Scope

The systems page uses detailed SVG models built with the Anatomy geometry kit where it fits. These are explanatory mechanism studies, not manufacturing CAD or exact commercial product replicas. The Tornado diagram specifically illustrates the Pioneer MagLev version; the gearbox is an illustrative fixed-ring stage rather than a complete swerve module. User-requested layout: diagram on the left, bold name and one sentence on the right; stack these on phones.

## Models and parts

- **ATmega128:** 64 package leads, body and engraved lid, pin-one marker, eight PORTB indicator LEDs and resistors, 14 passive parts, two headers, board, feet, fasteners, and routed output traces. Each bit switch maps to its corresponding LED. Clock +1 increments the byte, wrapping after 255. This is a register-output study, not an AVR emulator or a PCB netlist.
- **Cube:** 26 movable cubelets with colored sticker panels, an exposed conceptual MagLev core, base, feet, and screws. Any of six face layers accepts quarter, half, or three-quarter turns in either direction. Scramble sequences and view-angle rotation are available; turns ease into the new positions. The diagram illustrates the Pioneer MagLev concept, not exact internal CAD.
- **Chronograph:** a true top-down view of the bracelet, lugs, case, pushers, dial, and three counters. The movement view exposes an illustrative 46/28/18-tooth gear train, coiled mainspring, balance and hairspring, pallet, escape wheel, jewels, bridges, column wheel, and clutch. The meshed wheels use their tooth-count ratios. Balance frequency is 4 Hz, with eight half-tooth escape steps per simulated second. The movement can run while the stopwatch clutch is disengaged; reset is disabled while the stopwatch runs. Time scaling and manual stepping share a simulation clock that pauses offscreen. Zoom and part inspection expose small details.
- **Planetary gearbox:** a top-down view of the casing, 54-tooth internal ring, 18-tooth sun, three 18-tooth planets, carrier arms, bearing races and balls, relief holes, fasteners, and a bearing bridge that slides aside. Ring-locked mode gives 4:1 reduction; carrier-locked mode reverses the ring at one-third sun speed; sun-locked mode gives carrier speed at three-quarters ring speed. All signed readouts and gear transforms derive from the same Willis-equation model. Tooth profiles are diagrammatic, not production involutes. The housing, zoom, direction, rate, and highlighted component are independently controllable.
- **PID controller:** closed-loop target, controller, motor, and encoder diagram with adjustable setpoint and proportional, integral, and derivative gains. A second-order response model updates the animated output and live error plot; it is an explanatory model, not a motor simulator.
- **Kalman filter:** a detailed tracking rig with a wheeled target carriage, optical sensor gantry, state-estimator instrument, and a second carriage for the filtered output. Adjustable process and measurement noise feed a one-dimensional constant-velocity model. The live plot shows the true path, noisy observations, filtered estimate, and uncertainty band; the instrument displays its predicted position and Kalman gain.

The GPU retains the existing interactive Anatomy study. PID and Kalman studies replace the former train and rocket engine studies on the page.

## Technical references

- [Microchip ATmega128](https://www.microchip.com/en-us/product/atmega128) and [datasheet](https://ww1.microchip.com/downloads/en/DeviceDoc/doc2467.pdf).
- [Princeton: undirected graphs](https://algs4.cs.princeton.edu/41graph/) and [minimum spanning trees](https://algs4.cs.princeton.edu/43mst/).
- [SpeedCubeShop: Tornado V3 versions](https://ca.speedcubeshop.com/a/blog/x-man-tornado-v3-which-one-should-you-buy).
- [Seiko chronograph instructions](https://www.seikowatches.com/instructions/html/SEIKO_8R46_8R48_EN/BONDSYbeydwwtz).
- [KHK internal and planetary gears](https://www.khkgears.us/media/1015/03-internal.pdf).

## Image provenance

Captured 20 October 2026; static images avoid third-party embeds and keep project previews available when demos go offline.

| Project | Image source |
| --- | --- |
| 67 detector | Two photographs supplied by Advay; original laptop photo and TOK presentation photo |
| Wrapped | Actual HTML template from `advayc/wrapped/cmd/imsgwrap/main.go`, rendered with explicitly labeled synthetic sample data; no Messages database accessed |
| Seva Eats | Live onboarding at `https://sevaeats.vercel.app/`, mobile viewport |
| GFSS Calendar | Live calendar at `https://clubs.advay.ca/calendar` |
| Sitemaker | Live upload page at `https://sitemaker.advay.ca/` |
| Nums | Live documentation at `https://docs.advay.ca/` |
| Spy | Official screenshots from `advayc/spy/assets/demos/iphone/demo1.png`, `demo2.png`, `demo3.png` |
| GQ Planets | Existing corresponding project screenshot retained |
| MiWay | Live dashboard at `https://miway.advay.ca/` |

The cube’s six face turns update cubie positions and sticker normals; each face accepts quarter, half, or three-quarter turns, and cubie motion eases into its new position. The cube renders as a small geometry model rather than exact engineering CAD.

The 1200 × 630 social preview is rendered from site typography, charcoal background and the existing portrait. The Sitemaker walkthrough GIF is converted from the linked original project demo video. No AI-generated project demos were used.

Movement reference: [Seiko column wheel and vertical clutch](https://www.seikowatches.com/se-en/products/prospex/8R).
