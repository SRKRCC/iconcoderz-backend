# Backend Testing Strategy

This document outlines the testing strategy for the IconCoderz backend, ensuring industrial-level quality, modularity, and reusability.

## 1. Stack Selection

Given the project uses ESM (`type: "module"`) and TypeScript, **Vitest** is the optimal choice over Jest.

- **Vitest**: Native ESM support, fast (Vite-based), mostly Jest-compatible API.
- **Supertest**: For HTTP assertions in integration tests.
- **Mock Service Worker (MSW)** or **Vitest Mocks**: For mocking external APIs (AWS, Cloudinary).
- **Faker.js**: For generating realistic test data.

## 2. Test Pyramid

We will follow the test pyramid approach:

1; **Unit Tests (60%)**: Test individual functions, services, and utils in isolation. Mock all external dependencies (Prisma, Email, AWS).
2: **Integration Tests (30%)**: Test API endpoints (Controller -> Service). Mock the database layer or use an in-memory DB to verify data flow and HTTP responses.
3:  **E2E Tests (10%)**: (Optional/Later) Full flow testing against a test database container.

## 3. Directory Structure

Tests will be strictly separated from source code to keep `src` clean, or co-located if preferred. For this project, a `tests` root directory is recommended for separation.

```bash
server/
  tests/
    unit/
      services/        # Service logic tests
      utils/           # Utility function tests
    integration/
      routes/          # API endpoint tests
    setup/
      setup.ts         # Global test setup (env vars, mocks)
    mocks/             # Reusable mocks (prisma, services)
    factories/         # Data generators (UserFactory, etc.)
```

## 4. Key Areas to Test

### Critical Paths

- **Authentication**: Admin login, JWT validation.
- **Registration**: Input validation, duplicate checks, email sending (mocked).
- **Payment**: Status updates, signature verification.
- **Attendance**: QR scanning logic, duplicate scans, stats calculation.

### Services (Unit)

- `RegistrationService`: Register, email triggers.
- `AdminService`: Login, hashing.
- `AttendanceService`: QR decoding/validation.
- `EmailService`: Ensure `transporter.sendMail` is called with correct args.

### APIs (Integration)

- `POST /api/v1/registration`: Valid/Invalid payloads.
- `POST /api/v1/admin/login`: Success/Fail scenarios.
- `POST /api/v1/attendance/scan`: Check-in logic.

## 5. Implementation Plan

1:  **Setup**: Install `vitest`, `supertest`, `@types/supertest`, `vitest-mock-extended`.
2:  **Configuration**: Create `vitest.config.ts`.
3;  **Mocks**: Create a reusable `prisma` mock to avoid touching the real DB during unit tests.
4;  **Factories**: Create simple factory functions to generate random User/Admin objects.
5;  **Write Tests**:
    - Start with `utils/response.ts` (Simple).
    - Move to `AdminService` (Auth logic).
    - Then `RegistrationController` (Integration).

## 6. CI/CD Integration

- Add a `test` job to the GitHub Workflow to run `pnpm test` before deployment.
