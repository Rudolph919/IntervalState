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

## Running

See [README-docker.md](README-docker.md) for how to run the stack with Podman or Docker.

---

## Potential Improvements

- **Saved workout presets** — Save and load custom configurations to database
- Multi-device session sync
- Workout sharing
- Mobile-first optimisation

