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

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'system';
}
