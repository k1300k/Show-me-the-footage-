import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CCTV_CO_NAME = process.env.CCTV_CO_NAME || 'mnsoft';
const CCTV_SERVICE_NAME = process.env.CCTV_SERVICE_NAME || 'mnsoftmonitor';
const CCTV_STREAM_BASE = process.env.CCTV_STREAM_BASE || 'http://stream.ktict.co.kr';

// 국토부 ITS OpenAPI 설정
const ITS_API_BASE = process.env.ITS_API_BASE || 'https://openapi.its.go.kr:9443';
const ITS_API_KEY = process.env.ITS_API_KEY || '';

// 백업용 샘플 데이터 (실제 KT ICT CCTV ID)
const FALLBACK_CCTV_DATA = [
  { cctv_id: '1301', cctv_name: '서울 강남대로 (논현역)', latitude: 37.5109, longitude: 127.0229, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1302', cctv_name: '서울 테헤란로 (역삼역)', latitude: 37.5004, longitude: 127.0364, status: 'NORMAL', direction: '남측' },
  { cctv_id: '1303', cctv_name: '서울 강남대로 (강남역)', latitude: 37.4979, longitude: 127.0276, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1304', cctv_name: '서울 올림픽대로 (잠실대교)', latitude: 37.5198, longitude: 127.0822, status: 'NORMAL', direction: '한강' },
  { cctv_id: '1305', cctv_name: '서울 강변북로 (광진교)', latitude: 37.5489, longitude: 127.0645, status: 'NORMAL', direction: '한강' },
  { cctv_id: '1401', cctv_name: '서울 신촌로 (신촌역)', latitude: 37.5559, longitude: 126.9366, status: 'NORMAL', direction: '동측' },
  { cctv_id: '1402', cctv_name: '서울 서부간선도로 (홍대입구)', latitude: 37.5572, longitude: 126.9239, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1501', cctv_name: '서울 종로 (광화문)', latitude: 37.5720, longitude: 126.9769, status: 'NORMAL', direction: '남측' },
  { cctv_id: '1502', cctv_name: '서울 세종대로 (시청역)', latitude: 37.5665, longitude: 126.9780, status: 'NORMAL', direction: '북측' },
  { cctv_id: '1504', cctv_name: '서울 퇴계로 (서울역)', latitude: 37.5547, longitude: 126.9707, status: 'NORMAL', direction: '동측' },
];

interface ITSCCTVResponse {
  response?: {
    datacount?: number;
    data?: Array<{
      cctvname: string;
      cctvurl: string;
      coordx: string | number;
      coordy: string | number;
      cctvtype?: string;
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minX = parseFloat(searchParams.get('minX') || '0');
    const maxX = parseFloat(searchParams.get('maxX') || '0');
    const minY = parseFloat(searchParams.get('minY') || '0');
    const maxY = parseFloat(searchParams.get('maxY') || '0');
    const source = searchParams.get('source') || 'ktict'; // 기본값: ktict

    let cctvData: any[] = [];
    const streamAccount = `${CCTV_CO_NAME}_${CCTV_SERVICE_NAME}`;

    // 국가 ITS API 호출 (source가 'its' 또는 'both'일 때)
    if ((source === 'its' || source === 'both') && ITS_API_KEY) {
      try {
        console.log('[ITS API] Fetching CCTV data...');
        
        const itsResponse = await axios.get<ITSCCTVResponse>(`${ITS_API_BASE}/cctvInfo`, {
          params: {
            apiKey: ITS_API_KEY,
            type: 'all',
            cctvType: '1',
            minX, maxX, minY, maxY,
            getType: 'json',
          },
          timeout: 10000,
        });

        if (itsResponse.data?.response?.data) {
          const itsData = itsResponse.data.response.data;
          console.log(`[ITS API] Success: ${itsData.length} CCTVs`);

          cctvData = itsData.map((item, index) => {
            const cctvId = item.cctvurl.match(/\/(\d+)[!.]/) ? 
              item.cctvurl.match(/\/(\d+)[!.]/)![1] : 
              `${1300 + index}`;

            return {
              cctvname: item.cctvname,
              cctvid: cctvId,
              // 간단한 HTTP 방식 (인증 불필요)
              imageUrl: `${CCTV_STREAM_BASE}/${streamAccount}/${cctvId}!jpg`,
              cctvurl: `${CCTV_STREAM_BASE}/${streamAccount}/${cctvId}!hls`,
              coordx: parseFloat(String(item.coordx)),
              coordy: parseFloat(String(item.coordy)),
              status: 'NORMAL',
              direction: '',
            };
          });
        }
      } catch (apiError: any) {
        console.error('[ITS API] Error:', apiError.message);
      }
    }

    // KT ICT CCTV 데이터 추가 (source가 'ktict' 또는 'both'일 때)
    if (source === 'ktict' || source === 'both' || cctvData.length === 0) {
      console.log('[KT ICT] Using fallback/sample data');
      
      const filteredData = FALLBACK_CCTV_DATA.filter((row) => {
        return (
          row.longitude >= minX &&
          row.longitude <= maxX &&
          row.latitude >= minY &&
          row.latitude <= maxY
        );
      });
      
      const ktictData = (filteredData.length > 0 ? filteredData : FALLBACK_CCTV_DATA).map((row) => ({
        cctvname: row.cctv_name,
        cctvid: row.cctv_id,
        imageUrl: `${CCTV_STREAM_BASE}/${streamAccount}/${row.cctv_id}!jpg`,
        cctvurl: `${CCTV_STREAM_BASE}/${streamAccount}/${row.cctv_id}!hls`,
        coordx: row.longitude,
        coordy: row.latitude,
        status: row.status,
        direction: row.direction,
        source: 'KTICT',
      }));

      // 'both' 모드일 때는 기존 데이터에 추가, 아니면 대체
      if (source === 'both' && cctvData.length > 0) {
        cctvData = [...cctvData, ...ktictData];
      } else {
        cctvData = ktictData;
      }
    }

    // 소스 정보 결정
    let sourceInfo = 'KTICT';
    if (source === 'its') {
      sourceInfo = ITS_API_KEY ? 'ITS_API' : 'SAMPLE_ITS';
    } else if (source === 'both') {
      sourceInfo = 'KTICT+ITS';
    }

    return NextResponse.json({
      response: {
        data: cctvData,
        source: sourceInfo,
        count: cctvData.length,
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
