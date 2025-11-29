export interface CCTV {
  id: string;
  name: string;
  coord: {
    lat: number;
    lng: number;
  };
  cctvUrl: string;
  direction?: string;
  source: 'ITS' | 'EX';
}

