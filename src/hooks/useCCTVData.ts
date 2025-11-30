import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CCTV } from '@/types';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface CCTVResponse {
  response: {
    data: Array<{
      cctvname: string;
      cctvid: string;
      cctvurl: string;
      imageUrl: string;
      coordx: number;
      coordy: number;
      status?: string;
      direction?: string;
    }>;
  };
}

// CCTV 소스 설정 가져오기
const getCCTVSource = (): 'ktict' | 'its' | 'both' => {
  if (typeof window === 'undefined') return 'ktict';
  
  try {
    const config = localStorage.getItem('cctv_config');
    if (config) {
      const parsed = JSON.parse(config);
      return parsed.source || 'ktict';
    }
  } catch (e) {
    console.error('Failed to parse CCTV config:', e);
  }
  return 'ktict';
};

export const fetchCCTVData = async (bounds: Bounds) => {
  const source = getCCTVSource();
  
  const { data } = await axios.get<CCTVResponse>('/api/cctv', {
    params: {
      minX: bounds.minX,
      maxX: bounds.maxX,
      minY: bounds.minY,
      maxY: bounds.maxY,
      source: source,
    },
  });
  return data;
};

export const useCCTVData = (bounds: Bounds | null) => {
  const source = getCCTVSource();
  
  return useQuery({
    queryKey: ['cctv', bounds, source], // source를 queryKey에 추가
    queryFn: () => fetchCCTVData(bounds!),
    enabled: !!bounds,
    staleTime: 1000 * 30, // 30초마다 갱신
    select: (data): CCTV[] => {
      if (!data?.response?.data || !Array.isArray(data.response.data)) return [];
      
      return data.response.data.map((item) => ({
        id: item.cctvid,
        name: item.cctvname,
        coord: {
          lat: item.coordy,
          lng: item.coordx,
        },
        cctvUrl: item.cctvurl,
        imageUrl: item.imageUrl,
        direction: item.direction,
        source: (item as any).source || 'KTICT',
        status: item.status === 'NORMAL' ? 'NORMAL' : 'ERROR',
      }));
    },
  });
};
