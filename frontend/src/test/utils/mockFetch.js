export const mockFetchResponse = (status, payload = {}) => {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: jest.fn().mockResolvedValue(payload),
  });
};
