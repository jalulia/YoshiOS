# YoshiOS — Information Architecture v2

## System Overview

YoshiOS is an in-vehicle computing interface for a 1983 VW Vanagon Westfalia, rendered on a salvaged Magnavox Videowriter 350 amber monochrome CRT (832×300 px, 1-bit, 60 Hz).

**Display constraints:**
- 832 × 300 pixels, 1-bit (pixel on or off)
- Amber phosphor on black (~#D4A017 on #1A1A0A)
- No grayscale — all elements are line art, solid fills, or dither patterns
- Wide aspect ratio (~2.77:1)

**Input:** Physical controls only (no touch, no mouse). Teensy 4.1 USB-HID.

---

## Global UI Conventions

### Units & Sign Conventions
| Measurement | Display format | Example | Notes |
|-------------|---------------|---------|-------|
| Battery charge | % | `75%` | Always positive |
| Charge capacity | Ah | `23 / 34 Ah` | Current / total |
| Solar input | +W | `+240 W` | Always positive, explicit + sign |
| Load draw | −W | `−144 W` | Always negative, explicit − sign |
| Combined line | W / W | `+240 W / −144 W` | Solar then load |
| Time remaining | hr | `12.2 hr` | Estimated from SmartShunt |
| Oil level | L + % | `3.2 L • 48%` | Liters (uppercase L), bullet separator |
| Temperature | °F | `72°F` | Fahrenheit for US, always with unit |
| Humidity | % | `54%` | Relative humidity |
| Pitch / Roll | ° | `−4.2°` / `6.9°` | Signed, one decimal |
| Heading | Cardinal + ° | `N 004°` | Cardinal letter then 3-digit bearing |
| Track time | m:ss | `0:32 / 2:45` | Elapsed / duration |
| Volume | 0–100 | `28` | Unitless integer |
| Speed | mph | `34 mph` | For map HUD only |

### Glance Hierarchy (Dashboard)
The dashboard is optimized for instant comprehension at a glance while driving.

**Tier 1 — "See in <1 second" (large, prime real estate)**
- Battery % (bar gauge, always visible)
- Solar % (bar gauge, always visible)
- Heading / compass (center, always animating)
- Ambient temp (on van side illustration)
- Current track (bottom strip — music is ambient awareness)

**Tier 2 — "Read in 2–3 seconds" (medium, clear but not dominant)**
- Charge Ah
- Line / Load W
- Pitch / Roll angles
- Track progress

**Tier 3 — "Check deliberately" (smaller, secondary position)**
- Oil level + %
- Engine temp + humidity
- Volume level
- Time / date (header, peripheral)

### Typography Scale
| Tier | Font size (at 832×300) | Use |
|------|----------------------|-----|
| Display | 14–16 px | "YoshiOS" logotype only |
| Heading | 11–12 px | Section labels, time/date, large readouts |
| Body | 9–10 px | Primary data values, track info |
| Caption | 7–8 px | Units, labels, secondary values |
| Micro | 5–6 px | Map labels, status indicators |

---

## System States

The system has states independent of which screen is active. These affect what the UI can display and how it handles missing data.

### Boot Sequence
```
POWER ON
  │
  ▼
┌─────────────────┐
│   CRT WARMING   │  RP2040 sends sync, CRT raster stabilizes
│   (1–3 sec)     │  Screen: blank amber glow
└────────┬────────┘
         ▼
┌─────────────────┐
│  YOSHIOS BOOT   │  RP2040 displays static splash:
│   (while PC     │  "YoshiOS" logotype + "Initializing..."
│    starts up)   │  Stays until PC heartbeat arrives
└────────┬────────┘
         ▼
┌─────────────────┐
│  PC CONNECTED   │  USB heartbeat received from PC
│  LOADING DATA   │  Dashboard layout appears with "--" placeholders
│                 │  Subsystems connect one by one (see below)
└────────┬────────┘
         ▼
┌─────────────────┐
│    RUNNING      │  All available data sources active
│   (normal)      │  Dashboard fully populated
└─────────────────┘
```

### Subsystem Connection States
Each data source has its own state, displayed independently:

| Subsystem | Class | States | Visual indicator |
|-----------|-------|--------|-----------------|
| **PC** | SYS | Disconnected / Booting / Running | RGB LED (off / blink / solid). On-screen: boot splash until connected |
| **Victron SmartShunt** | PWR | Disconnected / Connected | If disconnected: battery/solar area shows `—` with "NO DATA" label; bar gauges empty with dashed outline |
| **GPS** | GPS | No fix / Acquiring / Locked | Map screen: "ACQUIRING GPS..." or "NO GPS" overlay. Dashboard compass: `—°` and static needle. Status LED |
| **Sensors (IMU, oil, temp)** | SENS | Offline / Online | Affected values show `—` with sensor name dimmed. Van illustrations freeze at 0° pitch/roll |
| **Spotify / Audio** | AUD | No network / Unauthenticated / Connected / Playing / Paused | Bottom strip: source shows "OFFLINE" or "NO AUTH". Track area shows "No connection" |
| **WiFi** | NET | Disconnected / Connected | Status LED. Affects Spotify and GPS (if using phone hotspot) |

### "No Data" Display Rules (see also GUC-300/310)
1. **Never show stale data without indication.** STALE_SOFT: show last value + `!` marker. STALE_HARD: show `—` (em dash) and dim label.
2. **Use `—` (em dash) for missing numeric values** (GUC-310.1), never `0` or blank.
3. **Dim (use thinner stroke or dither) the container** for any widget with no data — don't hide it. Layout shall never reflow (GUC-500.1).
4. **Aggregate status:** if ≥2 subsystems are down, show a brief alert bar at top: `⚠ PWR + GPS OFFLINE`

### Screen Blanked State
- Toggle via physical "Screen on/off" control
- CRT beam fully off (BLANK pin driven low via Teensy)
- RP2040 continues rendering; PC continues running
- Audio continues
- Un-blanking restores current screen instantly (no re-boot)
- Optional: auto-blank after configurable timeout (e.g., 30 min parked)

---

## Screens

### 1. Dashboard (Home)
The default view. Always returns here after idle timeout or explicit navigation.

**Layout zones (left to right):**

| Zone | Content | Glance Tier | Data Source |
|------|---------|-------------|-------------|
| Top-left header | "YoshiOS" logotype | — | Static |
| Top-right header | Time & date | 3 | System clock |
| Left column — Power | Battery + solar bar gauges with % labels | **1** | Victron SmartShunt |
| Left column — Metrics | Charge (Ah), Line/Load (W) | 2 | Victron |
| Left column — Environment | Oil (L + %), Temp (°F + humidity %) | 3 | Custom sensors |
| Center — Rear view | Van rear illustration + compass/heading + roll angle + ground line | **1** (heading) / 2 (roll) | IMU + magnetometer |
| Right — Side view | Van side illustration + ambient temp + pitch angle + ground line | **1** (temp) / 2 (pitch) | IMU + ambient sensor |
| Bottom strip — Audio | Source, Artist, Track, Waveform, Progress, Volume | **1** (track) / 3 (volume) | Spotify API + system audio |

**Dynamic elements:**
- Bar gauges animate segment by segment on value change
- Van illustrations tilt with pitch/roll (pre-rendered sprite frames: 5–7 per axis)
- Ground line (dashed) tilts with the van
- Compass needle rotates smoothly
- Waveform: live audio amplitude envelope, redrawn each frame
- Progress bar fills over track duration
- All numeric values update in place (no layout reflow)

### 2. Map (Navigation)
Full-screen map with minimal HUD overlay.

**Map rendering:**
- MapLibre GL JS on PC with custom "YoshiOS Amber" style
- Vector tiles from OpenStreetMap (loaded via phone hotspot)
- Rendered to offscreen canvas → threshold to 1-bit → stream to CRT
- Style: roads as 1–2px amber lines, labels in pixel font, buildings as outlines only at high zoom, water as empty black, no fills/gradients

**HUD overlay (always on top of map):**

| Zone | Content |
|------|---------|
| Top bar | Current street name / next turn instruction + distance |
| Bottom-left | Speed (mph) |
| Bottom-center | ETA, distance remaining |
| Bottom-right | Compass heading |
| Top-right corner | Zoom level indicator (e.g., `Z14`) |
| Top-right corner | Auto/Manual pan indicator |

**Map interaction contract:**

| State | Entry | Behavior | Indicator | Exit |
|-------|-------|----------|-----------|------|
| **Auto-center** (default) | Enter map screen; timeout from manual | Map tracks GPS, heading-up | Small `◎` icon, solid | User pans |
| **Manual pan** | User presses pan button(s) | Map stops following GPS; user pans with directional controls | `◎` icon blinks + `MANUAL` label | 10-second idle timeout → auto-center. Or HOME/explicit re-center button |
| **Zoom** | User rotates encoder (when on map screen) | Zoom in/out. If in auto-center, stays centered. If manual, zooms on current view center | Zoom level number updates briefly (e.g., `Z14 → Z15` flash) | Immediate (zoom is instant) |
| **No GPS** | GPS subsystem state = no fix | Map shows last known position (if any) with "NO GPS" overlay. If no position ever, shows "ACQUIRING GPS..." full-screen | `NO GPS` flashing in top bar | GPS fix acquired |

**Routing / directions (future):**
- Turn-by-turn via OSRM or Valhalla on PC
- Route line drawn as thicker amber line on map
- Next instruction shown in top bar: `→ LEFT on Church Ave • 0.2 mi`
- Destination entry: from phone (share to PC via ADB, web interface, or companion app) — not from CRT controls

### 3. Music
Expanded audio view. Not a Spotify clone — a readout of what's playing, with clear feedback for physical control actions.

**Layout:**

| Zone | Content |
|------|---------|
| Top | "YoshiOS" + time (persistent header) |
| Center-left | Large waveform visualization |
| Center-right | Artist, Track, Album (larger text than dashboard) |
| Below track info | Source indicator |
| Below source | Play state (▶ PLAYING / ❚❚ PAUSED) |
| Bottom | Wide progress bar + elapsed/duration |
| Bottom-left | Volume level + bar |
| Bottom | Source selector strip (radio, cass, BT1, BT2, AUX, Spotify) — active source highlighted |

**Control feedback:**
| Action | Visual response | Duration |
|--------|----------------|----------|
| Volume change | Volume number briefly scales up 1.5×, then settles back | 400ms ease-out |
| Source switch | New source label flashes inverted (amber bg, dark text) at center screen, then settles into source strip | 600ms |
| Play/Pause | State icon swaps + brief flash | 300ms |
| Prev/Next | Track name briefly scrolls out left/right, new name scrolls in from opposite side | 500ms |

### 4. Diagnostics / Settings (Future — low priority)
- System health: PC temp, uptime, WiFi signal, GPS satellite count
- Victron detailed: cell voltages, charge history graph
- Sensor raw values (for debugging)
- CRT brightness calibration pattern
- About / version info

---

## Data Model

### Victron SmartShunt (via VE.Direct USB adapter)
| Field | Unit | Display | Update rate | Protocol |
|-------|------|---------|-------------|----------|
| State of charge | % | `75%` | 1 Hz | VE.Direct |
| Battery voltage | V | `12.8 V` (diag only) | 1 Hz | VE.Direct |
| Battery current | A | (used for load calc) | 1 Hz | VE.Direct |
| Consumed Ah | Ah | `23 / 34 Ah` | 1 Hz | VE.Direct |
| Time remaining | hr | `12.2 hr` | ~0.1 Hz | VE.Direct |
| Battery temp | °F | (if temp sensor attached) | ~0.1 Hz | VE.Direct |

### Solar (via Victron MPPT or calculated from SmartShunt)
| Field | Unit | Display | Update rate |
|-------|------|---------|-------------|
| Solar input power | W | `+240 W` | 1 Hz |
| Load power | W | `−144 W` | 1 Hz |

### Custom Sensors (via sensor MCU → USB serial)
| Field | Unit | Display | Update rate | Sensor |
|-------|------|---------|-------------|--------|
| Oil level | L + % | `3.2 L • 48%` | 0.2 Hz | Capacitive level |
| Coolant temp | °F | `102°F` | 0.5 Hz | NTC thermistor |
| Ambient temp | °F | `72°F` | 0.2 Hz | DHT22 |
| Humidity | % | `54%` | 0.2 Hz | DHT22 |
| Pitch | ° | `−4.2°` | 10–20 Hz | IMU (BNO055) |
| Roll | ° | `6.9°` | 10–20 Hz | IMU |
| Heading | cardinal + ° | `N 004°` | 5 Hz | Magnetometer |

### Audio State (from PC)
| Field | Source | Display | Update rate |
|-------|--------|---------|-------------|
| Current source | Teensy HID state | `Spotify` | On change |
| Artist | Spotify API / D-Bus | `Spiral` | On track change |
| Track title | Spotify API / D-Bus | `The Vernon Spring` | On track change |
| Track position | Spotify API | `0:32` | 1 Hz |
| Track duration | Spotify API | `2:45` | On track change |
| Volume | System mixer | `28` | On change |
| Play/pause | Spotify API | ▶ / ❚❚ | On change |
| Waveform | FFT from audio loopback | (visual) | 10–20 Hz |

### System
| Field | Source | Display | Update rate |
|-------|--------|---------|-------------|
| Time | System clock (NTP) | `10:37` | 1 Hz |
| Date | System clock | `August 23, 2025` | On day change |
| GPS position | gpsd | (lat/lon for map) | 1 Hz |
| GPS fix | gpsd | Locked / Acquiring / None | On change |
| WiFi | NetworkManager | Connected / None | On change |
| PC state | Local heartbeat | Running / Booting / Off | On change |

---

## State Machine

### Screen Navigation
```
                    ┌──────────────┐
        ┌──────────►│  DASHBOARD   │◄──────────┐
        │           │   (Home)     │           │
        │           └──────┬───────┘           │
        │                  │                   │
        │          NAV btn │          MUSIC btn│
        │                  ▼                   │
        │           ┌──────────────┐           │
        │     ┌─────│     MAP      │─────┐     │
        │     │     │ (Navigation) │     │     │
        │     │     └──────────────┘     │     │
        │  HOME btn                  MUSIC btn │
        │     │                          │     │
        │     ▼                          ▼     │
        │  ┌──────────────┐    ┌──────────────┐│
        └──│   DASHBOARD  │    │    MUSIC     │┘
           └──────────────┘    └──────────────┘
                                       │
                                   HOME btn
                                       │
                                       ▼
                               ┌──────────────┐
                               │  DASHBOARD   │
                               └──────────────┘
```

**Navigation rules:**
- Three dedicated buttons: HOME, NAV, MUSIC → direct access, no cycling
- HOME always returns to Dashboard
- Idle timeout (configurable, default 5 min) returns to Dashboard
- Screen transitions: instant cut with brief mode label flash (600ms)

### Global Controls (active in ALL screen states)
- Volume encoder: system volume ± / press = mute
- Play/Pause, Prev/Next: Spotify transport
- Source select (6 buttons): switch audio source
- AC controls: all 6 (on/off, mode, temp ±, fan ±)
- Screen on/off + brightness
- PC power
- Cabin lights

### Screen-Specific Controls
| Control | Screen | Action |
|---------|--------|--------|
| Encoder rotate | Map | Zoom in/out |
| D-pad / pan buttons | Map | Manual pan (with 10s auto-center timeout) |

---

## Control Feedback Spec

### Dashboard
- Value changes: number updates in place, no animation (clean swap)
- Bar gauges: segments fill/drain one at a time at ~100ms per segment
- Subsystem goes offline: affected area dims + `--` values appear over 200ms

### Map
- Zoom change: zoom level indicator (`Z14`) flashes for 1s at top-right
- Pan mode change: `◎ AUTO` ↔ `◎ MANUAL` indicator transitions
- GPS lost: `NO GPS` bar fades in at top, pulsing at 2 Hz
- Route instruction change: text slides out left, new text slides in from right

### Music
- Volume change: volume number scales to 1.5× over 200ms, then eases back to 1× over 200ms
- Source switch: inverted flash (amber bg / dark text) of new source name at screen center for 600ms
- Play/Pause: icon swap + brief 200ms invert flash
- Prev/Next: track text slides out, new track slides in (500ms)

### All Screens
- Mode switch: centered label flash (`HOME` / `NAV` / `MUSIC`) for 600ms with border
- Subsystem alert: if ≥2 subsystems offline, top alert bar: `⚠ VICTRON + GPS OFFLINE` for 3s, then collapse to small `⚠` icon in header

---

---

## Global UI Contracts (GUC)

### GUC-001 Priority Ladder
- **GUC-001.1 (MUST)** UI elements obey this priority order:
  1. P0 Safety / Critical Alerts
  2. P1 Navigation Instruction Overlay
  3. P2 User Mode Screen (HOME / NAV / MUSIC)
  4. P3 Passive Status / Telemetry
- **GUC-001.2 (MUST)** Higher priority elements yield lower ones without user action.
- **GUC-001.3 (MUST)** P0 alerts override all screens, including NAV overlays.

### GUC-010 P0 Safety & Critical Alerts
- **GUC-010.1 (MUST)** P0 alerts visible from any mode.
- **GUC-010.2 (MUST)** P0 alerts shall not scroll text or rely on animation for readability.
- **GUC-010.3 (MUST)** P0 alerts remain visible while triggering condition is active.
- **GUC-010.4 (SHOULD)** P0 alerts require explicit dismissal only if condition has cleared and alert is informational.
- **GUC-010.5 (MUST)** P0 alert layout uses large type and simple iconography suitable for 1-bit display.

### GUC-020 P1 Navigation Overlay
- **GUC-020.1 (MUST)** NAV instruction overlay eligible on any mode screen.
- **GUC-020.2 (MUST)** NAV overlay yields immediately to P0 alerts.
- **GUC-020.3 (SHOULD)** NAV overlay shall not fully obscure critical HOME values unless layout reserves a protected NAV region.
- **GUC-020.4 (MUST)** NAV instruction text shall not scroll.

### GUC-030 Mode Context (P2)
- **GUC-030.1 (MUST)** Mode directly addressable via HOME, NAV, MUSIC inputs.
- **GUC-030.2 (MUST)** Mode switching is not cyclic; each button jumps directly.
- **GUC-030.3 (MUST)** Mode change presents brief label flash (~500ms), then normal state.

### GUC-040 Passive Telemetry (P3)
- **GUC-040.1 (MUST)** Passive telemetry shall not force layout reflow.
- **GUC-040.2 (MAY)** Passive telemetry may be suppressed when higher priority overlays need space.

### GUC-100 Global Controls Availability
- **GUC-100.1 (MUST)** Available from all modes: Volume, Brightness, Screen on/off, AC on/off.
- **GUC-100.2 (MUST)** Global controls shall not require leaving current mode.

### GUC-110 Input Semantics
- **GUC-110.1 (SHOULD)** Tap is primary action.
- **GUC-110.2 (SHOULD)** Hold reserved for secondary actions, used sparingly.
- **GUC-110.3 (MUST)** Hold-activated states display clear on-screen indicator.

### GUC-120 Feedback Requirement
- **GUC-120.1 (MUST)** Any state-changing input produces visible feedback within 100ms.
- **GUC-120.2 (MUST)** Global control changes produce brief feedback (toast/enlarged readout), duration ≤ 1s.
- **GUC-120.3 (MUST)** Feedback elements shall not scroll text.

### GUC-200 Idle Timeout
- **GUC-200.1 (MUST)** System returns to HOME after IDLE_TIMEOUT with no user input.
- **GUC-200.2 (MUST)** Default IDLE_TIMEOUT = 5 minutes.

### GUC-210 Activity Definition
- **GUC-210.1 (MUST)** Inputs that reset idle timer: mode buttons, encoder, volume, brightness, screen toggle, AC toggle.
- **GUC-210.2 (MUST)** Backend events (GPS, song change, telemetry) do NOT reset idle timer.

### GUC-220 Return Behavior
- **GUC-220.1 (MUST)** Return to HOME is immediate (no multi-step animation).
- **GUC-220.2 (SHOULD)** Temporary interaction states (map pan) do not block idle return unless explicitly safety-critical.

### GUC-300 Freshness Model
- **GUC-300.1 (MUST)** Each data stream defines STALE_SOFT (show last value + marker) and STALE_HARD (show unknown marker) thresholds.
- **GUC-300.2 (SHOULD)** Defaults:
  - Telemetry: STALE_SOFT = 2s, STALE_HARD = 10s
  - GPS fix: STALE_SOFT = 2s, STALE_HARD = 5s
  - Spotify state: STALE_SOFT = 10s, STALE_HARD = 30s

### GUC-310 Unknown Value Rules
- **GUC-310.1 (MUST)** Unknown numeric values render as `—` (em dash), never `0` or blank.
- **GUC-310.2 (MUST)** Discrete missing states render explicit labels: `NO FIX`, `OFFLINE`, `DISCONNECTED`.
- **GUC-310.3 (SHOULD)** Stale-soft shows last known value with stale indicator (small `!`).

### GUC-320 Subsystem Indicators
- **GUC-320.1 (SHOULD)** Missing/stale states indicate subsystem class: GPS, PWR, NET, AUD.
- **GUC-320.2 (MUST)** Subsystem indicators do not require color to communicate status.

### GUC-400 Text Scrolling Policy
- **GUC-400.1 (MUST)** P0 alerts and NAV text never scroll.
- **GUC-400.2 (MAY)** MUSIC metadata (track/artist) may scroll.

### GUC-410 Overflow Strategy
- **GUC-410.1 (MUST)** Default overflow: truncate, no layout reflow.
- **GUC-410.2 (SHOULD)** If scrolling enabled: start delay ≈ 700ms, slow readable speed, halt on input.

### GUC-420 Motion Budget
- **GUC-420.1 (MUST)** No continuous attention-demanding animation.
- **GUC-420.2 (MAY)** Allowed: subtle waveform, blink/flash for alerts, mode label flash.

### GUC-500 No Reflow
- **GUC-500.1 (MUST)** Live values shall not cause component reflow.
- **GUC-500.2 (MUST)** Numeric fields reserve fixed-width regions for max digits.

### GUC-510 CRT Safe Margins
- **GUC-510.1 (MUST)** Critical text inside CRT overscan safe area.
- **GUC-510.2 (SHOULD)** Safe margins consistent across all modes.

### GUC-600 Alert Audio Respect
- **GUC-600.1 (MUST)** Alert sounds respect global volume.
- **GUC-600.2 (MAY)** P0 alerts may duck music temporarily, shall not permanently change user volume.

### GUC-610 Mute Behavior
- **GUC-610.1 (MUST)** Mute silences non-critical sounds and music.
- **GUC-610.2 (MUST)** Mute does not suppress visual P0 alerts.

### GUC-700 Boot Default
- **GUC-700.1 (MUST)** On boot, default screen is HOME (Dashboard).

### GUC-710 Restore Policy
- **GUC-710.1 (MAY)** System may restore last mode if it still returns to HOME on idle.
- **GUC-710.2 (MUST)** System shall not restore into transient interaction states.
- **GUC-710.3 (MAY)** Music playback state may be restored if backend supports it.

---

## Implementation Priority

1. **Dashboard screen** — layout with glance hierarchy, fake data, no-data states
2. **System state machine** — boot sequence, subsystem status, keyboard toggles for testing
3. **Music screen** — expanded audio, control feedback animations
4. **Control feedback** — volume scale, source flash, transport animations
5. **Map screen** — HUD overlay + interaction contract (placeholder map)
6. **MapLibre integration** — custom amber style, 1-bit pipeline
7. **Live data binding** — Victron VE.Direct, sensors, Spotify, GPS
8. **CRT output pipeline** — 1-bit threshold + RP2040 streaming (hardware team)
