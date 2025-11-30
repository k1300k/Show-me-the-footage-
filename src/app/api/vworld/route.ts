import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// VWorld API 설정 (국가 공간정보 플랫폼)
const VWORLD_API_KEY = process.env.VWORLD_API_KEY || '';
const VWORLD_API_BASE = 'https://api.vworld.kr/req';

/**
 * 좌표를 기반으로 국가표준링크 정보 가져오기
 * 국가 ITS 표준에 맞춘 좌표 정보 제공
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng parameters are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid lat or lng parameters' },
        { status: 400 }
      );
    }

    // VWorld API를 사용한 역지오코딩 (국가표준링크 정보)
    let vworldData = null;
    
    if (VWORLD_API_KEY) {
      try {
        // VWorld 주소 검색 API (좌표 → 주소)
        const response = await axios.get(VWORLD_API_BASE, {
          params: {
            service: 'address',
            request: 'getAddress',
            version: '2.0',
            key: VWORLD_API_KEY,
            point: `${longitude},${latitude}`, // 경도, 위도 순서 (국가 ITS 표준)
            format: 'json',
            type: 'both', // 도로명 + 지번 주소
            zipcode: 'true',
            simple: 'false',
          },
          timeout: 5000,
        });

        if (response.data?.response?.status === 'OK' && response.data?.response?.result) {
          const result = response.data.response.result[0];
          const text = result.text || '';
          const structure = result.structure || {};
          
          vworldData = {
            fullAddress: text,
            roadAddress: structure.level1 || structure.level2 || text,
            jibunAddress: structure.level1 || structure.level2 || text,
            sido: structure.level1 || '', // 시도
            sigungu: structure.level2 || '', // 시군구
            dong: structure.level3 || '', // 동
            ri: structure.level4 || '', // 리
            roadName: structure.text || '', // 도로명
            buildingName: structure.text || '', // 건물명
            zipcode: structure.zipcode || '', // 우편번호
          };
        }
      } catch (apiError: any) {
        console.error('[VWorld API] Error:', apiError.message);
      }
    }

    // 국가표준링크 생성 (국가 ITS 표준)
    const standardLinks = {
      vworld: `https://map.vworld.kr/?q=${latitude},${longitude}`,
      vworldKSID: `https://map.vworld.kr/?q=KSID:${longitude},${latitude}`, // 국가 ITS 표준: 경도, 위도
      vworldCoord: `https://map.vworld.kr/?q=${longitude},${latitude}`, // 국가 ITS 표준 좌표
      naver: `https://map.naver.com/v5/search/${latitude},${longitude}`,
      kakao: `https://map.kakao.com/link/map/${latitude},${longitude}`,
      google: `https://www.google.com/maps?q=${latitude},${longitude}`,
    };

    // 국가표준 좌표 정보 (국가 ITS 표준)
    const standardCoord = {
      lat: latitude, // 위도
      lng: longitude, // 경도
      coordx: longitude, // 경도 (국가 ITS 표준)
      coordy: latitude, // 위도 (국가 ITS 표준)
      epsg: 'EPSG:4326', // WGS84 좌표계
      datum: 'WGS84',
    };

    return NextResponse.json({
      success: true,
      coord: standardCoord,
      address: vworldData?.fullAddress || `${latitude}, ${longitude}`,
      roadAddress: vworldData?.roadAddress || '',
      jibunAddress: vworldData?.jibunAddress || '',
      administrative: {
        sido: vworldData?.sido || '',
        sigungu: vworldData?.sigungu || '',
        dong: vworldData?.dong || '',
        ri: vworldData?.ri || '',
      },
      location: {
        roadName: vworldData?.roadName || '',
        buildingName: vworldData?.buildingName || '',
        zipcode: vworldData?.zipcode || '',
      },
      standardLinks: standardLinks,
      source: vworldData ? 'vworld' : 'fallback',
    });
  } catch (error: any) {
    console.error('VWorld API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch standard location info',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

