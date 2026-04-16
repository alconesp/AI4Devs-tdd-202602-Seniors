# Prompts used to create the test suite

## Prompt to get a better prompt to create the test suite

Role: Expert QA, Developer and Prompt engineer.
Requirement:

Review the following prompt:
---
Role: Act as an expert creating typescript test using jest.
Requirements:
We need to create a test suite to cover the functionality on inserting new candidates into the database. The suite needs to cover both sides, frontend (the user insert the data into the form), and backend (the data is stored into the database)

For the backend, we are using Prisma, and we don't want to store anything into the database, so you will need to mock the prisma client. Follow the instructions included in this link https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client

Review the code, understand the functionality that we have implemented and trace a plan to create the test suite.
---

Suggest a better prompt to accomplish the task in the prompt I passed to you.

### Result:

Your original prompt is good in intent, but it is too open-ended for consistent execution.
It can be improved by making scope, targets, constraints, and deliverables explicit.

A stronger prompt for this repo:

Role: Senior QA + Fullstack Test Engineer (TypeScript, Jest, React Testing Library, Express, Prisma)

Goal:
Create a complete, deterministic test strategy and implementation plan for the “add candidate” flow, covering frontend form submission behavior and backend persistence orchestration without writing to a real database.

Codebase context to analyze first:
- Backend service: candidateService.ts
- Backend controller: candidateController.ts
- Backend validation: validator.ts
- Frontend form: AddCandidateForm.js
- Frontend API service: candidateService.js

Requirements:
- Use Jest for backend and frontend tests.
- For frontend component tests, use React Testing Library.
- Do not connect to a real database.
- Mock Prisma client following this guide: https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client
- Mock external boundaries only (database and network/API calls), keep business logic real.
- Keep tests behavior-focused (inputs, outputs, side effects, response shape), not implementation-detail-heavy.
- Ensure date handling is validated as YYYY-MM-DD where applicable.
- Include success paths and failure paths.

What to produce:
1. Test Plan
- List test suites to create, with exact target files and purpose.
- Prioritize by risk and business impact.
- Map each test case to behavior in code (validation, save flow, error mapping, HTTP response, UI messages).

2. Backend Test Design
- Service-level tests for addCandidate:
- Valid candidate saves successfully.
- Prisma unique constraint error P2002 maps to user-friendly error.
- Validation failures block persistence.
- Education/work experience/CV conditional saves are covered.
- Controller-level tests for addCandidateController:
- Returns 201 with expected JSON shape on success.
- Returns 400 with expected JSON shape on known errors.

3. Frontend Test Design
- AddCandidateForm tests for:
- Rendering required fields and submit button.
- User input updates state through form interactions.
- Date fields are transformed to YYYY-MM-DD before submit.
- Successful submit shows success message and clears error.
- Failed submit shows error and clears success message.
- Submit payload includes expected candidate structure, including optional CV behavior.

4. Mocking Strategy
- Exact modules/functions to mock and why.
- Prisma mock setup approach aligned with the Prisma guide.
- fetch/axios mock strategy for frontend calls.

5. File-by-file implementation plan
- Proposed test file names and locations (.test.ts/.test.tsx or .test.js where migration is not requested).
- Shared test utilities/fixtures factories to add.
- Order of implementation (smallest reliable slice first).

6. Acceptance Criteria
- No real DB writes.
- Deterministic tests (no flaky timing/network dependence).
- Clear Given/When/Then naming.
- Coverage includes critical happy path + key validation and error paths.

Output format:
- Section A: Findings from code review
- Section B: Test matrix (case, layer, mock required, expected assertion)
- Section C: Step-by-step implementation plan
- Section D: Risks and gaps not covered yet

If you want, I can also give you a second version of this prompt optimized for “generate tests directly now” instead of “analyze + plan first.”

## Prompt to create the test plan

Role: Senior QA + Fullstack Test Engineer (TypeScript, Jest, React Testing Library, Express, Prisma)

Goal:
Create a complete, deterministic test strategy and implementation plan for the “add candidate” flow, covering frontend form submission behavior and backend persistence orchestration without writing to a real database.

Codebase context to analyze first:
- Backend service: candidateService.ts
- Backend controller: candidateController.ts
- Backend validation: validator.ts
- Frontend form: AddCandidateForm.js
- Frontend API service: candidateService.js

Requirements:
- Use Jest for backend and frontend tests.
- For frontend component tests, use React Testing Library.
- Do not connect to a real database.
- Mock Prisma client following this guide: https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client
- Mock external boundaries only (database and network/API calls), keep business logic real.
- Keep tests behavior-focused (inputs, outputs, side effects, response shape), not implementation-detail-heavy.
- Ensure date handling is validated as YYYY-MM-DD where applicable.
- Include success paths and failure paths.

What to produce:
1. Test Plan
- List test suites to create, with exact target files and purpose.
- Prioritize by risk and business impact.
- Map each test case to behavior in code (validation, save flow, error mapping, HTTP response, UI messages).

2. Backend Test Design
- Service-level tests for addCandidate:
- Valid candidate saves successfully.
- Prisma unique constraint error P2002 maps to user-friendly error.
- Validation failures block persistence.
- Education/work experience/CV conditional saves are covered.
- Controller-level tests for addCandidateController:
- Returns 201 with expected JSON shape on success.
- Returns 400 with expected JSON shape on known errors.

3. Frontend Test Design
- AddCandidateForm tests for:
- Rendering required fields and submit button.
- User input updates state through form interactions.
- Date fields are transformed to YYYY-MM-DD before submit.
- Successful submit shows success message and clears error.
- Failed submit shows error and clears success message.
- Submit payload includes expected candidate structure, including optional CV behavior.

4. Mocking Strategy
- Exact modules/functions to mock and why.
- Prisma mock setup approach aligned with the Prisma guide.
- fetch/axios mock strategy for frontend calls.

5. File-by-file implementation plan
- Proposed test file names and locations (.test.ts/.test.tsx or .test.js where migration is not requested).
- Shared test utilities/fixtures factories to add.
- Order of implementation (smallest reliable slice first).

6. Acceptance Criteria
- No real DB writes.
- Deterministic tests (no flaky timing/network dependence).
- Clear Given/When/Then naming.
- Coverage includes critical happy path + key validation and error paths.

Output format:
- Section A: Findings from code review
- Section B: Test matrix (case, layer, mock required, expected assertion)
- Section C: Step-by-step implementation plan
- Section D: Risks and gaps not covered yet

### Result

**Section A: Findings from code review**

1. Critical: Route is not using addCandidateController response contract
The route imports addCandidate from the controller file and calls the service-style function directly, then sends raw data with status 201. This bypasses the controller JSON shape you requested for tests.
References: candidateRoutes.ts, candidateRoutes.ts, candidateController.ts, candidateController.ts

2. High: Prisma client is instantiated separately in each model
There is no shared Prisma singleton module today, so guide-style deterministic mocking is harder and more fragile.
References: Candidate.ts, Education.ts, WorkExperience.ts, Resume.ts

3. High: Frontend component bypasses frontend API service
The form calls fetch directly and does not use sendCandidateData from candidateService.js, so boundary mocking should target fetch for component tests and axios separately for service tests.
References: AddCandidateForm.js, candidateService.js

4. Medium: Date normalization exists in UI but validator expects strict string regex
UI converts Date objects to YYYY-MM-DD before submit, and backend validates this format. This is a high-value behavior to test end-to-end at unit/component level.
References: AddCandidateForm.js, AddCandidateForm.js, validator.ts, validator.ts

5. Medium: Frontend Jest config currently uses node environment
React Testing Library component tests need jsdom.
Reference: jest.config.js

6. Medium: No tests currently exist in backend or frontend candidate flow
Initial implementation should prioritize highest business-risk path first.
Observation from repository scan.

7. Low: candidateService.js error construction drops server details
new Error is called with two params, but only first message is used by Error constructor. This affects test expectations for message content.
References: candidateService.js, candidateService.js

---

**Section B: Test matrix (case, layer, mock required, expected assertion)**

| Case | Layer | Mock required | Expected assertion |
|---|---|---|---|
| Valid candidate saves successfully | Backend service addCandidate | Prisma mocked (model save boundaries), validation real | Returns saved candidate object; Candidate save called once; no thrown error |
| Validation failure blocks persistence | Backend service addCandidate | Prisma mocked; validation real | Throws Invalid X error; Candidate/Education/WorkExperience/Resume save not called |
| Unique email P2002 maps to friendly error | Backend service addCandidate | Prisma mocked to throw code P2002 on candidate create | Throws The email already exists in the database |
| Saves education only when provided | Backend service addCandidate | Prisma mocked | Education save called for each education; not called when educations absent |
| Saves work experience only when provided | Backend service addCandidate | Prisma mocked | WorkExperience save called for each experience; not called when absent |
| Saves CV only when non-empty object | Backend service addCandidate | Prisma mocked | Resume save called once only when cv has keys; not called for null or empty object |
| Controller success response | Backend controller addCandidateController | Mock service addCandidate only | Status 201, JSON shape message + data |
| Controller known error response | Backend controller addCandidateController | Mock service addCandidate throw Error | Status 400, JSON shape message + error message |
| Controller unknown error response | Backend controller addCandidateController | Mock service addCandidate throw non-Error | Status 400, JSON shape with Unknown error |
| Form renders required inputs and submit | Frontend component AddCandidateForm | Mock FileUploader + DatePicker, fetch mocked | Inputs and submit visible; no crash |
| User input updates fields and dynamic sections | Frontend component AddCandidateForm | fetch mocked, DatePicker mock emits Date | Added education/experience fields accept values; state reflected via field values |
| Date fields transformed to YYYY-MM-DD | Frontend component AddCandidateForm | fetch mocked and inspect body | Payload contains startDate/endDate as YYYY-MM-DD strings |
| Submit success message behavior | Frontend component AddCandidateForm | fetch returns status 201 | Shows success alert, clears error |
| Submit failure message behavior status 400 | Frontend component AddCandidateForm | fetch returns status 400 + json message | Shows error alert prefixed with Error al añadir candidato, clears success |
| Submit payload structure with optional CV present | Frontend component AddCandidateForm | fetch mocked, FileUploader mock emits file data | Payload includes cv with filePath/fileType |
| Submit payload structure with optional CV absent | Frontend component AddCandidateForm | fetch mocked | Payload sends cv as null |
| sendCandidateData success | Frontend service candidateService.js | axios.post mocked | Resolves with response.data |
| sendCandidateData failure | Frontend service candidateService.js | axios.post mocked reject | Throws Error with static message prefix |
| uploadCV success | Frontend service candidateService.js | axios.post mocked | FormData posted to /upload; resolves response.data |
| uploadCV failure | Frontend service candidateService.js | axios.post mocked reject | Throws Error with static message prefix |

Risk priority order for implementation:
1. Backend addCandidate service tests (persistence orchestration and P2002 mapping).
2. Frontend AddCandidateForm submit and date normalization tests.
3. Controller response contract tests.
4. Frontend candidateService.js unit tests.

---

**Section C: Step-by-step implementation plan**

1. Establish deterministic test infrastructure first
1. Add backend Jest config for TypeScript tests if missing.
2. Set frontend Jest environment to jsdom for component tests.
3. Add shared deterministic fixtures with fixed dates like 2026-04-16 and explicit Date objects to avoid timezone drift.

2. Implement Prisma mocking aligned with Prisma guide
1. Preferred setup (guide-aligned): create a singleton Prisma module and manual deep mock module adjacent to it.
2. Use jest-mock-extended deep mock and reset before each test.
3. Use jest.mock on singleton module in service tests.
4. If singleton refactor is deferred, temporary fallback is mocking @prisma/client constructor globally, but this is less clean and harder to maintain.

Exact backend boundaries to mock:
1. Database boundary: Prisma client methods used by Candidate.save, Education.save, WorkExperience.save, Resume.save.
2. Keep real business logic: validateCandidateData and addCandidate orchestration loops/conditions remain real.

3. Create backend service suite first (highest value)
Proposed file: backend/src/application/services/candidateService.test.ts
1. Given valid base payload, When addCandidate, Then candidate persisted and returned.
2. Given duplicate email (mock P2002), When addCandidate, Then friendly error thrown.
3. Given invalid date format in education or workExperience, When addCandidate, Then validation throws and no persistence happens.
4. Given optional sections combinations, When addCandidate, Then only corresponding saves occur:
- educations only
- workExperiences only
- cv only
- none optional

4. Create backend controller suite
Proposed file: backend/src/presentation/controllers/candidateController.test.ts
1. Mock addCandidate service call only.
2. Assert:
- success status 201 and json with message/data
- known Error maps to status 400 with message/error
- non-Error maps to status 400 with Unknown error

5. Create frontend component suite with RTL
Proposed file: frontend/src/components/AddCandidateForm.test.js
1. Mock child boundaries:
- FileUploader mocked to expose simple button/callback
- react-datepicker mocked with simple input or button that emits deterministic Date object
- global fetch mocked per test
2. Cover:
- render required fields and submit
- add section flows and input changes
- date conversion to YYYY-MM-DD in posted JSON body
- success and failure alert behavior
- payload shape with and without CV

6. Create frontend API service suite
Proposed file: frontend/src/services/candidateService.test.js
1. Mock axios.post.
2. Test sendCandidateData and uploadCV success/failure semantics.
3. Ensure no real network calls.

7. Add reusable test fixtures and factories
Proposed files:
1. backend/src/test/factories/candidateFactory.ts
2. frontend/src/test/factories/candidatePayloadFactory.js
3. frontend/src/test/utils/mockFetch.js

Factory scope:
1. Base valid candidate payload generator.
2. Variants: no optional sections, with CV, invalid email/date, duplicate email scenario.

8. Enforce naming and deterministic patterns
1. Test names in Given/When/Then style.
2. No reliance on current time, random ids, or real network/database.
3. Reset all mocks beforeEach, clear afterEach.

9. Optional contract reconciliation step (recommended before route-level integration tests)
1. Decide whether route should call addCandidateController or continue direct service call.
2. If unchanged, keep controller tests and route tests separate to avoid mixed response-shape assumptions.

---

**Section D: Risks and gaps not covered yet**

1. Route/controller contract inconsistency may confuse API-level expectations
Current route success response differs from controller response shape. This can create contradictory tests unless explicitly scoped by layer.
References: candidateRoutes.ts, candidateController.ts

2. Prisma mocking ergonomics depend on small architecture adjustment
Without a singleton Prisma module, guide-style clean mocks are harder. Tests are still possible, but setup is more brittle.

3. Frontend config may block RTL component execution
Node environment in frontend Jest config will fail DOM-driven tests unless moved to jsdom.
Reference: jest.config.js

4. candidateService.js is currently not in the AddCandidateForm runtime path
Service tests still add value, but they do not guarantee form integration behavior unless the component is refactored to use the service.
References: AddCandidateForm.js, candidateService.js

5. Validator bypass for payloads containing id
validateCandidateData returns early when id exists, so creation-flow tests should ensure id is absent in fixtures to avoid false positives.
Reference: validator.ts

Natural next steps:
1. I can turn this plan into exact test case skeletons (describe/it blocks with mock setup snippets) ready to paste into each proposed test file.
2. I can provide a minimal Prisma singleton + mock file design that matches your current model architecture with the least refactor surface.

## Prompt to implement the tests

Implement the provided test plan

### Result

Implemented the test plan end to end with deterministic backend and frontend test suites, mocking only external boundaries and keeping business logic real.

What I changed

- Added Prisma singleton + manual mock structure to support guide-aligned client mocking in unit tests:
prisma.ts
prisma.ts

- Refactored model classes to use the shared Prisma singleton (so tests can mock one database boundary):
Candidate.ts
Education.ts
WorkExperience.ts
Resume.ts

- Added backend Jest config and test typing support:
jest.config.js
tsconfig.json

- Implemented backend service tests for addCandidate behavior:
candidateService.test.ts

- Implemented backend controller tests for response shape and error mapping:
candidateController.test.ts

- Added reusable backend fixture factory:
candidateFactory.ts

- Implemented frontend AddCandidateForm component tests with React Testing Library:
AddCandidateForm.test.js

- Implemented frontend candidate API service tests:
candidateService.test.js

- Added reusable frontend test helpers/factory:
mockFetch.js
candidatePayloadFactory.js

- Added frontend Jest-DOM setup for react-scripts test runtime:
setupTests.js

- Updated dependencies/scripts needed for test execution:
package.json
package.json

Behavior coverage implemented

- Backend addCandidate:
1. Valid candidate saves successfully.
2. P2002 unique constraint maps to user-friendly error.
3. Validation failure blocks persistence.
4. Conditional saves for education/work experience/CV covered, including empty CV object path.

- Backend addCandidateController:
1. 201 response with expected JSON shape on success.
2. 400 response with expected JSON shape for known errors.
3. 400 unknown error fallback path for non-Error throws.

- Frontend AddCandidateForm:
1. Renders required fields + submit button.
2. Form interactions update inputs.
3. Date fields are transformed to YYYY-MM-DD before submit.
4. Success submit shows success message and clears error.
5. Failed submit shows error and clears success.
6. Payload includes expected candidate structure with CV present and with CV absent.

- Frontend candidateService:
1. sendCandidateData success/failure.
2. uploadCV success/failure.
3. API boundary fully mocked.

Validation run results

- Backend tests: 2 suites passed, 8 tests passed.
- Frontend tests: 2 suites passed, 11 tests passed.
- No real DB writes and no real network calls were used in these tests.

Note

- Frontend test run emits React act warnings from state updates in the component workflow, but tests are stable and passing. If you want, I can do a follow-up to eliminate those warnings cleanly with async interaction handling updates.

Made changes.

### Remove the frontend warnings when running the tests

Yes, please, do a follow-up to eliminate those warnings cleanly with async interaction handling updates.

#### Result

I’ve applied the async interaction refactor and dependency bump; next I’ll install updated frontend packages and run the component tests to confirm warnings are gone, not just passing.

Ran terminal command:  cd /Users/alconesp/Development/ai4devs/AI4Devs-tdd-202602-Seniors/frontend && npm install

Ran terminal command:  npm test -- --runInBand src/components/AddCandidateForm.test.js

Ran terminal command:  npm test -- --runInBand

Ran terminal command:  cd /Users/alconesp/Development/ai4devs/AI4Devs-tdd-202602-Seniors && git status --short frontend/src/components/AddCandidateForm.test.js frontend/package.json frontend/package-lock.json

Implemented. The follow-up removed the React act/deprecation warning noise from the form test flow by making interaction handling fully async and updating Testing Library versions for React 18.

##### What I changed
1. Refactored form tests from synchronous fireEvent patterns to async userEvent interactions:
AddCandidateForm.test.js

2. Updated Testing Library packages to modern React 18-compatible versions:
package.json
package-lock.json

##### Why this removed the warnings
- Async user interactions (typing/clicking with await) ensure state updates complete within RTL-managed act boundaries.
- Newer @testing-library/react and @testing-library/user-event remove the deprecated ReactDOMTestUtils.act path seen with older versions.

##### Verification
- Targeted suite:
  - src/components/AddCandidateForm.test.js: 7/7 passed
- Full frontend suite:
  - 2 suites passed, 11 tests passed
- Previous act/deprecation warnings from AddCandidateForm tests are gone.
- Remaining console output is only Node’s punycode deprecation warning from tooling/runtime, not from your test logic.

If you want, I can also apply the same async interaction style to any future component tests as a repo-wide testing convention.

Made changes.