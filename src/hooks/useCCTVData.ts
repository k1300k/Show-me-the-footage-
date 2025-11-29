import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CCTV } from '@/types';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// API Response structure
interface CCTVResponse {
  response: {
    data: Array<{
      cctvname: string;
      cctvurl: string;
      coordx: number;
      coordy: number;
      cctvtype?: number;
    }>;
  } | null;
}

export const fetchCCTVData = async (bounds: Bounds) => {
  const { data } = await axios.get<CCTVResponse>('/api/cctv', {
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
        id: item.cctvurl, // Use URL as ID
        name: item.cctvname,
        coord: {
          lat: item.coordy,
          lng: item.coordx,
        },
        cctvUrl: item.cctvurl,
        imageUrl: item.cctvurl, // 이미지 URL로 사용
        source: 'SEOUL',
      }));
    },
  });
};
