# Google Flow & Cinematic Motion Master Prompts Guide
### Elite Visual Assets, 3D Hero Loops & Sound Design Architecture for Duane Luy's Developer Showcase

This document provides production-ready, highly detailed generative prompts for **Google Flow**, **Runway Gen-3 Alpha**, **Luma Dream Machine**, **Midjourney v6**, and **After Effects / Cinema 4D**, specifically tailored to showcase Duane's 37 institutional systems.

---

## 1. Google Flow / Video Generation Master Prompts

### Concept A: The Sovereign Campus Network (Institutional Hero Background)
*Use this as a looping background video or Bento Hero banner for the ZPPSU Suite.*

> **Prompt (Google Flow / Runway Gen-3 Alpha):**
> ```text
> Cinematic macro 3D isometric render of an ultra-modern state university campus digital twin at twilight. Intricate architectural blueprints made of frosted glass, brushed titanium, and glowing fiber-optic network traces. Glowing emerald green and electric indigo data pulses flow through underground server conduits into a central server node. Micro-LED status indicators pulsing softly at 60fps. Ambient volumetric haze, shallow depth of field (f/1.8), anamorphic lens flare, photorealistic glass refractions, sub-millimeter silicon textures. Camera slowly rotates 15 degrees in a buttery smooth parallax drift. Seamless infinite loop, 4K resolution, photorealistic Unreal Engine 5 aesthetic, zero chromatic aberration, cinematic lighting.
> ```
> **Parameters:**
> - **Motion Intensity:** `3` (Subtle, elegant drift — never chaotic)
> - **Aspect Ratio:** `16:9` or `21:9`
> - **Color Palette:** Deep Obsidian `#09090b`, Institutional Emerald `#10b981`, Server Indigo `#6366f1`

---

### Concept B: FIDE Tournament Command HUD (CPT-Palaro & EPDU Chess)
*Use this for the sports domain showcase or Bento Tile A.*

> **Prompt (Google Flow / Runway Gen-3 Alpha):**
> ```text
> High-tech holographic tactical sports telemetry display floating in dark obsidian space. A semi-transparent 3D crystal chess king and queen rotating slowly on an illuminated Swiss-system bracket grid. Dynamic glowing neon lines connecting tournament nodes, real-time match countdowns, and dynamic QR-code credential badges scanning with a soft vertical laser sweep. Crisp typography, surgical UI grid lines, micro-data dials, Apple VisionOS spatial interface aesthetic, frosted glass cards with subtle inner glow. Smooth 60fps looping animation, soft emerald accents, high-end motion graphics showcase, 8k render, octane render.
> ```
> **Parameters:**
> - **Motion Intensity:** `4`
> - **Aspect Ratio:** `16:10`
> - **Color Palette:** Matrix Emerald `#10b981`, Amber Gold `#f59e0b`, Obsidian `#09090b`

---

### Concept C: The Air-Gapped Mesh Network (LocalClassroom & Offline LAN)
*Use this for the LocalClassroom Marquee Spotlight.*

> **Prompt (Google Flow / Runway Gen-3 Alpha):**
> ```text
> Isometric cutaway of an academic computer lab operating completely offline. In the center, a ruggedized mini-server appliance radiates translucent concentric Wi-Fi radio wave rings that connect to 40 student laptops without any internet cables. Blue and violet data packets hop between devices via SQLite local sync. Clean Scandinavian minimalist design, matte white surfaces, warm timber accents, dark mode environment, soft studio rim lighting. Cinematic macro slow-motion pan, 4K, 60fps, architectural showcase, Behance award-winning 3D render.
> ```
> **Parameters:**
> - **Motion Intensity:** `2.5`
> - **Aspect Ratio:** `16:9`

---

## 2. Sound Design & Audio Architecture (Foley & Micro-Feedback)

If you decide to enable subtle micro-audio feedback on your portfolio (with an on/off mute toggle in the navigation), here are the exact audio design specifications:

### Sound 1: Tab Switch & Filter Click
- **Aesthetic:** Crisp, tactile mechanical switch (like a high-end Leica camera shutter or mechanical keyboard actuation).
- **Prompt for ElevenLabs Sound Effects:**
  ```text
  Extremely subtle, short, crisp tactile click of a high-end luxury camera aperture ring, micro-mechanical actuation, studio recorded, zero reverb, dry acoustic, 40ms duration.
  ```
- **Web Audio API Synthesis Recipe:**
  - Waveform: `sine` with frequency ramp from `1200 Hz` down to `400 Hz` in `0.035s`.
  - Gain: `-18 dB` (imperceptible unless wearing headphones).

### Sound 2: Case Study Drawer Expansion
- **Aesthetic:** Soft, pressurized pneumatic latch release (like opening a luxury watch case or airlock).
- **Prompt for ElevenLabs Sound Effects:**
  ```text
  Gentle, low-frequency pneumatic suction release, soft atmospheric whoosh with a clean stop, premium UI sound effect, 120ms duration, high-end tech gadget opening.
  ```

---

## 3. How to Drop Generated Animations into Your Portfolio

Once you generate a video loop with Google Flow or Runway:
1. Export as `.webm` (for optimal web compression, target < 2 MB for a 5-second loop).
2. Place the video file in `public/assets/videos/hero-loop.webm`.
3. In `src/components/BentoTile.astro` or `src/pages/index.astro`, embed with native HTML5:
   ```html
   <video
     autoplay
     loop
     muted
     playsinline
     preload="auto"
     class="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
   >
     <source src="/assets/videos/hero-loop.webm" type="video/webm" />
   </video>
   ```
4. This delivers the exact "jaw-dropping" cinematic tech showcase you envisioned while keeping 100% of your production code and university databases completely safe and private!
