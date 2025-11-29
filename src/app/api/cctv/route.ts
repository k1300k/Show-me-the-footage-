import { NextRequest, NextResponse } from 'next/server';
import { getDbPool, sql } from '@/lib/db';

const CCTV_CO_NAME = process.env.CCTV_CO_NAME || 'mnsoft';
const CCTV_SERVICE_NAME = process.env.CCTV_SERVICE_NAME || 'mnsoftmonitor';
const CCTV_STREAM_BASE = process.env.CCTV_STREAM_BASE || 'http://stream.ktict.co.kr';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minX = parseFloat(searchParams.get('minX') || '0');
    const maxX = parseFloat(searchParams.get('maxX') || '0');
    const minY = parseFloat(searchParams.get('minY') || '0');
    const maxY = parseFloat(searchParams.get('maxY') || '0');

    // DB 연결
    const pool = await getDbPool();

    // CCTV 정보 조회 (위도/경도 범위 내)
    // 실제 테이블명과 컬럼명은 DB 스키마에 따라 조정 필요
    const result = await pool.request()
      .input('minLng', sql.Float, minX)
      .input('maxLng', sql.Float, maxX)
      .input('minLat', sql.Float, minY)
      .input('maxLat', sql.Float, maxY)
      .query(`
        SELECT 
          cctv_id,
          cctv_name,
          latitude,
          longitude,
          status,
          direction
        FROM cctvinfo
        WHERE longitude >= @minLng 
          AND longitude <= @maxLng
          AND latitude >= @minLat
          AND latitude <= @maxLat
          AND status = 'NORMAL'
        ORDER BY cctv_id
      `);

    // CCTV URL 생성
    const cctvData = result.recordset.map((row: any) => {
      const cctvId = row.cctv_id;
      const streamAccount = `${CCTV_CO_NAME}_${CCTV_SERVICE_NAME}`;
      
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
