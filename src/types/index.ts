export interface CCTV {
  id: string; // CCTV ID (KT ICT DB의 cctv_id)
  name: string;
  coord: {
    lat: number;
    lng: number;
  };
  cctvUrl: string; // HLS Stream URL
  imageUrl: string; // JPEG Thumbnail URL
  direction?: string;
  source: 'KTICT';
  status?: 'NORMAL' | 'ERROR'; // 실시간 상태
}

// Kakao Maps SDK 타입 확장
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: typeof kakao.maps.Map;
        LatLng: typeof kakao.maps.LatLng;
        LatLngBounds: typeof kakao.maps.LatLngBounds;
        Marker: typeof kakao.maps.Marker;
        MarkerClusterer: typeof kakao.maps.MarkerClusterer;
        services: typeof kakao.maps.services;
      };
    };
  }
}
