---
description: "Use when adding or modifying tests in backend or frontend code. Covers test placement, naming, scope, and practical quality gates for this repository."
name: "Fullstack Testing Preferences"
applyTo: ["backend/src/**/*.{ts,tsx,js}", "frontend/src/**/*.{ts,tsx,js,jsx}"]
---
# Fullstack Testing Preferences

Use these as soft preferences. Favor focused, reliable tests over broad brittle suites.

## Test placement and naming

- Place tests close to the code they validate when practical.
- Use file names ending in `.test.ts`, `.test.tsx`, `.test.js`, or `.test.jsx`.
- Use descriptive test names that describe behavior, not implementation details.

## Backend test focus

- Prioritize service-level tests for business rules and validation paths.
- Cover controller response behavior for success and common error cases.
- Add regression tests when fixing bugs in validation, Prisma error mapping, or response shape.
- Mock external boundaries (database, file storage, network) to keep tests deterministic.

## Frontend test focus

- Test user-visible behavior: rendering, form interactions, submit outcomes, and error states.
- Verify candidate-flow date handling and payload formatting (`YYYY-MM-DD`).
- Prefer testing through component behavior rather than internal implementation details.
- Mock API services at module boundaries, not deep internals.

## Quality gates and reliability

- For every code change, aim to add or update at least one meaningful test when feasible.
- Keep tests isolated: no hidden ordering dependencies and no shared mutable state.
- Prefer small fixtures and local factories for readable setup.
- Ensure failing scenarios assert clear error messages or status outcomes.

## Scope guidance

- Unit tests are the default.
- Add integration tests when behavior spans service-controller boundaries.
- Avoid end-to-end style tests unless the task explicitly requires them.
