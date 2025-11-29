import { NextRequest, NextResponse } from 'next/server';

// 서울시 주요 지역의 샘플 CCTV 데이터 (실제로는 서울 열린데이터 광장 API를 사용할 수 있습니다)
const SAMPLE_CCTV_DATA = [
  {
    id: 'cctv-gangnam-01',
    name: '강남역 사거리',
    coord: { lat: 37.4979, lng: 127.0276 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Gangnam+Station',
    direction: '북측',
    source: 'SEOUL',
  },
  {
    id: 'cctv-sinchon-01',
    name: '신촌역 로터리',
    coord: { lat: 37.5559, lng: 126.9366 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Sinchon+Station',
    direction: '남측',
    source: 'SEOUL',
  },
  {
    id: 'cctv-cityhall-01',
    name: '서울시청 앞',
    coord: { lat: 37.5665, lng: 126.9780 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Seoul+City+Hall',
    direction: '동측',
    source: 'SEOUL',
  },
  {
    id: 'cctv-hongdae-01',
    name: '홍대입구역',
    coord: { lat: 37.5572, lng: 126.9239 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Hongdae+Station',
    direction: '서측',
    source: 'SEOUL',
  },
  {
    id: 'cctv-jamsil-01',
    name: '잠실역 사거리',
    coord: { lat: 37.5133, lng: 127.1000 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Jamsil+Station',
    direction: '북측',
    source: 'SEOUL',
  },
  {
    id: 'cctv-yeouido-01',
    name: '여의도 한강공원',
    coord: { lat: 37.5285, lng: 126.9331 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Yeouido+Han+River',
    direction: '한강',
    source: 'SEOUL',
  },
  {
    id: 'cctv-gangbuk-01',
    name: '강북구청',
    coord: { lat: 37.6398, lng: 127.0256 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Gangbuk+Office',
    direction: '남측',
    source: 'SEOUL',
  },
  {
    id: 'cctv-gangdong-01',
    name: '강동구청',
    coord: { lat: 37.5301, lng: 127.1238 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Gangdong+Office',
    direction: '서측',
    source: 'SEOUL',
  },
  {
    id: 'cctv-mapo-01',
    name: '마포대교',
    coord: { lat: 37.5409, lng: 126.9519 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Mapo+Bridge',
    direction: '한강',
    source: 'SEOUL',
  },
  {
    id: 'cctv-gwanghwamun-01',
    name: '광화문 사거리',
    coord: { lat: 37.5720, lng: 126.9769 },
    imageUrl: 'https://via.placeholder.com/640x360/0088cc/ffffff?text=Gwanghwamun',
    direction: '남측',
    source: 'SEOUL',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const minX = parseFloat(searchParams.get('minX') || '0');
  const maxX = parseFloat(searchParams.get('maxX') || '0');
  const minY = parseFloat(searchParams.get('minY') || '0');
  const maxY = parseFloat(searchParams.get('maxY') || '0');

  // 지도 영역 내의 CCTV만 필터링
  const filteredData = SAMPLE_CCTV_DATA.filter((cctv) => {
    return (
      cctv.coord.lng >= minX &&
      cctv.coord.lng <= maxX &&
      cctv.coord.lat >= minY &&
      cctv.coord.lat <= maxY
    );
  });

  // ITS API 형식과 유사하게 응답 구조 맞춤
  return NextResponse.json({
    response: {
      data: filteredData.map((cctv) => ({
        cctvname: cctv.name,
        cctvurl: cctv.imageUrl, // 이미지 URL을 cctvurl로
        coordx: cctv.coord.lng,
        coordy: cctv.coord.lat,
        cctvtype: 3, // 3 = 이미지 타입
      })),
    },
  });
}
