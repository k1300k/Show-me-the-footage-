import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 네이버 Geocoding API 설정
const NAVER_CLIENT_ID = process.env.NAVER_MAP_CLIENT_ID || '';
const NAVER_CLIENT_SECRET = process.env.NAVER_MAP_CLIENT_SECRET || '';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // 좌표인지 확인 (lat,lng 형식)
    const coordMatch = query.match(/^([\d.]+),([\d.]+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      
      // 네이버 Reverse Geocoding API 호출
      if (NAVER_CLIENT_ID && NAVER_CLIENT_SECRET) {
        try {
          const response = await axios.get('https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc', {
            params: {
              coords: `${lng},${lat}`, // 네이버는 lng,lat 순서
              orders: 'roadaddr,addr',
              output: 'json',
            },
            headers: {
              'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
              'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET,
            },
          });

          if (response.data?.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            const region = result.region;
            const land = result.land;
            
            let address = '';
            let roadAddress = '';
            let jibunAddress = '';
            
            if (land?.name && land.name !== 'LAND') {
              address = land.name; // 도로명 주소
              roadAddress = land.name;
            }
            
            if (region) {
              // 지번 주소 조합
              jibunAddress = [
                region.area1?.name,
                region.area2?.name,
                region.area3?.name,
                region.area4?.name,
              ].filter(Boolean).join(' ');
              
              if (!address) {
                address = jibunAddress;
              }
            }

            // 국가표준링크 생성 (도로명주소 기반)
            const jibunAddressForLink = [
              region.area1?.name,
              region.area2?.name,
              region.area3?.name,
            ].filter(Boolean).join(' ');
            
            const stdLink = `https://www.juso.go.kr/addrlink/addrLinkUrl.do?keyword=${encodeURIComponent(jibunAddressForLink)}`;

            return NextResponse.json({
              success: true,
              address: address || '주소 확인 중',
              roadAddress,
              jibunAddress,
              stdLink,
              lat: lat,
              lng: lng,
              source: 'naver_reverse',
            });
          }
        } catch (apiError: any) {
          console.error('[Naver Reverse Geocoding] Error:', apiError.message);
        }
      }
      
      // Fallback: 좌표만 반환
      return NextResponse.json({
        success: true,
        address: `위도 ${lat.toFixed(4)}, 경도 ${lng.toFixed(4)}`,
        lat: lat,
        lng: lng,
        source: 'coordinates',
      });
    }

    // 주소 검색 (Forward Geocoding)
    if (NAVER_CLIENT_ID && NAVER_CLIENT_SECRET) {
      try {
        const response = await axios.get('https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode', {
          params: {
            query: query,
          },
          headers: {
            'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
            'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET,
          },
        });

        if (response.data?.addresses && response.data.addresses.length > 0) {
          const address = response.data.addresses[0];
          return NextResponse.json({
            success: true,
            address: address.roadAddress || address.jibunAddress,
            lat: parseFloat(address.y),
            lng: parseFloat(address.x),
            source: 'naver',
          });
        }
      } catch (apiError: any) {
        console.error('[Naver Geocoding] Error:', apiError.message);
      }
    }

    // Fallback: 주요 지역 좌표 매핑 (100개 이상)
    const locationMap: { [key: string]: { lat: number; lng: number; name: string } } = {
      // === 강남/서초구 (2호선, 신분당선) ===
      '강남': { lat: 37.4979, lng: 127.0276, name: '강남역' },
      '강남구': { lat: 37.5172, lng: 127.0473, name: '강남구' },
      '강남역': { lat: 37.4979, lng: 127.0276, name: '강남역' },
      '역삼': { lat: 37.5004, lng: 127.0364, name: '역삼역' },
      '역삼역': { lat: 37.5004, lng: 127.0364, name: '역삼역' },
      '선릉': { lat: 37.5045, lng: 127.0487, name: '선릉역' },
      '선릉역': { lat: 37.5045, lng: 127.0487, name: '선릉역' },
      '삼성': { lat: 37.5088, lng: 127.0633, name: '삼성역' },
      '삼성역': { lat: 37.5088, lng: 127.0633, name: '삼성역' },
      '논현': { lat: 37.5109, lng: 127.0229, name: '논현역' },
      '논현역': { lat: 37.5109, lng: 127.0229, name: '논현역' },
      '신논현': { lat: 37.5048, lng: 127.0255, name: '신논현역' },
      '신논현역': { lat: 37.5048, lng: 127.0255, name: '신논현역' },
      '교대': { lat: 37.4934, lng: 127.0143, name: '교대역' },
      '교대역': { lat: 37.4934, lng: 127.0143, name: '교대역' },
      '서초': { lat: 37.4837, lng: 127.0324, name: '서초역' },
      '서초역': { lat: 37.4837, lng: 127.0324, name: '서초역' },
      '서초구': { lat: 37.4837, lng: 127.0324, name: '서초구' },
      '양재': { lat: 37.4844, lng: 127.0344, name: '양재역' },
      '양재역': { lat: 37.4844, lng: 127.0344, name: '양재역' },
      
      // === 강동/송파구 (2호선, 8호선) ===
      '잠실': { lat: 37.5133, lng: 127.1000, name: '잠실역' },
      '잠실역': { lat: 37.5133, lng: 127.1000, name: '잠실역' },
      '잠실새내': { lat: 37.5213, lng: 127.1231, name: '잠실새내역' },
      '잠실새내역': { lat: 37.5213, lng: 127.1231, name: '잠실새내역' },
      '잠실대교': { lat: 37.5198, lng: 127.0822, name: '잠실대교' },
      '송파': { lat: 37.5048, lng: 127.1116, name: '송파역' },
      '송파역': { lat: 37.5048, lng: 127.1116, name: '송파역' },
      '문정': { lat: 37.4846, lng: 127.1220, name: '문정역' },
      '문정역': { lat: 37.4846, lng: 127.1220, name: '문정역' },
      '가락': { lat: 37.4925, lng: 127.1187, name: '가락시장역' },
      '가락시장': { lat: 37.4925, lng: 127.1187, name: '가락시장역' },
      '가락시장역': { lat: 37.4925, lng: 127.1187, name: '가락시장역' },
      '광진': { lat: 37.5384, lng: 127.0822, name: '광진구' },
      '광진교': { lat: 37.5489, lng: 127.0645, name: '광진교' },
      '건대': { lat: 37.5404, lng: 127.0696, name: '건대입구역' },
      '건대입구': { lat: 37.5404, lng: 127.0696, name: '건대입구역' },
      '건대입구역': { lat: 37.5404, lng: 127.0696, name: '건대입구역' },
      '구의': { lat: 37.5372, lng: 127.0856, name: '구의역' },
      '구의역': { lat: 37.5372, lng: 127.0856, name: '구의역' },
      
      // === 서대문/마포구 (2호선, 6호선) ===
      '신촌': { lat: 37.5559, lng: 126.9366, name: '신촌역' },
      '신촌역': { lat: 37.5559, lng: 126.9366, name: '신촌역' },
      '홍대': { lat: 37.5572, lng: 126.9239, name: '홍대입구역' },
      '홍대입구': { lat: 37.5572, lng: 126.9239, name: '홍대입구역' },
      '홍대입구역': { lat: 37.5572, lng: 126.9239, name: '홍대입구역' },
      '이대': { lat: 37.5566, lng: 126.9460, name: '이대역' },
      '이대역': { lat: 37.5566, lng: 126.9460, name: '이대역' },
      '마포': { lat: 37.5663, lng: 126.9019, name: '마포구' },
      '합정': { lat: 37.5498, lng: 126.9139, name: '합정역' },
      '합정역': { lat: 37.5498, lng: 126.9139, name: '합정역' },
      '망원': { lat: 37.5560, lng: 126.9105, name: '망원역' },
      '망원역': { lat: 37.5560, lng: 126.9105, name: '망원역' },
      '상수': { lat: 37.5478, lng: 126.9225, name: '상수역' },
      '상수역': { lat: 37.5478, lng: 126.9225, name: '상수역' },
      
      // === 중구/종로구 (1호선, 5호선) ===
      '광화문': { lat: 37.5720, lng: 126.9769, name: '광화문역' },
      '광화문역': { lat: 37.5720, lng: 126.9769, name: '광화문역' },
      '시청': { lat: 37.5665, lng: 126.9780, name: '시청역' },
      '시청역': { lat: 37.5665, lng: 126.9780, name: '시청역' },
      '서울역': { lat: 37.5547, lng: 126.9707, name: '서울역' },
      '명동': { lat: 37.5636, lng: 126.9824, name: '명동역' },
      '명동역': { lat: 37.5636, lng: 126.9824, name: '명동역' },
      '종로': { lat: 37.5700, lng: 126.9910, name: '종로3가역' },
      '종로3가': { lat: 37.5700, lng: 126.9910, name: '종로3가역' },
      '종로3가역': { lat: 37.5700, lng: 126.9910, name: '종로3가역' },
      '을지로': { lat: 37.5664, lng: 126.9910, name: '을지로입구역' },
      '을지로입구': { lat: 37.5664, lng: 126.9910, name: '을지로입구역' },
      '을지로입구역': { lat: 37.5664, lng: 126.9910, name: '을지로입구역' },
      '동대문': { lat: 37.5710, lng: 127.0099, name: '동대문역' },
      '동대문역': { lat: 37.5710, lng: 127.0099, name: '동대문역' },
      '종로구': { lat: 37.5700, lng: 126.9910, name: '종로구' },
      '중구': { lat: 37.5636, lng: 126.9979, name: '중구' },
      
      // === 용산/영등포구 (1호선, 9호선) ===
      '용산': { lat: 37.5299, lng: 126.9644, name: '용산역' },
      '용산역': { lat: 37.5299, lng: 126.9644, name: '용산역' },
      '삼각지': { lat: 37.5346, lng: 126.9734, name: '삼각지역' },
      '삼각지역': { lat: 37.5346, lng: 126.9734, name: '삼각지역' },
      '노량진': { lat: 37.5138, lng: 126.9423, name: '노량진역' },
      '노량진역': { lat: 37.5138, lng: 126.9423, name: '노량진역' },
      '영등포': { lat: 37.5155, lng: 126.9073, name: '영등포역' },
      '영등포역': { lat: 37.5155, lng: 126.9073, name: '영등포역' },
      '영등포구': { lat: 37.5264, lng: 126.8962, name: '영등포구' },
      '여의도': { lat: 37.5219, lng: 126.9245, name: '여의도역' },
      '여의도역': { lat: 37.5219, lng: 126.9245, name: '여의도역' },
      '당산': { lat: 37.5346, lng: 126.9025, name: '당산역' },
      '당산역': { lat: 37.5346, lng: 126.9025, name: '당산역' },
      
      // === 강북/노원/도봉구 (1호선, 4호선) ===
      '강북': { lat: 37.6396, lng: 127.0254, name: '강북구' },
      '노원': { lat: 37.6542, lng: 127.0568, name: '노원역' },
      '노원역': { lat: 37.6542, lng: 127.0568, name: '노원역' },
      '수유': { lat: 37.6389, lng: 127.0256, name: '수유역' },
      '수유역': { lat: 37.6389, lng: 127.0256, name: '수유역' },
      '미아': { lat: 37.6136, lng: 127.0297, name: '미아역' },
      '미아역': { lat: 37.6136, lng: 127.0297, name: '미아역' },
      '창동': { lat: 37.6534, lng: 127.0472, name: '창동역' },
      '창동역': { lat: 37.6534, lng: 127.0472, name: '창동역' },
      '도봉': { lat: 37.6689, lng: 127.0470, name: '도봉구' },
      '도봉구': { lat: 37.6689, lng: 127.0470, name: '도봉구' },
      
      // === 성북/중랑구 ===
      '성북': { lat: 37.5894, lng: 127.0167, name: '성북구' },
      '성북구': { lat: 37.5894, lng: 127.0167, name: '성북구' },
      '중랑': { lat: 37.6063, lng: 127.0926, name: '중랑구' },
      '중랑구': { lat: 37.6063, lng: 127.0926, name: '중랑구' },
      
      // === 주요 랜드마크 ===
      '코엑스': { lat: 37.5115, lng: 127.0590, name: '코엑스' },
      '롯데타워': { lat: 37.5125, lng: 127.1025, name: '롯데월드타워' },
      '롯데월드': { lat: 37.5111, lng: 127.0981, name: '롯데월드' },
      '롯데월드타워': { lat: 37.5125, lng: 127.1025, name: '롯데월드타워' },
      '63빌딩': { lat: 37.5200, lng: 126.9407, name: '63빌딩' },
      '남산타워': { lat: 37.5512, lng: 126.9882, name: 'N서울타워' },
      'n서울타워': { lat: 37.5512, lng: 126.9882, name: 'N서울타워' },
      '경복궁': { lat: 37.5796, lng: 126.9770, name: '경복궁' },
      '덕수궁': { lat: 37.5658, lng: 126.9751, name: '덕수궁' },
      '남대문': { lat: 37.5597, lng: 126.9775, name: '남대문' },
      '동대문시장': { lat: 37.5660, lng: 127.0090, name: '동대문시장' },
      '국회의사당': { lat: 37.5320, lng: 126.9170, name: '국회의사당' },
      '여의도공원': { lat: 37.5282, lng: 126.9244, name: '여의도공원' },
      '올림픽공원': { lat: 37.5220, lng: 127.1235, name: '올림픽공원' },
      '한강공원': { lat: 37.5290, lng: 126.9360, name: '한강공원' },
      '반포한강공원': { lat: 37.5133, lng: 126.9955, name: '반포한강공원' },
      
      // === 주요 대학교 ===
      '서울대': { lat: 37.4601, lng: 126.9520, name: '서울대학교' },
      '서울대학교': { lat: 37.4601, lng: 126.9520, name: '서울대학교' },
      '연세대': { lat: 37.5665, lng: 126.9398, name: '연세대학교' },
      '연세대학교': { lat: 37.5665, lng: 126.9398, name: '연세대학교' },
      '고려대': { lat: 37.5850, lng: 127.0297, name: '고려대학교' },
      '고려대학교': { lat: 37.5850, lng: 127.0297, name: '고려대학교' },
      '이화여대': { lat: 37.5616, lng: 126.9465, name: '이화여자대학교' },
      '이화여자대학교': { lat: 37.5616, lng: 126.9465, name: '이화여자대학교' },
      '서강대': { lat: 37.5509, lng: 126.9410, name: '서강대학교' },
      '서강대학교': { lat: 37.5509, lng: 126.9410, name: '서강대학교' },
      '한양대': { lat: 37.5558, lng: 127.0444, name: '한양대학교' },
      '한양대학교': { lat: 37.5558, lng: 127.0444, name: '한양대학교' },
      
      // === 주요 도로 ===
      '강남대로': { lat: 37.5050, lng: 127.0270, name: '강남대로' },
      '테헤란로': { lat: 37.5004, lng: 127.0364, name: '테헤란로' },
      '올림픽대로': { lat: 37.5198, lng: 127.0822, name: '올림픽대로' },
      '강변북로': { lat: 37.5489, lng: 127.0645, name: '강변북로' },
      '세종대로': { lat: 37.5665, lng: 126.9780, name: '세종대로' },
      '한강대로': { lat: 37.5299, lng: 126.9644, name: '한강대로' },
      '남부순환로': { lat: 37.4835, lng: 127.0268, name: '남부순환로' },
      '북부간선도로': { lat: 37.6121, lng: 127.0165, name: '북부간선도로' },
      '동부간선도로': { lat: 37.5680, lng: 127.0476, name: '동부간선도로' },
      '서부간선도로': { lat: 37.5572, lng: 126.9239, name: '서부간선도로' },
      '내부순환로': { lat: 37.5700, lng: 127.0100, name: '내부순환로' },
      
      // === 한강 교량 ===
      '한강대교': { lat: 37.5290, lng: 126.9588, name: '한강대교' },
      '마포대교': { lat: 37.5423, lng: 126.9432, name: '마포대교' },
      '원효대교': { lat: 37.5307, lng: 126.9494, name: '원효대교' },
      '양화대교': { lat: 37.5461, lng: 126.9014, name: '양화대교' },
      '성수대교': { lat: 37.5445, lng: 127.0392, name: '성수대교' },
      '영동대교': { lat: 37.5200, lng: 127.0520, name: '영동대교' },
      '반포대교': { lat: 37.5133, lng: 126.9955, name: '반포대교' },
      '동작대교': { lat: 37.5107, lng: 126.9613, name: '동작대교' },
      
      // === 전국 주요 도시 ===
      // 강원도
      '춘천': { lat: 37.8813, lng: 127.7299, name: '춘천시' },
      '춘천시': { lat: 37.8813, lng: 127.7299, name: '춘천시' },
      '춘천역': { lat: 37.8853, lng: 127.7183, name: '춘천역' },
      '강릉': { lat: 37.7519, lng: 128.8761, name: '강릉시' },
      '강릉시': { lat: 37.7519, lng: 128.8761, name: '강릉시' },
      '속초': { lat: 38.2070, lng: 128.5918, name: '속초시' },
      '원주': { lat: 37.3422, lng: 127.9202, name: '원주시' },
      
      // 부산
      '부산': { lat: 35.1796, lng: 129.0756, name: '부산광역시' },
      '부산역': { lat: 35.1151, lng: 129.0409, name: '부산역' },
      '해운대': { lat: 35.1587, lng: 129.1603, name: '해운대' },
      '해운대해수욕장': { lat: 35.1587, lng: 129.1603, name: '해운대해수욕장' },
      '광안리': { lat: 35.1533, lng: 129.1189, name: '광안리' },
      '서면': { lat: 35.1580, lng: 129.0595, name: '서면' },
      '남포동': { lat: 35.0966, lng: 129.0287, name: '남포동' },
      
      // 대구
      '대구': { lat: 35.8714, lng: 128.6014, name: '대구광역시' },
      '대구역': { lat: 35.8789, lng: 128.6289, name: '대구역' },
      '동대구역': { lat: 35.8790, lng: 128.6286, name: '동대구역' },
      '반월당': { lat: 35.8575, lng: 128.5927, name: '반월당' },
      '중앙로': { lat: 35.8691, lng: 128.5979, name: '중앙로' },
      
      // 대전
      '대전': { lat: 36.3504, lng: 127.3845, name: '대전광역시' },
      '대전역': { lat: 36.3314, lng: 127.4349, name: '대전역' },
      '서대전역': { lat: 36.3263, lng: 127.3795, name: '서대전역' },
      '둔산동': { lat: 36.3504, lng: 127.3845, name: '둔산동' },
      '유성': { lat: 36.3624, lng: 127.3565, name: '유성구' },
      
      // 광주
      '광주': { lat: 35.1595, lng: 126.8526, name: '광주광역시' },
      '광주역': { lat: 35.1459, lng: 126.9165, name: '광주역' },
      '충장로': { lat: 35.1468, lng: 126.9202, name: '충장로' },
      '무등산': { lat: 35.1349, lng: 126.9886, name: '무등산' },
      
      // 인천
      '인천': { lat: 37.4563, lng: 126.7052, name: '인천광역시' },
      '인천역': { lat: 37.4746, lng: 126.6162, name: '인천역' },
      '부평': { lat: 37.5074, lng: 126.7222, name: '부평역' },
      '송도': { lat: 37.3876, lng: 126.6566, name: '송도' },
      '인천공항': { lat: 37.4602, lng: 126.4407, name: '인천국제공항' },
      
      // 울산
      '울산': { lat: 35.5384, lng: 129.3114, name: '울산광역시' },
      '울산역': { lat: 35.5606, lng: 129.3474, name: '울산역' },
      
      // 경기도
      '수원': { lat: 37.2636, lng: 127.0286, name: '수원시' },
      '수원역': { lat: 37.2661, lng: 127.0010, name: '수원역' },
      '성남': { lat: 37.4449, lng: 127.1388, name: '성남시' },
      '분당': { lat: 37.3836, lng: 127.1211, name: '분당구' },
      '일산': { lat: 37.6580, lng: 126.7729, name: '일산' },
      '고양': { lat: 37.6564, lng: 126.8320, name: '고양시' },
      '용인': { lat: 37.2411, lng: 127.1776, name: '용인시' },
      '평택': { lat: 36.9921, lng: 127.1128, name: '평택시' },
      
      // 전라도
      '전주': { lat: 35.8242, lng: 127.1480, name: '전주시' },
      '전주역': { lat: 35.8455, lng: 127.1246, name: '전주역' },
      '여수': { lat: 34.7604, lng: 127.6622, name: '여수시' },
      '순천': { lat: 34.9507, lng: 127.4872, name: '순천시' },
      '목포': { lat: 34.8118, lng: 126.3922, name: '목포시' },
      
      // 경상도
      '창원': { lat: 35.2286, lng: 128.6811, name: '창원시' },
      '진주': { lat: 35.1800, lng: 128.1076, name: '진주시' },
      '포항': { lat: 36.0190, lng: 129.3435, name: '포항시' },
      '경주': { lat: 35.8562, lng: 129.2247, name: '경주시' },
      '구미': { lat: 36.1195, lng: 128.3445, name: '구미시' },
      
      // 충청도
      '천안': { lat: 36.8151, lng: 127.1139, name: '천안시' },
      '청주': { lat: 36.6424, lng: 127.4890, name: '청주시' },
      '충주': { lat: 36.9910, lng: 127.9260, name: '충주시' },
      '세종': { lat: 36.4800, lng: 127.2890, name: '세종특별자치시' },
      '세종시': { lat: 36.4800, lng: 127.2890, name: '세종특별자치시' },
      
      // 제주도
      '제주': { lat: 33.4996, lng: 126.5312, name: '제주시' },
      '제주시': { lat: 33.4996, lng: 126.5312, name: '제주시' },
      '제주공항': { lat: 33.5070, lng: 126.4927, name: '제주국제공항' },
      '서귀포': { lat: 33.2541, lng: 126.5601, name: '서귀포시' },
    };

    // 키워드 검색
    const normalizedQuery = query.trim().toLowerCase();
    for (const [key, value] of Object.entries(locationMap)) {
      if (normalizedQuery.includes(key.toLowerCase())) {
        return NextResponse.json({
          success: true,
          address: value.name,
          lat: value.lat,
          lng: value.lng,
          source: 'fallback',
        });
      }
    }

    return NextResponse.json(
      { error: 'Location not found', message: `"${query}"에 대한 위치를 찾을 수 없습니다.` },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Geocoding failed', message: error.message },
      { status: 500 }
    );
  }
}

