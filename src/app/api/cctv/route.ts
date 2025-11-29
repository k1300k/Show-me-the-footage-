import { NextRequest, NextResponse } from 'next/server';

const CCTV_CO_NAME = process.env.CCTV_CO_NAME || 'mnsoft';
const CCTV_SERVICE_NAME = process.env.CCTV_SERVICE_NAME || 'mnsoftmonitor';
const CCTV_STREAM_BASE = process.env.CCTV_STREAM_BASE || 'http://stream.ktict.co.kr';

// 샘플 CCTV 데이터 (실제 KT ICT CCTV ID 사용)
const SAMPLE_CCTV_DATA = [
  { cctv_id: '1', cctv_name: '서울 강남역 사거리', latitude: 37.4979, longitude: 127.0276, status: 'NORMAL', direction: '북측' },
  { cctv_id: '2', cctv_name: '서울 신촌역 로터리', latitude: 37.5559, longitude: 126.9366, status: 'NORMAL', direction: '남측' },
  { cctv_id: '99', cctv_name: '서울시청 앞', latitude: 37.5665, longitude: 126.9780, status: 'NORMAL', direction: '동측' },
  { cctv_id: '100', cctv_name: '홍대입구역', latitude: 37.5572, longitude: 126.9239, status: 'NORMAL', direction: '서측' },
  { cctv_id: '101', cctv_name: '잠실역 사거리', latitude: 37.5133, longitude: 127.1000, status: 'NORMAL', direction: '북측' },
  { cctv_id: '102', cctv_name: '여의도 한강공원', latitude: 37.5285, longitude: 126.9331, status: 'NORMAL', direction: '한강' },
  { cctv_id: '103', cctv_name: '강북구청', latitude: 37.6398, longitude: 127.0256, status: 'NORMAL', direction: '남측' },
  { cctv_id: '104', cctv_name: '강동구청', latitude: 37.5301, longitude: 127.1238, status: 'NORMAL', direction: '서측' },
  { cctv_id: '105', cctv_name: '마포대교', latitude: 37.5409, longitude: 126.9519, status: 'NORMAL', direction: '한강' },
  { cctv_id: '106', cctv_name: '광화문 사거리', latitude: 37.5720, longitude: 126.9769, status: 'NORMAL', direction: '남측' },
  { cctv_id: '107', cctv_name: '영등포역', latitude: 37.5156, longitude: 126.9073, status: 'NORMAL', direction: '북측' },
  { cctv_id: '108', cctv_name: '구로디지털단지역', latitude: 37.4854, longitude: 126.9014, status: 'NORMAL', direction: '동측' },
  { cctv_id: '109', cctv_name: '노량진역', latitude: 37.5142, longitude: 126.9422, status: 'NORMAL', direction: '서측' },
  { cctv_id: '110', cctv_name: '용산역', latitude: 37.5299, longitude: 126.9645, status: 'NORMAL', direction: '남측' },
  { cctv_id: '111', cctv_name: '서울역', latitude: 37.5547, longitude: 126.9707, status: 'NORMAL', direction: '북측' },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minX = parseFloat(searchParams.get('minX') || '0');
    const maxX = parseFloat(searchParams.get('maxX') || '0');
    const minY = parseFloat(searchParams.get('minY') || '0');
    const maxY = parseFloat(searchParams.get('maxY') || '0');

    // DB 연결 대신 샘플 데이터 사용
    const filteredData = SAMPLE_CCTV_DATA.filter((row) => {
      return (
        row.longitude >= minX &&
        row.longitude <= maxX &&
        row.latitude >= minY &&
        row.latitude <= maxY
      );
    });

    // CCTV URL 생성
    const streamAccount = `${CCTV_CO_NAME}_${CCTV_SERVICE_NAME}`;
    
    const cctvData = filteredData.map((row) => {
      const cctvId = row.cctv_id;
      
      return {
        cctvname: row.cctv_name,
        cctvid: cctvId,
        // JPEG 썸네일 URL
        imageUrl: `${CCTV_STREAM_BASE}/${streamAccount}/${cctvId}!jpg`,
        // HLS 스트림 URL
        cctvurl: `${CCTV_STREAM_BASE}/${streamAccount}/${cctvId}!hls`,
        coordx: row.longitude,
        coordy: row.latitude,
        status: row.status,
        direction: row.direction,
      };
    });

    return NextResponse.json({
      response: {
        data: cctvData,
      },
    });
  } catch (error: any) {
    console.error('CCTV API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch CCTV data',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
