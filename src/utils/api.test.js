import { fetchWithRateLimit } from './api';

global.fetch = jest.fn();
jest.setTimeout(20000); // Increase timeout to 20 seconds

describe('fetchWithRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return JSON on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'success' })
    });

    const result = await fetchWithRateLimit('https://test.com');
    expect(result).toEqual({ data: 'success' });
  });

  it('should throw RateLimitError on 429', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Too many requests' })
    });

    await expect(fetchWithRateLimit('https://test.com')).rejects.toThrow('Too many requests');
  });

  it('should retry on 500 and eventually fail', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' })
    });

    await expect(fetchWithRateLimit('https://test.com')).rejects.toThrow('Server error');
    expect(fetch).toHaveBeenCalledTimes(4); // initial + 3 retries
  });
});
