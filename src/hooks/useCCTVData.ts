import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CCTV } from '@/types';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// ITS API Response structure (simplified)
interface ITSResponse {
  response: {
    coordtype: number;
    data: number; // Count
    datacount: number;
    data: Array<{
      cctvname: string;
      cctvurl: string;
      coordx: number; // lng
      coordy: number; // lat
      cctvformat: string;
      cctvtype: number;
    }>;
  } | null; // Sometimes data is null if no result
}

export const fetchCCTVData = async (bounds: Bounds) => {
  const { data } = await axios.get<ITSResponse>('/api/cctv', {
    params: {
      minX: bounds.minX,
      maxX: bounds.maxX,
      minY: bounds.minY,
      maxY: bounds.maxY,
      type: 'all',
    },
  });
  return data;
};

export const useCCTVData = (bounds: Bounds | null) => {
  return useQuery({
    queryKey: ['cctv', bounds],
    queryFn: () => fetchCCTVData(bounds!),
    enabled: !!bounds,
    staleTime: 1000 * 60, // 1 minute
    select: (data): CCTV[] => {
      if (!data?.response?.data || !Array.isArray(data.response.data)) return [];
      
      return data.response.data.map((item) => ({
        id: item.cctvurl, // Use URL as ID since ITS doesn't provide clear ID sometimes
        name: item.cctvname,
        coord: {
          lat: item.coordy,
          lng: item.coordx,
        },
        cctvUrl: item.cctvurl,
        source: 'ITS',
      }));
    },
  });
};

