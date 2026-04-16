export const buildCandidatePayload = (overrides: Record<string, unknown> = {}) => ({
  firstName: 'Ana',
  lastName: 'Lopez',
  email: 'ana.lopez@example.com',
  phone: '612345678',
  address: 'Calle Mayor 1',
  educations: [
    {
      institution: 'Universidad de Madrid',
      title: 'Ingenieria Informatica',
      startDate: '2020-01-10',
      endDate: '2024-01-10',
    },
  ],
  workExperiences: [
    {
      company: 'Tech Corp',
      position: 'Frontend Developer',
      description: 'React development',
      startDate: '2024-02-01',
      endDate: '2026-02-01',
    },
  ],
  cv: {
    filePath: '/tmp/cv.pdf',
    fileType: 'application/pdf',
  },
  ...overrides,
});
