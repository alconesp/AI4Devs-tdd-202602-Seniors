---
description: "Use when editing backend Express TypeScript or frontend React candidate-flow code. Guides this repository's layering, validation, API, and UI state conventions."
name: "AI4Devs Fullstack Conventions"
applyTo: ["backend/src/**/*.ts", "frontend/src/**/*.{js,ts,tsx}"]
---
# AI4Devs Fullstack Conventions

Use these as preferences that bias generated code unless a task explicitly asks for a different approach.

## Backend layering

- Keep domain models in `backend/src/domain/models` as PascalCase classes.
- Keep business rules and orchestration in `backend/src/application/services`.
- Keep HTTP concerns in `backend/src/presentation/controllers`.
- Keep route wiring in `backend/src/routes`.
- Call validation from services before creating or persisting entities.

## Backend error and response style

- Throw meaningful `Error` messages in model and service code.
- In controllers, return JSON and preserve current response shape:
  - success create: `status(201)` with `{ message, data }`
  - validation or request error: `status(400)` with `{ message, error }`
- When handling Prisma errors, keep explicit handling for known codes such as `P2002`.
- Keep local try/catch in controllers as the default pattern.

## Frontend component and state style

- Use functional React components and hooks.
- Use PascalCase component names and filenames.
- Prefer TypeScript (`.tsx`/`.ts`) for new frontend code.
- Keep form data state separate from UI state (`error`, `successMessage`, `loading`).
- Clear stale success and error messages before a new submit attempt.
- Keep user-facing errors concise and actionable.

## Frontend API and data formatting

- Keep HTTP access in service modules when practical and reuse service helpers from components.
- No hard rule on `axios` vs `fetch` yet; prioritize consistency within the file or feature being edited.
- Normalize date values sent to the API as `YYYY-MM-DD`.
- Use async/await with try/catch for submit and upload flows.

## Consistency guardrails

- Keep naming consistent: PascalCase for classes/components, camelCase for functions and variables.
- Follow current backend formatting conventions (`singleQuote: true`, `trailingComma: all`).
- Prefer small focused changes that preserve existing public API behavior unless a task explicitly requires changing it.
