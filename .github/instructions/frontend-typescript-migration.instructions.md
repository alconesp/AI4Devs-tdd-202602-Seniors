---
description: "Use when adding or refactoring frontend React code. Prefer TypeScript-first component and service patterns, including typing of props, state, events, and API payloads."
name: "Frontend TypeScript Migration Preferences"
applyTo: ["frontend/src/**/*.{js,jsx,ts,tsx}"]
---
# Frontend TypeScript Migration Preferences

Use these as soft preferences. Prioritize incremental migration and preserve behavior.

## File and module choices

- Prefer `.tsx` for new React components and `.ts` for non-UI modules.
- Avoid broad rewrites of stable files unless the task explicitly asks for full conversion.
- If editing a JS file, prefer adding nearby TypeScript interfaces/types in the same file only when it keeps the change small and clear.

## Component typing

- Type component props with explicit interfaces or type aliases.
- Type local state where inference is ambiguous, especially for nullable values and arrays.
- Type event handlers explicitly, for example input and form submit events.
- Prefer narrow string unions over generic `string` for finite UI states.

## API and data typing

- Define request and response types close to service functions.
- Keep frontend payload shapes aligned with backend candidate-flow structures.
- Normalize date strings to `YYYY-MM-DD` before sending to backend APIs.
- Prefer typed service wrappers over calling HTTP clients directly from components.

## Migration strategy

- Convert touched surfaces first: props, form models, service payloads, and submit handlers.
- Use safe defaults for optional or missing backend values.
- Keep runtime guards for uncertain external data even after adding static types.

## Interop guidelines

- Mixed JS/TS is acceptable during migration.
- When importing JS modules into TS, add minimal local type definitions instead of large refactors.
- Do not block feature work for perfect typing; aim for steady type coverage growth per change.
