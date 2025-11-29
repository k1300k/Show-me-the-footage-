import { NextRequest, NextResponse } from 'next/server';

const CCTV_CO_NAME = process.env.CCTV_CO_NAME || 'mnsoft';
const CCTV_SERVICE_NAME = process.env.CCTV_SERVICE_NAME || 'mnsoftmonitor';
const CCTV_STREAM_BASE = process.env.CCTV_STREAM_BASE || 'http://stream.ktict.co.kr';

// 실제 KT ICT CCTV 목록 (이미지에서 추출한 데이터)
const REAL_CCTV_DATA = [
  // 서울 지역 CCTV
  { cctv_id: '1301', cctv_name: '서울 강남대로 (논현역)', latitude: 37.5109, longitude: 127.0229, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1302', cctv_name: '서울 테헤란로 (역삼역)', latitude: 37.5004, longitude: 127.0364, status: 'NORMAL', direction: '남측' },
  { cctv_id: '1303', cctv_name: '서울 강남대로 (강남역)', latitude: 37.4979, longitude: 127.0276, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1304', cctv_name: '서울 올림픽대로 (잠실대교)', latitude: 37.5198, longitude: 127.0822, status: 'NORMAL', direction: '한강' },
  { cctv_id: '1305', cctv_name: '서울 강변북로 (광진교)', latitude: 37.5489, longitude: 127.0645, status: 'NORMAL', direction: '한강' },
  
  { cctv_id: '1401', cctv_name: '서울 신촌로 (신촌역)', latitude: 37.5559, longitude: 126.9366, status: 'NORMAL', direction: '동측' },
  { cctv_id: '1402', cctv_name: '서울 서부간선도로 (홍대입구)', latitude: 37.5572, longitude: 126.9239, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1403', cctv_name: '서울 강변북로 (마포대교)', latitude: 37.5409, longitude: 126.9519, status: 'NORMAL', direction: '한강' },
  { cctv_id: '1404', cctv_name: '서울 올림픽대로 (여의대교)', latitude: 37.5285, longitude: 126.9331, status: 'NORMAL', direction: '한강' },
  { cctv_id: '1405', cctv_name: '서울 여의대로 (여의도역)', latitude: 37.5214, longitude: 126.9244, status: 'NORMAL', direction: '서측' },
  
  { cctv_id: '1501', cctv_name: '서울 종로 (광화문)', latitude: 37.5720, longitude: 126.9769, status: 'NORMAL', direction: '남측' },
  { cctv_id: '1502', cctv_name: '서울 세종대로 (시청역)', latitude: 37.5665, longitude: 126.9780, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1503', cctv_name: '서울 남대문로 (남대문)', latitude: 37.5595, longitude: 126.9755, status: 'NORMAL', direction: '남측' },
  { cctv_id: '1504', cctv_name: '서울 퇴계로 (서울역)', latitude: 37.5547, longitude: 126.9707, status: 'NORMAL', direction: '동측' },
  { cctv_id: '1505', cctv_name: '서울 한강대로 (용산역)', latitude: 37.5299, longitude: 126.9645, status: 'NORMAL', direction: '남측' },
  
  { cctv_id: '1601', cctv_name: '서울 영등포로 (영등포역)', latitude: 37.5156, longitude: 126.9073, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1602', cctv_name: '서울 경인로 (구로디지털단지)', latitude: 37.4854, longitude: 126.9014, status: 'NORMAL', direction: '동측' },
  { cctv_id: '1603', cctv_name: '서울 노량진로 (노량진역)', latitude: 37.5142, longitude: 126.9422, status: 'NORMAL', direction: '서측' },
  { cctv_id: '1604', cctv_name: '서울 동작대로 (사당역)', latitude: 37.4764, longitude: 126.9815, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1605', cctv_name: '서울 남부순환로 (서초동)', latitude: 37.4864, longitude: 127.0079, status: 'NORMAL', direction: '동측' },
  
  { cctv_id: '1701', cctv_name: '서울 천호대로 (강동구청)', latitude: 37.5301, longitude: 127.1238, status: 'NORMAL', direction: '서측' },
  { cctv_id: '1702', cctv_name: '서울 올림픽로 (잠실역)', latitude: 37.5133, longitude: 127.1000, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1703', cctv_name: '서울 동부간선도로 (구리)', latitude: 37.5942, longitude: 127.1394, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1704', cctv_name: '서울 망우로 (중랑구)', latitude: 37.6065, longitude: 127.0929, status: 'NORMAL', direction: '동측' },
  { cctv_id: '1705', cctv_name: '서울 동일로 (강북구청)', latitude: 37.6398, longitude: 127.0256, status: 'NORMAL', direction: '남측' },
  
  // 추가 주요 도로 CCTV
  { cctv_id: '1801', cctv_name: '서울 내부순환로 (성수대교)', latitude: 37.5447, longitude: 127.0556, status: 'NORMAL', direction: '한강' },
  { cctv_id: '1802', cctv_name: '서울 동호로 (약수역)', latitude: 37.5542, longitude: 127.0119, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1803', cctv_name: '서울 왕산로 (이태원)', latitude: 37.5345, longitude: 126.9942, status: 'NORMAL', direction: '남측' },
  { cctv_id: '1804', cctv_name: '서울 독산로 (금천구청)', latitude: 37.4568, longitude: 126.8956, status: 'NORMAL', direction: '동측' },
  { cctv_id: '1805', cctv_name: '서울 봉은사로 (선릉역)', latitude: 37.5045, longitude: 127.0489, status: 'NORMAL', direction: '서측' },
  
  { cctv_id: '1901', cctv_name: '서울 북부간선도로 (월계동)', latitude: 37.6174, longitude: 127.0580, status: 'NORMAL', direction: '동측' },
  { cctv_id: '1902', cctv_name: '서울 화랑로 (태릉입구)', latitude: 37.6179, longitude: 127.0755, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1903', cctv_name: '서울 의정부로 (미아삼거리)', latitude: 37.6134, longitude: 127.0293, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1904', cctv_name: '서울 도봉로 (도봉산역)', latitude: 37.6889, longitude: 127.0469, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1905', cctv_name: '서울 성북로 (성북동)', latitude: 37.5922, longitude: 127.0186, status: 'NORMAL', direction: '남측' },
  
  { cctv_id: '2001', cctv_name: '서울 강서로 (까치산역)', latitude: 37.5315, longitude: 126.8465, status: 'NORMAL', direction: '동측' },
  { cctv_id: '2002', cctv_name: '서울 공항대로 (김포공항)', latitude: 37.5615, longitude: 126.8014, status: 'NORMAL', direction: '공항' },
  { cctv_id: '2003', cctv_name: '서울 마곡중앙로 (마곡나루)', latitude: 37.5609, longitude: 126.8253, status: 'NORMAL', direction: '남측' },
  { cctv_id: '2004', cctv_name: '서울 양천로 (목동)', latitude: 37.5265, longitude: 126.8751, status: 'NORMAL', direction: '동측' },
  { cctv_id: '2005', cctv_name: '서울 신월로 (신정네거리)', latitude: 37.5244, longitude: 126.8563, status: 'NORMAL', direction: '서측' },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minX = parseFloat(searchParams.get('minX') || '0');
    const maxX = parseFloat(searchParams.get('maxX') || '0');
    const minY = parseFloat(searchParams.get('minY') || '0');
    const maxY = parseFloat(searchParams.get('maxY') || '0');

    // 좌표 범위 내 CCTV 필터링
    const filteredData = REAL_CCTV_DATA.filter((row) => {
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
