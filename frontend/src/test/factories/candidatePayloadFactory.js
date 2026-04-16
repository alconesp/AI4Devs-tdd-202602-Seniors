export const buildFrontendCandidate = (overrides = {}) => ({
  firstName: 'Ana',
  lastName: 'Lopez',
  email: 'ana@example.com',
  phone: '612345678',
  address: 'Calle Mayor 1',
  ...overrides,
});
