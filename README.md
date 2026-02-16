# IntervalState

## Interval / CrossFit Training Timer

### Purpose

This application demonstrates a deterministic, state-driven timer engine designed for interval training workouts such as CrossFit, HIIT, and Tabata.

The focus is on **predictable behaviour**, **clean state transitions**, and **clear user feedback**.

---

## Problem Statement

Many timer applications:

- Drift over time
- Handle pauses inconsistently
- Break under rapid state changes
- Prioritise visuals over correctness

This timer prioritises correctness first.

---

## Core Features

- Count up
- Count down
- Tabata
- Custom intervals
- Audio and visual cues
- Saved workout presets

---

## Tech Stack

- Laravel 11/12
- Vue 3 (Composition API)
- Inertia.js
- Tailwind CSS

---

## Architecture Overview

- Timer behaviour is modelled as a state machine
- All interval logic flows through a single deterministic engine
- UI reacts to state changes instead of controlling timing
- Presets are configuration-driven

---

## Key Design Decisions

- **Single source of truth for time**
- **Explicit timer states**
- **No reliance on UI timers for correctness**
- **Readable composition functions**

---

## Tradeoffs

- No mobile app wrapper
- Limited animations
- No social or sharing features

---

## What This Demonstrates

- State-driven UI design
- Real-time logic without over-engineering
- UX discipline
- Clean Vue Composition API usage

---

## Step-by-Step Build Prompts (Commit-Friendly)

1. **Base App** — Laravel + Vue 3 single-page timer interface.  
   *Commit: `chore: bootstrap timer application`*

2. **Timer State Model** — Deterministic timer state (idle, running, paused, completed).  
   *Commit: `feat: timer state machine`*

3. **Core Timer Logic** — Count up and count down using a single interval engine.  
   *Commit: `feat: core timer engine`*

4. **Interval Modes** — Tabata and custom intervals with config-driven logic.  
   *Commit: `feat: interval mode support`*

5. **Presets** — Save and load workout presets.  
   *Commit: `feat: workout presets`*

6. **UX Polish** — Audio cues, accessibility, visual state transitions.  
   *Commit: `feat: timer ux polish`*

---

## Potential Improvements

- Multi-device session sync
- Workout sharing
- Mobile-first optimisation

---

## Docker / Podman

See [README-docker.md](README-docker.md) for how to run the stack with Podman or Docker.
