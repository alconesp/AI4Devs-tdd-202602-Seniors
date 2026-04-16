import { sendCandidateData, uploadCV } from './candidateService';

const mockPost = jest.fn();

jest.mock(
  'axios',
  () => ({
    __esModule: true,
    default: {
      post: (...args) => mockPost(...args),
    },
  }),
  { virtual: true },
);

describe('candidateService', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('Given valid candidate payload When sendCandidateData Then resolves response data', async () => {
    const payload = { firstName: 'Ana', email: 'ana@example.com' };
    mockPost.mockResolvedValue({ data: { id: 1, ...payload } });

    const result = await sendCandidateData(payload);

    expect(mockPost).toHaveBeenCalledWith('http://localhost:3010/candidates', payload);
    expect(result).toStrictEqual({ id: 1, firstName: 'Ana', email: 'ana@example.com' });
  });

  it('Given api error When sendCandidateData Then throws expected error message', async () => {
    mockPost.mockRejectedValue({ response: { data: { message: 'bad request' } } });

    await expect(sendCandidateData({ email: 'invalid' })).rejects.toThrow('Error al enviar datos del candidato:');
  });

  it('Given file upload success When uploadCV Then resolves response data', async () => {
    const file = new File(['cv-content'], 'cv.pdf', { type: 'application/pdf' });
    mockPost.mockResolvedValue({ data: { filePath: '/tmp/cv.pdf', fileType: 'application/pdf' } });

    const result = await uploadCV(file);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe('http://localhost:3010/upload');
    expect(result).toStrictEqual({ filePath: '/tmp/cv.pdf', fileType: 'application/pdf' });
  });

  it('Given upload error When uploadCV Then throws expected error message', async () => {
    const file = new File(['cv-content'], 'cv.pdf', { type: 'application/pdf' });
    mockPost.mockRejectedValue({ response: { data: { message: 'upload error' } } });

    await expect(uploadCV(file)).rejects.toThrow('Error al subir el archivo:');
  });
});
