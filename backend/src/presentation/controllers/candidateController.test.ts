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
