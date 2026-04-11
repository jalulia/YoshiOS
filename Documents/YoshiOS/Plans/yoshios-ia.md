# YoshiOS — Information Architecture

## System Overview

YoshiOS is an in-vehicle computing interface for a 1983 VW Vanagon Westfalia, rendered on a salvaged Magnavox Videowriter 350 amber monochrome CRT (832×300 px, 1-bit, 60 Hz).

**Display constraints:**
- 832 × 300 pixels, 1-bit (pixel on or off)
- Amber phosphor on black (~#D4A017 on #1A1A0A)
- No grayscale — all elements are line art, solid fills, or dither patterns
- Wide aspect ratio (~2.77:1)

**Input:** Physical controls only (no touch, no mouse). Teensy 4.1 USB-HID.

---

## Screens

### 1. Dashboard (Home)
The default view. Always returns here after idle timeout or explicit navigation.

**Layout zones (left to right):**

| Zone | Content | Data Source |
|------|---------|-------------|
| Top-left header | "YoshiOS" logotype | Static |
| Top-right header | Time & date | System clock |
| Left column — Power | Battery icon, solar icon, bar gauges (battery %, solar %) | Victron SmartShunt via VE.Direct |
| Left column — Metrics | Charge (Ah), Line/Load (W), Oil (% + liters), Temp (°F + humidity %) | Victron + custom sensors |
| Center — Rear view | Van rear illustration with compass/heading overlay, roll angle + ground line | IMU (accelerometer/gyro) + magnetometer |
| Right — Side view | Van side illustration with thermometer overlay, pitch angle + ground line | IMU + ambient temp sensor |
| Bottom-left — Audio | Source label, Artist, Track | Spotify API / PC audio state |
| Bottom-right — Audio | Waveform visualization, progress bar, time, volume icon + level | Spotify API + audio stream |

**Dynamic elements:**
- Bar gauges animate on value change (segment by segment)
- Van illustrations tilt with pitch/roll data (pre-rendered sprite frames in firmware, or SVG transform on PC)
- Ground line (dashed) tilts with the van
- Compass needle rotates
- Waveform is a live audio visualization (FFT or amplitude envelope)
- Progress bar fills over track duration
- All numeric values update in place

### 2. Map (Navigation)
Full-screen map with minimal HUD overlay.

**Layout:**

| Zone | Content |
|------|---------|
| Full background | MapLibre vector map rendered in "YoshiOS amber line art" style |
| Top bar (transparent overlay) | Current street / next turn instruction |
| Bottom bar (transparent overlay) | ETA, distance remaining, speed |
| Corner indicators | Compass heading, GPS signal indicator |

**Map style notes:**
- Roads: 1-2px amber lines on black, scaled by road class
- Labels: pixel font, amber, placed by MapLibre's label engine
- Buildings: outlines only (no fill) at high zoom
- Water: black (empty) — differentiated by absence
- POIs: small amber icons at high zoom only
- Current position: blinking amber dot or small arrow

**Interaction:**
- Zoom in/out via dedicated buttons or encoder
- Pan follows GPS by default (auto-center)
- Manual pan mode via button hold (returns to auto-center after timeout)

### 3. Music
Expanded audio view — not a Spotify clone, just a larger display of what's playing with clearer controls feedback.

**Layout:**

| Zone | Content |
|------|---------|
| Top | "YoshiOS" + time (persistent header) |
| Center-left | Large waveform visualization |
| Center-right | Artist, Track, Album (if available) — larger text than dashboard |
| Bottom-left | Source indicator (Spotify / BT / AUX / Radio / Cassette) |
| Bottom-center | Progress bar (wider than dashboard view) |
| Bottom-right | Volume level, play state icon |

**Interaction:**
- Transport controls (play/pause, prev/next) have immediate visual feedback
- Volume encoder changes are reflected in the volume indicator
- Source switching shows brief transition animation

### 4. Diagnostics / Settings (Future)
Low priority. Could show:
- System health (PC temp, uptime, WiFi signal, GPS satellite count)
- Victron detailed view (cell voltages, charge history)
- CRT brightness calibration
- Sensor raw values for debugging

---

## Data Model

### Victron SmartShunt (via VE.Direct USB adapter)
| Field | Unit | Update rate | Protocol |
|-------|------|-------------|----------|
| Battery voltage | V | 1 Hz | VE.Direct serial |
| Battery current | A | 1 Hz | VE.Direct serial |
| State of charge | % | 1 Hz | VE.Direct serial |
| Consumed Ah | Ah | 1 Hz | VE.Direct serial |
| Time remaining | hours | ~0.1 Hz | VE.Direct serial |
| Battery temp | °C | ~0.1 Hz | VE.Direct serial (w/ sensor) |

### Solar (via Victron MPPT or calculated)
| Field | Unit | Update rate |
|-------|------|-------------|
| Solar input power | W | 1 Hz |
| Load power | W | 1 Hz |

### Custom Sensors (via sensor MCU → USB serial or CAN)
| Field | Unit | Update rate | Sensor type |
|-------|------|-------------|-------------|
| Oil level | liters + % | 0.2 Hz | Capacitive/resistive level sensor |
| Coolant temp | °F | 0.5 Hz | NTC thermistor or OBD |
| Ambient temp | °F | 0.2 Hz | DHT22 or similar |
| Humidity | % | 0.2 Hz | DHT22 or similar |
| Pitch | degrees | 10-20 Hz | IMU (MPU-6050 / BNO055) |
| Roll | degrees | 10-20 Hz | IMU |
| Heading | degrees / cardinal | 5 Hz | Magnetometer (part of BNO055) |

### Audio State (from PC — Spotify API + system audio)
| Field | Source | Update rate |
|-------|--------|-------------|
| Current source | Teensy HID input select state | On change |
| Artist | Spotify Web API / D-Bus (Linux) | On track change |
| Track title | Spotify Web API / D-Bus | On track change |
| Track position | Spotify API | 1 Hz |
| Track duration | Spotify API | On track change |
| Volume level | System mixer state | On change |
| Play/pause state | Spotify API | On change |
| Audio waveform | FFT from system audio loopback | 10-20 Hz |

### System
| Field | Source | Update rate |
|-------|--------|-------------|
| Time | System clock (NTP-synced via phone hotspot) | 1 Hz |
| Date | System clock | On day change |
| GPS position | USB GPS dongle (gpsd) | 1 Hz |
| GPS fix quality | gpsd | 1 Hz |
| WiFi connected | NetworkManager / equivalent | On change |
| PC uptime / state | Local | On change |

---

## State Machine

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
        │     │                          │     │
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
- Three dedicated mode buttons: HOME, NAV, MUSIC
- HOME always returns to Dashboard
- NAV always goes to Map
- MUSIC always goes to Music
- No cycling — direct access only
- Idle timeout (configurable, e.g. 5 min) returns to Dashboard
- Audio controls (play/pause, prev/next, volume) work in ALL states
- AC controls work in ALL states
- Screen brightness works in ALL states

**Transitions:**
- Screen wipe or instant cut (no fade — we're 1-bit)
- Brief "mode label" flash on transition (e.g. "NAV" appears for 500ms then fades to map)

---

## Physical Controls → UI Action Map

### Always Active (all screens)
| Control | Type | UI Action |
|---------|------|-----------|
| Volume encoder rotate | Rotary encoder | System volume ± |
| Volume encoder press | Momentary | Mute toggle |
| Play / Pause | Momentary | Spotify play/pause |
| Prev / Next | Momentary | Spotify prev/next track |
| Source select (radio, cassette, BT1, BT2, aux, spotify) | Momentary × 6 | Switch audio source; update source indicator |
| AC on/off | Toggle | Toggle AC relay; update status |
| AC mode | Momentary | Cycle AC mode |
| AC temp up/down | Momentary × 2 | Adjust AC target temp |
| AC fan up/down | Momentary × 2 | Adjust fan speed |
| Screen on/off | Toggle | Blank/unblank CRT (PWM BLANK pin) |
| Screen brightness | Potentiometer | Adjust CRT brightness (PWM) |
| PC power | Momentary | Graceful shutdown sequence |
| Cabin lights | Toggle | Toggle cabin light relay |

### Screen-Specific
| Control | Type | Active Screen | Action |
|---------|------|---------------|--------|
| HOME button | Momentary | Map, Music | Return to Dashboard |
| NAV button | Momentary | Dashboard, Music | Switch to Map |
| MUSIC button | Momentary | Dashboard, Map | Switch to Music |
| Encoder rotate | Rotary | Map | Zoom in/out |
| (TBD) D-pad or buttons | Momentary | Map | Manual pan (if desired) |

### Status LEDs (RGB, managed by Teensy)
| LED | States |
|-----|--------|
| PC status | Off = powered down, blinking = booting, solid = running |
| WiFi | Off = disconnected, solid = connected |
| GPS | Off = no fix, blinking = acquiring, solid = locked |
| Audio | Off = muted/off, solid = playing, color = source type |

---

## Typography & Visual System

**Font:** Custom pixel/bitmap font matching the mockup (squared letterforms, monospaced or near-mono, ~8px cap height at native resolution)

**Element vocabulary:**
- Solid 1px lines for illustrations, borders, dividers
- Filled rectangles for bar gauge segments, progress bars
- Dashed lines for ground plane, secondary dividers
- Dot-matrix style numerals for data readouts
- Small pictographic icons (battery, sun, droplet, thermometer, speaker, compass)

**Animation vocabulary (1-bit compatible):**
- Segment-by-segment bar fill/drain
- Frame-by-frame sprite swap (van tilt: 5-7 pre-drawn frames per axis)
- Blinking (on/off toggle at ~2 Hz for alerts)
- Scrolling text (for long track titles)
- Waveform: line graph redrawn each frame
- Progress bar: single pixel advance

**Color (for prototype — maps to amber on hardware):**
- Foreground: #D4A017 (amber)
- Background: #1C1A0E (near-black with warm tint)
- "Dim" elements: could use a dither pattern or thinner stroke weight

---

## Implementation Priority

1. **Dashboard screen** — core layout, fake data, static render
2. **Live data binding** — connect Victron, sensors, Spotify, clock
3. **Music screen** — expanded audio view
4. **Control state machine** — keyboard → screen transitions
5. **Map screen** — MapLibre integration with custom amber style
6. **Animations** — van tilt, waveform, gauge transitions
7. **CRT output pipeline** — 1-bit conversion + RP2040 streaming (hardware team)
