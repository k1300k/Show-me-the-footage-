export interface CCTV {
  id: string;
  name: string;
  coord: {
    lat: number;
    lng: number;
  };
  cctvUrl: string;
  imageUrl?: string; // 썸네일 이미지 URL 추가
  direction?: string;
  source: 'SEOUL' | 'ITS' | 'EX';
}
