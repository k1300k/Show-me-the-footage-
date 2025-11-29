import { describe, it, expect, vi } from 'vitest';
import { fetchCCTVData } from './useCCTVData';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('fetchCCTVData', () => {
  it('should fetch cctv data successfully', async () => {
    const mockData = {
      response: {
        data: [
          {
            cctvname: 'Test CCTV',
            coordy: 37.123,
            coordx: 127.123,
            cctvurl: 'http://test.com/stream.m3u8',
          },
        ],
      },
    };

    (axios.get as any).mockResolvedValue({ data: mockData });

    const bounds = {
      minX: 126.0,
      maxX: 128.0,
      minY: 36.0,
      maxY: 38.0,
    };

    const result = await fetchCCTVData(bounds);

    expect(axios.get).toHaveBeenCalledWith('/api/cctv', {
      params: {
        minX: 126.0,
        maxX: 128.0,
        minY: 36.0,
        maxY: 38.0,
        type: 'all',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should handle errors', async () => {
    (axios.get as any).mockRejectedValue(new Error('Network Error'));

    const bounds = {
      minX: 126.0,
      maxX: 128.0,
      minY: 36.0,
      maxY: 38.0,
    };

    await expect(fetchCCTVData(bounds)).rejects.toThrow('Network Error');
  });
});

