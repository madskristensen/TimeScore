# Copilot Instructions

## Project Guidelines

- For the ring UI, the blue arc should always represent current seconds from 12 o'clock to the current analogue second-hand position on page load and during animation.
- This is a static website without a build step. Skip build validation unless a build step is added.
- Vanilla JavaScript only (no frameworks), system fonts only.
- The clock must paint before any game script runs: keep the critical CSS and the inline clock script in `index.html`, and keep the game scripts loading after first paint.
- Bump `VERSION` in `src/service-worker.js` for every release so installed apps get the update toast. Add new files that should work offline to `APP_SHELL`.
- Existing localStorage data must keep working; migrate instead of renaming keys.

## TimeScore Project Specifications

- Special moments live in `getMomentBadge` in `src/assets/js/timescore.js`, and each one needs a badge (with `icon`, `name`, `description` and `rarity`) in `src/assets/js/badgeService.js`.
- Special moments should represent culturally or historically recognizable moments, dates, years, or references, not simple clock patterns; clock-pattern rules are handled elsewhere.
- Pattern rules are judged on the 12-hour clock face, so they score AM and PM.
