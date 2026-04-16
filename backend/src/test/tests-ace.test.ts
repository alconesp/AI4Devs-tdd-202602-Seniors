/** candidateService.test.ts */

import { addCandidate } from './candidateService';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockReset } from 'jest-mock-extended';
import prisma from '../../libs/prisma';
import { buildCandidatePayload } from '../../test/factories/candidateFactory';

jest.mock('../../libs/prisma');

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('addCandidate service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it('Given valid candidate When addCandidate Then saves candidate and related entities', async () => {
    const payload = buildCandidatePayload();

    prismaMock.candidate.create.mockResolvedValue({
      id: 101,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
    } as any);

    prismaMock.education.create.mockResolvedValue({ id: 201 } as any);
    prismaMock.workExperience.create.mockResolvedValue({ id: 301 } as any);
    prismaMock.resume.create.mockResolvedValue({ id: 401 } as any);

    const result = await addCandidate(payload);

    expect(result).toMatchObject({ id: 101, email: payload.email });
    expect(prismaMock.candidate.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.education.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.workExperience.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.resume.create).toHaveBeenCalledTimes(1);
  });

  it('Given duplicate email error P2002 When addCandidate Then throws user-friendly error', async () => {
    const payload = buildCandidatePayload();

    prismaMock.candidate.create.mockRejectedValue({ code: 'P2002' });

    await expect(addCandidate(payload)).rejects.toThrow('The email already exists in the database');
    expect(prismaMock.education.create).not.toHaveBeenCalled();
    expect(prismaMock.workExperience.create).not.toHaveBeenCalled();
    expect(prismaMock.resume.create).not.toHaveBeenCalled();
  });

  it('Given invalid date format When addCandidate Then validation blocks persistence', async () => {
    const payload = buildCandidatePayload({
      educations: [
        {
          institution: 'Universidad de Madrid',
          title: 'Ingenieria Informatica',
          startDate: '10-01-2020',
          endDate: '2024-01-10',
        },
      ],
    });

    await expect(addCandidate(payload)).rejects.toThrow('Invalid date');
    expect(prismaMock.candidate.create).not.toHaveBeenCalled();
    expect(prismaMock.education.create).not.toHaveBeenCalled();
  });

  it('Given no optional sections When addCandidate Then saves candidate only', async () => {
    const payload = buildCandidatePayload({
      educations: undefined,
      workExperiences: undefined,
      cv: null,
    });

    prismaMock.candidate.create.mockResolvedValue({
      id: 102,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
    } as any);

    await addCandidate(payload);

    expect(prismaMock.candidate.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.education.create).not.toHaveBeenCalled();
    expect(prismaMock.workExperience.create).not.toHaveBeenCalled();
    expect(prismaMock.resume.create).not.toHaveBeenCalled();
  });

  it('Given empty cv object When addCandidate Then cv is not persisted', async () => {
    const payload = buildCandidatePayload({ cv: {} });

    prismaMock.candidate.create.mockResolvedValue({
      id: 103,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
    } as any);
    prismaMock.education.create.mockResolvedValue({ id: 202 } as any);
    prismaMock.workExperience.create.mockResolvedValue({ id: 302 } as any);

    await addCandidate(payload);

    expect(prismaMock.resume.create).not.toHaveBeenCalled();
  });
});


/** candidateController.test.ts */

import { addCandidateController } from './candidateController';
import { addCandidate } from '../../application/services/candidateService';

jest.mock('../../application/services/candidateService', () => ({
  addCandidate: jest.fn(),
}));

const mockedAddCandidate = addCandidate as jest.MockedFunction<typeof addCandidate>;

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('addCandidateController', () => {
  it('Given valid request When controller is called Then returns 201 with expected json shape', async () => {
	const req: any = {
	  body: { firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com' },
	};
	const res = createRes();

	mockedAddCandidate.mockResolvedValue({ id: 1, email: 'ana@example.com' } as any);

	await addCandidateController(req, res);

	expect(res.status).toHaveBeenCalledWith(201);
	expect(res.json).toHaveBeenCalledWith({
	  message: 'Candidate added successfully',
	  data: { id: 1, email: 'ana@example.com' },
	});
  });

  it('Given known service error When controller is called Then returns 400 with expected error shape', async () => {
	const req: any = {
	  body: { firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com' },
	};
	const res = createRes();

	mockedAddCandidate.mockRejectedValue(new Error('Invalid email'));

	await addCandidateController(req, res);

	expect(res.status).toHaveBeenCalledWith(400);
	expect(res.json).toHaveBeenCalledWith({
	  message: 'Error adding candidate',
	  error: 'Invalid email',
	});
  });

  it('Given unknown error When controller is called Then returns 400 unknown error shape', async () => {
	const req: any = {
	  body: { firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com' },
	};
	const res = createRes();

	mockedAddCandidate.mockRejectedValue('boom' as any);

	await addCandidateController(req, res);

	expect(res.status).toHaveBeenCalledWith(400);
	expect(res.json).toHaveBeenCalledWith({
	  message: 'Error adding candidate',
	  error: 'Unknown error',
	});
  });
});
