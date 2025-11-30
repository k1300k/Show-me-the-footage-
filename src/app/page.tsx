'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useCCTVData } from '@/hooks/useCCTVData';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import ImageViewer from '@/components/player/ImageViewer';
import { CCTV } from '@/types';
import { Star, Send, MessageSquare, Video, Search, Hash, Map as MapIcon, List } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import ProgramInfo from '@/components/ProgramInfo';
import AISettings from '@/components/AISettings';
import UserGuide from '@/components/UserGuide';
import CCTVSettings from '@/components/CCTVSettings';
import SearchHistory from '@/components/SearchHistory';
import MobileLayout from '@/components/MobileLayout';

// Leaflet은 클라이언트 사이드에서만 로드
const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="space-y-4 text-center">
        <div className="w-[200px] h-[20px] bg-gray-300 rounded-full mx-auto animate-pulse" />
        <p className="text-muted-foreground">지도를 불러오는 중...</p>
      </div>
    </div>
  ),
});

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'system';
}

// CCTV 이름에서 키워드 추출 함수
const extractKeywordsFromCCTVs = (cctvList: CCTV[]): string[] => {
  const keywordSet = new Set<string>();
  
  cctvList.forEach(cctv => {
    const name = cctv.name;
    
    // 괄호 안의 내용 추출 (예: "서울 강남대로 (논현역)" → "논현역")
    const parenthesesMatch = name.match(/\(([^)]+)\)/);
    if (parenthesesMatch) {
      const inside = parenthesesMatch[1];
      // 괄호 안에서 역명, 교명 등 추출
      if (inside.includes('역')) {
        keywordSet.add(inside.replace('역', '역'));
      } else if (inside.includes('대교') || inside.includes('교')) {
        keywordSet.add(inside);
      } else {
        keywordSet.add(inside);
      }
    }
    
    // 주요 도로명 추출
    const roadPatterns = [
      /강남대로/, /테헤란로/, /올림픽대로/, /강변북로/, /신촌로/,
      /서부간선도로/, /여의대로/, /종로/, /세종대로/, /남대문로/,
      /퇴계로/, /한강대로/, /영등포로/, /경인로/, /노량진로/,
      /동작대로/, /남부순환로/, /천호대로/, /동부간선도로/,
      /망우로/, /동일로/, /내부순환로/, /동호로/, /왕산로/,
      /독산로/, /봉은사로/, /북부간선도로/, /화랑로/, /의정부로/,
      /도봉로/, /성북로/, /강서로/, /공항대로/, /마곡중앙로/,
      /양천로/, /신월로/
    ];
    
    roadPatterns.forEach(pattern => {
      const match = name.match(pattern);
      if (match) {
        keywordSet.add(match[0]);
      }
    });
    
    // 지역명 추출
    const regionPatterns = [
      /강남/, /신촌/, /광화문/, /서울역/, /용산/, /영등포/,
      /구로/, /노량진/, /사당/, /서초/, /강동/, /잠실/,
      /구리/, /중랑/, /강북/, /성수/, /약수/, /이태원/,
      /금천/, /선릉/, /월계/, /태릉/, /미아/, /도봉산/,
      /성북/, /까치산/, /김포/, /마곡/, /목동/, /신정/
    ];
    
    regionPatterns.forEach(pattern => {
      const match = name.match(pattern);
      if (match) {
        keywordSet.add(match[0]);
      }
    });
    
    // 한강 관련
    if (name.includes('한강') || name.includes('대교')) {
      keywordSet.add('한강');
    }
  });
  
  // 정렬 및 중복 제거
  return Array.from(keywordSet).sort().slice(0, 15); // 최대 15개
};

// 간단한 키워드 추출 함수 (자연어 처리)
const extractKeyword = (text: string): string => {
  const patterns = [
    /보여줘$/, /알려줘$/, /어때$/, /상황$/, /교통$/, /cctv$/, /씨씨티비$/,
    /는 어때$/, /좀 보여줘$/, /영상$/, /확인$/, /검색$/
  ];
  
  let keyword = text.trim();
  patterns.forEach(pattern => {
    keyword = keyword.replace(pattern, '').trim();
  });

  const josa = /[은는이가을를에에서]$/;
  if (josa.test(keyword) && keyword.length > 1) {
    keyword = keyword.replace(josa, '').trim();
  }

  return keyword;
};

export default function HomePage() {
  // 디바이스 감지
  const deviceInfo = useDeviceDetect();
  
  const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showCCTVList, setShowCCTVList] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filteredCCTVs, setFilteredCCTVs] = useState<CCTV[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 안녕하세요! 전국 CCTV 실시간 모니터링 서비스입니다.',
      timestamp: new Date(),
      sender: 'system',
    },
    {
      id: '2',
      text: '💡 자연어로 편하게 질문하세요!\n\n예시:\n• "강남역 보여줘"\n• "올림픽대로 상황 어때?"\n• "춘천 CCTV 확인"\n• "부산 해운대"\n\n✨ 입력하신 문장에서 자동으로 키워드를 추출하여 검색합니다!',
      timestamp: new Date(),
      sender: 'system',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const { data: allCCTVList, isLoading } = useCCTVData({
    minX: 126.0, maxX: 128.0, minY: 36.0, maxY: 38.0
  });
  
  const { location, error: geoError } = useGeolocation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [currentStandardInfo, setCurrentStandardInfo] = useState<any>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [cctvSource, setCctvSource] = useState<'ktict' | 'its' | 'both'>('its');
  const [cctvStandardInfo, setCctvStandardInfo] = useState<{ [key: string]: any }>({});

  // CCTV 소스 설정 로드
  useEffect(() => {
    try {
      const config = localStorage.getItem('cctv_config');
      if (config) {
        const parsed = JSON.parse(config);
        setCctvSource(parsed.source || 'ktict');
      }
    } catch (e) {
      console.error('Failed to load CCTV config:', e);
    }
  }, []);

  // 소스 이름 가져오기
  const getSourceName = () => {
    const sourceNames = {
      ktict: '기본형 (고화질)',
      its: '국가 ITS CCTV',
      both: '통합 모드',
    };
    return sourceNames[cctvSource];
  };

  // 국가표준링크 생성 함수 (국가 ITS 표준 참조)
  const getStandardMapLinks = (lat: number, lng: number, name?: string) => {
    // VWorld 기본 링크 (좌표 기반)
    const vworldLink = `https://map.vworld.kr/?q=${lat},${lng}`;
    
    // VWorld KSID 링크 (국가 ITS 표준: 경도, 위도 순서)
    // 국가 ITS API는 coordx(경도), coordy(위도) 순서를 사용
    const vworldKSIDLink = `https://map.vworld.kr/?q=KSID:${lng},${lat}`;
    
    // VWorld 좌표 기반 링크 (경도, 위도 순서 - 국가 ITS 표준)
    const vworldCoordLink = `https://map.vworld.kr/?q=${lng},${lat}`;
    
    const naverLink = `https://map.naver.com/v5/search/${encodeURIComponent(name || `${lat},${lng}`)}`;
    const kakaoLink = name 
      ? `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`
      : `https://map.kakao.com/link/map/${lat},${lng}`;
    const googleLink = `https://www.google.com/maps?q=${lat},${lng}`;
    
    return {
      vworld: vworldLink,
      vworldKSID: vworldKSIDLink, // 국가 ITS 표준 KSID 링크
      vworldCoord: vworldCoordLink, // 국가 ITS 표준 좌표 링크 (경도, 위도)
      naver: naverLink,
      kakao: kakaoLink,
      google: googleLink,
    };
  };

  // 링크 이름 매핑 함수
  const getLinkName = (key: string): string => {
    const linkNames: { [key: string]: string } = {
      vworld: 'VWorld',
      vworldKSID: 'KSID',
      vworldCoord: 'VWorld좌표',
      naver: '네이버',
      kakao: '카카오',
      google: '구글',
    };
    return linkNames[key] || key;
  };

  // CCTV 목록에서 해시태그 키워드 추출
  const hashtagKeywords = useMemo(() => {
    if (!allCCTVList || allCCTVList.length === 0) {
      // 기본 해시태그 (로딩 중이거나 데이터 없을 때)
      return ['강남역', '신촌역', '광화문', '서울역', '올림픽대로', '한강대교', '마포대교', '여의도', '잠실', '홍대'];
    }
    return extractKeywordsFromCCTVs(allCCTVList);
  }, [allCCTVList]);

  // 현재 위치 기반 CCTV 표시 및 주소 가져오기
  useEffect(() => {
    if (allCCTVList && allCCTVList.length > 0 && !locationLoaded) {
      // 위치 정보가 있으면 주변 CCTV 필터링
      if (location) {
        const lat = location.lat;
        const lng = location.lng;
        const radius = 0.05; // 약 5km

        // 주변 CCTV 필터링
        const nearbyCCTVs = allCCTVList.filter(cctv => {
          const distance = Math.sqrt(
            Math.pow(cctv.coord.lat - lat, 2) + 
            Math.pow(cctv.coord.lng - lng, 2)
          );
          return distance <= radius;
        });

        if (nearbyCCTVs.length > 0) {
          setFilteredCCTVs(nearbyCCTVs);
          
          // 역 geocoding으로 주소 가져오기
          Promise.all([
            fetch(`/api/geocode?lat=${lat}&lng=${lng}`).then(res => res.json()),
            fetch(`/api/vworld?lat=${lat}&lng=${lng}`).then(res => res.json()).catch(() => null),
          ])
            .then(([geocodeData, vworldData]) => {
              if (geocodeData.address) {
                setCurrentAddress(geocodeData.address);
                
                // 국가표준링크 정보 저장
                if (vworldData?.success) {
                  setCurrentStandardInfo(vworldData);
                }
                
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  text: `📍 현재 위치: ${geocodeData.address}\n🎥 주변 CCTV ${nearbyCCTVs.length}곳을 찾았습니다.`,
                  timestamp: new Date(),
                  sender: 'system',
                }]);
              }
            })
            .catch(() => {
              setCurrentAddress('위치 확인 중...');
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: `📍 현재 위치 근처\n🎥 주변 CCTV ${nearbyCCTVs.length}곳을 찾았습니다.`,
                timestamp: new Date(),
                sender: 'system',
              }]);
            });
        } else {
          // 주변에 CCTV가 없으면 전체 표시
          setFilteredCCTVs(allCCTVList);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `📍 현재 위치 주변에 CCTV가 없습니다.\n전체 CCTV ${allCCTVList.length}곳을 표시합니다.`,
            timestamp: new Date(),
            sender: 'system',
          }]);
        }
        
        setLocationLoaded(true);
        setShowCCTVList(true);
      } else if (geoError) {
        // 위치 권한 거부 시 전체 표시
        setFilteredCCTVs(allCCTVList);
        setShowCCTVList(true);
        setLocationLoaded(true);
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `ℹ️ 위치 권한이 필요합니다.\n전체 CCTV ${allCCTVList.length}곳을 표시합니다.\n\n💡 위치 기반 검색을 원하시면 브라우저 설정에서 위치 권한을 허용해주세요.`,
          timestamp: new Date(),
          sender: 'system',
        }]);
      } else {
        // 위치 로딩 중이면 전체 표시
        setFilteredCCTVs(allCCTVList);
        setShowCCTVList(true);
      }
    }
  }, [allCCTVList, location, geoError, locationLoaded]);

  // CCTV 목록 로드 시 국가표준링크 정보 미리 가져오기
  useEffect(() => {
    if (allCCTVList && allCCTVList.length > 0) {
      // 화면에 표시되는 CCTV에 대해서만 미리 로드 (성능 최적화)
      const visibleCCTVs = filteredCCTVs.length > 0 ? filteredCCTVs : allCCTVList.slice(0, 20); // 처음 20개만 미리 로드
      
      visibleCCTVs.forEach((cctv) => {
        // 이미 로드된 정보가 없으면 가져오기
        if (!cctvStandardInfo[cctv.id]) {
          fetch(`/api/vworld?lat=${cctv.coord.lat}&lng=${cctv.coord.lng}`)
            .then(res => res.json())
            .then(data => {
              if (data?.success) {
                setCctvStandardInfo(prev => ({
                  ...prev,
                  [cctv.id]: data,
                }));
              }
            })
            .catch(err => {
              console.error(`Failed to fetch standard info for CCTV ${cctv.id}:`, err);
            });
        }
      });
    }
  }, [allCCTVList, filteredCCTVs]);

  const handleCCTVClick = (cctv: CCTV) => {
    setSelectedCCTV(cctv);
    setIsSheetOpen(true);
    setShowVideo(false);
    
    // CCTV 좌표에 대한 국가표준링크 정보 가져오기
    if (!cctvStandardInfo[cctv.id]) {
      fetch(`/api/vworld?lat=${cctv.coord.lat}&lng=${cctv.coord.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data?.success) {
            setCctvStandardInfo(prev => ({
              ...prev,
              [cctv.id]: data,
            }));
          }
        })
        .catch(err => {
          console.error('Failed to fetch standard info for CCTV:', err);
        });
    }
    
    const systemMsg: Message = {
      id: Date.now().toString(),
      text: `${cctv.name} CCTV 영상을 확인합니다.`,
      timestamp: new Date(),
      sender: 'system',
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  const toggleFavorite = () => {
    if (!selectedCCTV) return;
    if (isFavorite(selectedCCTV.id)) {
      removeFavorite(selectedCCTV.id);
    } else {
      addFavorite(selectedCCTV);
    }
  };

  // 해시태그 클릭 핸들러
  const handleHashtagClick = (tag: string) => {
    setInputMessage(tag);
    performSearch(tag);
  };

  // 검색 이력 저장 헬퍼 함수
  const saveSearchHistory = (query: string, keyword: string, resultCount: number, nlpInfo?: any) => {
    if (typeof window !== 'undefined' && (window as any).addSearchHistory) {
      (window as any).addSearchHistory({
        query,
        keyword,
        resultCount,
        nlpInfo,
      });
    }
  };

  // 검색 수행 함수 (공통 로직)
  const performSearch = async (keyword: string, originalQuery?: string) => {
    if (!keyword.trim()) return;

    const displayQuery = originalQuery || keyword;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: displayQuery,
      timestamp: new Date(),
      sender: 'user',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    if (allCCTVList) {
      // 1단계: CCTV 이름 직접 검색
      const directResults = allCCTVList.filter(cctv => 
        cctv.name.includes(keyword) || 
        cctv.direction?.includes(keyword) ||
        keyword.includes(cctv.name.split(' ')[0])
      );

      if (directResults.length > 0) {
        setFilteredCCTVs(directResults);
        setShowCCTVList(true);

        // 검색 이력 저장
        saveSearchHistory(displayQuery, keyword, directResults.length, {
          originalQuery: displayQuery,
          extractedKeyword: keyword,
          matchType: 'direct',
        });

        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `✅ "${keyword}" 관련 CCTV ${directResults.length}곳을 찾았습니다.\n💡 키워드 추출: "${displayQuery}" → "${keyword}"`,
            timestamp: new Date(),
            sender: 'system',
          }]);
        }, 500);
        return;
      }

      // 2단계: 주소/지명으로 좌표 검색 (Geocoding)
      try {
        const response = await fetch(`/api/geocode?query=${encodeURIComponent(keyword)}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // 좌표 주변의 CCTV 검색 (반경 1km)
          const lat = data.lat;
          const lng = data.lng;
          const radius = 0.01;
          
          const nearbyResults = allCCTVList.filter(cctv => {
            const distance = Math.sqrt(
              Math.pow(cctv.coord.lat - lat, 2) + 
              Math.pow(cctv.coord.lng - lng, 2)
            );
            return distance <= radius;
          });

          if (nearbyResults.length > 0) {
            setFilteredCCTVs(nearbyResults);
            setShowCCTVList(true);
            
            // 검색 이력 저장
            saveSearchHistory(displayQuery, keyword, nearbyResults.length, {
              originalQuery: displayQuery,
              extractedKeyword: keyword,
              matchType: 'geocoding',
            });

            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: `📍 "${data.address}" 주변 CCTV ${nearbyResults.length}곳을 찾았습니다.\n💡 위치 검색: "${displayQuery}" → "${data.address}"`,
                timestamp: new Date(),
                sender: 'system',
              }]);
            }, 500);
            return;
          } else {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: `"${data.address}" 위치를 찾았지만 주변에 CCTV가 없습니다.`,
                timestamp: new Date(),
                sender: 'system',
              }]);
            }, 500);
            return;
          }
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
      }

      // 3단계: 검색 실패
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `❌ "${keyword}"에 대한 CCTV 정보를 찾을 수 없습니다.\n\n💡 팁:\n1. 샘플 데이터는 주요 도시만 포함됩니다\n2. 전국 CCTV를 보려면 헤더의 📹 버튼을 클릭하여\n   "국가 ITS" 또는 "통합 모드"로 변경하세요\n3. 검색 예시: 강남역, 춘천역, 부산 해운대`,
          timestamp: new Date(),
          sender: 'system',
        }]);
      }, 500);
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const originalQuery = inputMessage;
    const keyword = extractKeyword(inputMessage);
    console.log(`🔍 NLP 처리 | 원문: "${originalQuery}" → 키워드: "${keyword}"`);

    if (!keyword) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: '❌ 검색어를 인식할 수 없습니다.\n\n💡 이렇게 검색해보세요:\n• "강남역 보여줘"\n• "올림픽대로 상황"\n• "춘천 CCTV"\n• "부산 해운대"',
          timestamp: new Date(),
          sender: 'system',
        }]);
      }, 500);
      return;
    }

    // NLP 처리 중 메시지 추가
    if (originalQuery !== keyword) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '_nlp',
          text: `🔍 자연어 처리 중...\n\n입력: "${originalQuery}"\n추출된 키워드: "${keyword}"`,
          timestamp: new Date(),
          sender: 'system',
        }]);
      }, 200);
    }

    performSearch(keyword, originalQuery);
  };

  // 검색 이력에서 재검색
  const handleHistorySearch = (query: string) => {
    setInputMessage(query);
    const keyword = extractKeyword(query);
    performSearch(keyword || query, query);
  };

  const handleSearchClick = () => {
    setFilteredCCTVs(allCCTVList || []);
    setShowCCTVList(true);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: '전체 CCTV 목록을 불러왔습니다.',
      timestamp: new Date(),
      sender: 'system',
    }]);
  };

  // 모바일 환경 렌더링
  if (deviceInfo.isMobile) {
  return (
      <MobileLayout viewMode={viewMode} onViewModeChange={setViewMode} onHistorySearch={handleHistorySearch}>
        {viewMode === 'map' ? (
          // 지도 뷰
          <div className="h-full w-full">
            <MapContainer />
          </div>
        ) : (
          // 목록 뷰
          <div className="h-full flex flex-col bg-gray-50">
            {/* 모바일 메시지 입력창 - 상단 고정 */}
            <div className="bg-white border-b p-3 flex-shrink-0">
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="예: 강남역, 올림픽대로"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="text-sm"
                />
                <Button size="sm" onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {/* 해시태그 - 가로 스크롤 */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {hashtagKeywords.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleHashtagClick(tag)}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap flex-shrink-0"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* CCTV 그리드 - 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* 상태 정보 배너 */}
              <div className="mb-3 space-y-2">
                {/* 데이터 소스 */}
                <div className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border">
                  <span className="text-xs text-gray-600">데이터 소스</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      cctvSource === 'ktict' ? 'bg-green-50 text-green-700 border-green-300' :
                      cctvSource === 'its' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                      'bg-purple-50 text-purple-700 border-purple-300'
                    }`}
                  >
                    {getSourceName()}
                  </Badge>
                </div>
                {/* 현재 위치 */}
                {currentAddress && location && (
                  <div className="flex flex-col gap-2 bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span className="text-xs text-blue-800 font-medium truncate flex-1">{currentAddress}</span>
                    </div>
                    {/* 국가표준링크 정보 */}
                    {currentStandardInfo && (
                      <div className="text-[10px] text-gray-600 space-y-1">
                        {currentStandardInfo.administrative && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-medium">행정구역:</span>
                            <span>{[currentStandardInfo.administrative.sido, currentStandardInfo.administrative.sigungu, currentStandardInfo.administrative.dong].filter(Boolean).join(' ')}</span>
                          </div>
                        )}
                        {currentStandardInfo.coord && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-medium">좌표:</span>
                            <span>위도 {currentStandardInfo.coord.lat.toFixed(6)}, 경도 {currentStandardInfo.coord.lng.toFixed(6)}</span>
                            <span className="text-gray-400">({currentStandardInfo.coord.epsg})</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-gray-500">국가표준링크:</span>
                      {Object.entries(getStandardMapLinks(location.lat, location.lng, currentAddress || '현재 위치')).map(([key, url]) => (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:text-blue-800 underline px-1"
                        >
                          {getLinkName(key)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {/* 현재 위치가 있지만 주소가 아직 로드되지 않은 경우 */}
                {location && !currentAddress && (
                  <div className="flex flex-col gap-2 bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span className="text-xs text-blue-800 font-medium">위치 확인 중...</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-gray-500">국가표준링크:</span>
                      {Object.entries(getStandardMapLinks(location.lat, location.lng, '현재 위치')).map(([key, url]) => (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:text-blue-800 underline px-1"
                        >
                          {getLinkName(key)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-2 space-y-2">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCCTVs.length > 0 || (allCCTVList && allCCTVList.length > 0) ? (
              <>
                {/* 초기 안내 메시지 */}
                {filteredCCTVs.length === (allCCTVList?.length || 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-800 font-medium">
                      🎥 전국 CCTV {allCCTVList?.length || 0}곳
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      지역명이나 도로명을 검색해보세요
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {(filteredCCTVs.length > 0 ? filteredCCTVs : allCCTVList || []).map((cctv) => (
                    <Card
                      key={cctv.id}
                      className="cursor-pointer active:scale-95 transition-transform"
                      onClick={() => handleCCTVClick(cctv)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
                          <ImageViewer
                            src={cctv.imageUrl}
                            alt={cctv.name}
                            autoRefresh={false}
                          />
                          {cctv.status === 'NORMAL' && (
                            <Badge className="absolute top-1 right-1 text-xs bg-green-500">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        <div className="p-2">
                          <h3 className="font-semibold text-xs truncate" title={cctv.name}>
                            {cctv.name}
                          </h3>
                          {/* 국가표준링크 정보 */}
                          {cctvStandardInfo[cctv.id] && (
                            <div className="text-[10px] text-gray-500 mt-1 space-y-0.5">
                              {cctvStandardInfo[cctv.id].administrative && (
                                <div className="truncate">
                                  {[cctvStandardInfo[cctv.id].administrative.sido, cctvStandardInfo[cctv.id].administrative.sigungu].filter(Boolean).join(' ')}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className="text-[10px] text-gray-400">국가표준링크:</span>
                            {Object.entries(getStandardMapLinks(cctv.coord.lat, cctv.coord.lng, cctv.name)).slice(0, 3).map(([key, url]) => (
                              <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {getLinkName(key)}
                              </a>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">전국 CCTV 모니터링</p>
                <p className="text-xs mt-2">검색어를 입력하거나 해시태그를 클릭하세요</p>
                <p className="text-xs mt-1 text-gray-400">예: 강남역, 올림픽대로, 테헤란로</p>
              </div>
            )}
            </div>
          </div>
        )}

        {/* 모바일 CCTV 상세 시트 */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
            <div className="p-4 h-full flex flex-col">
              <SheetHeader className="mb-3 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-base">{selectedCCTV?.name || 'CCTV'}</SheetTitle>
                    {selectedCCTV?.status === 'NORMAL' && (
                      <Badge variant="default" className="bg-green-500 text-xs">LIVE</Badge>
                    )}
                  </div>
                  <SheetDescription className="text-xs">
                    {showVideo ? '라이브 스트리밍' : '실시간 이미지 (5초 갱신)'}
                  </SheetDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVideo(!showVideo)}
                    className="text-blue-500"
                  >
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorite}
                    className="text-yellow-500"
                  >
                    {selectedCCTV && isFavorite(selectedCCTV.id) ? (
                      <Star className="w-5 h-5 fill-current" />
                    ) : (
                      <Star className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </SheetHeader>
              
              <div className="flex-1 w-full bg-black rounded-lg overflow-hidden relative">
                {selectedCCTV && isSheetOpen && !showVideo && (
                  <ImageViewer 
                    src={selectedCCTV.imageUrl} 
                    alt={selectedCCTV.name}
                    autoRefresh={true}
                    refreshInterval={5000}
                  />
                )}
                {selectedCCTV && isSheetOpen && showVideo && (
                  <video 
                    controls 
                    autoPlay 
                    playsInline
                    className="w-full h-full"
                    src={selectedCCTV.cctvUrl}
                  >
                    브라우저가 비디오 재생을 지원하지 않습니다.
                  </video>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500 space-y-2">
                <p>ID: {selectedCCTV?.id} {selectedCCTV?.direction && `| ${selectedCCTV.direction}`}</p>
                {selectedCCTV && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-400">국가표준링크:</span>
                    {Object.entries(getStandardMapLinks(selectedCCTV.coord.lat, selectedCCTV.coord.lng, selectedCCTV.name)).map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {key === 'vworld' ? 'VWorld' : key === 'naver' ? '네이버' : key === 'kakao' ? '카카오' : '구글'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </MobileLayout>
    );
  }

  // 데스크톱 환경 렌더링
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎥 Show Me The CCTV</h1>
            <p className="text-sm text-gray-600">실시간 전국 CCTV 모니터링</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
                목록
              </Button>
              <Button
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className={`gap-2 ${viewMode === 'map' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <MapIcon className="w-4 h-4" />
                지도
              </Button>
            </div>
            <SearchHistory onSearchSelect={handleHistorySearch} />
            <UserGuide />
            <CCTVSettings />
            <AISettings />
            <ProgramInfo />
            <Badge variant="default" className="bg-green-500 hidden sm:inline-flex">
              LIVE
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'list' ? (
          <div className="h-full max-w-7xl mx-auto flex flex-col gap-4 p-4">
            <Card className="flex flex-col h-64 md:h-80 border-2 border-purple-200 shadow-lg">
              <CardHeader className="flex-shrink-0 pb-3 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span>💬 자연어 대화</span>
                  </div>
                  <Badge variant="outline" className="bg-white text-purple-700 border-purple-300">
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    실시간
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0 p-4 pt-0">
                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gradient-to-r from-purple-50 to-blue-50 text-gray-900 border border-purple-200 shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'opacity-70' : 'text-gray-500'}`}>
                          {msg.timestamp.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                </div>
                <div className="flex gap-2 flex-shrink-0 mb-2">
                  <Input
                    placeholder="예: 강남역 보여줘, 성수대교 상황 어때?"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button size="icon" onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {isLoading ? '로딩 중...' : `추천 검색어 (${hashtagKeywords.length}개)`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hashtagKeywords.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleHashtagClick(tag)}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors border border-blue-200 active:scale-95"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 flex flex-col min-h-0 border-2 border-blue-200 shadow-lg">
              <CardHeader className="flex-shrink-0 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex flex-col gap-2 text-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-600" />
                      <span>📹 CCTV 목록</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {filteredCCTVs.length}곳
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    {/* 현재 사용 중인 CCTV 소스 */}
                    <div className="flex items-center gap-2 text-sm font-normal">
                      <span className="text-gray-600">데이터 소스:</span>
                      <Badge 
                        variant="outline" 
                        className={`${
                          cctvSource === 'ktict' ? 'bg-green-50 text-green-700 border-green-300' :
                          cctvSource === 'its' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                          'bg-purple-50 text-purple-700 border-purple-300'
                        }`}
                      >
                        {getSourceName()}
                      </Badge>
                    </div>
                    {/* 현재 위치 정보 */}
                    {currentAddress && location && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-normal text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            현재 위치:
                          </span>
                          <span className="text-blue-800 font-medium">{currentAddress}</span>
                        </div>
                        {/* 국가표준링크 정보 */}
                        {currentStandardInfo && (
                          <div className="text-xs text-gray-500 ml-4 space-y-0.5">
                            {currentStandardInfo.administrative && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">행정구역:</span>
                                <span>{[currentStandardInfo.administrative.sido, currentStandardInfo.administrative.sigungu, currentStandardInfo.administrative.dong].filter(Boolean).join(' ')}</span>
                              </div>
                            )}
                            {currentStandardInfo.coord && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">좌표:</span>
                                <span>위도 {currentStandardInfo.coord.lat.toFixed(6)}, 경도 {currentStandardInfo.coord.lng.toFixed(6)}</span>
                                <span className="text-gray-400">({currentStandardInfo.coord.epsg})</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
                          <span>국가표준링크:</span>
                          {Object.entries(getStandardMapLinks(location.lat, location.lng, currentAddress || '현재 위치')).map(([key, url]) => (
                            <a
                              key={key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {getLinkName(key)}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {location && !currentAddress && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-normal text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                            </span>
                            주소 확인 중...
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
                          <span>국가표준링크:</span>
                          {Object.entries(getStandardMapLinks(location.lat, location.lng, '현재 위치')).map(([key, url]) => (
                            <a
                              key={key}
                              href={url}
            target="_blank"
            rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {getLinkName(key)}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 pt-0">
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-3 space-y-2">
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredCCTVs.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredCCTVs.map((cctv) => (
                      <Card
                        key={cctv.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleCCTVClick(cctv)}
                      >
                        <CardContent className="p-0">
                          <div className="relative aspect-video bg-gray-900">
                            <ImageViewer
                              src={cctv.imageUrl}
                              alt={cctv.name}
                              autoRefresh={false}
                            />
                            {cctv.status === 'NORMAL' && (
                              <Badge className="absolute top-1 right-1 text-xs bg-green-500">
                                정상
                              </Badge>
                            )}
                          </div>
                          <div className="p-2">
                            <h3 className="font-semibold text-xs truncate" title={cctv.name}>
                              {cctv.name}
                            </h3>
                            <p className="text-xs text-gray-500">ID: {cctv.id}</p>
                            {/* 국가표준링크 정보 */}
                            {cctvStandardInfo[cctv.id] && (
                              <div className="text-[10px] text-gray-500 mt-1 space-y-0.5">
                                {cctvStandardInfo[cctv.id].administrative && (
                                  <div className="truncate">
                                    {[cctvStandardInfo[cctv.id].administrative.sido, cctvStandardInfo[cctv.id].administrative.sigungu].filter(Boolean).join(' ')}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              <span className="text-[10px] text-gray-400">국가표준링크:</span>
                              {Object.entries(getStandardMapLinks(cctv.coord.lat, cctv.coord.lng, cctv.name)).slice(0, 3).map(([key, url]) => (
                                <a
                                  key={key}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {getLinkName(key)}
                                </a>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <p>검색 결과가 없습니다.</p>
                    <p className="text-sm mt-2">다른 검색어로 시도해보세요.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="w-full h-full">
            <MapContainer />
          </div>
        )}
      </div>

      {/* CCTV Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[70dvh] sm:h-[600px] rounded-t-xl p-0">
          <div className="p-6 h-full flex flex-col">
            <SheetHeader className="mb-4 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <SheetTitle>{selectedCCTV?.name || 'CCTV'}</SheetTitle>
                  {selectedCCTV?.status === 'NORMAL' && (
                    <Badge variant="default" className="bg-green-500">정상</Badge>
                  )}
                </div>
                <SheetDescription>
                  {showVideo ? 'LIVE 스트리밍' : '실시간 교통 상황 이미지 (5초마다 갱신)'}
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowVideo(!showVideo)}
                  className="text-blue-500 hover:text-blue-600"
                  title={showVideo ? '이미지 보기' : '영상 보기'}
                >
                  <Video className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFavorite}
                  className="text-yellow-500 hover:text-yellow-600"
                >
                  {selectedCCTV && isFavorite(selectedCCTV.id) ? (
                    <Star className="w-6 h-6 fill-current" />
                  ) : (
                    <Star className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </SheetHeader>
            
            <div className="flex-1 w-full bg-black rounded-lg overflow-hidden relative">
              {selectedCCTV && isSheetOpen && !showVideo && (
                <ImageViewer 
                  src={selectedCCTV.imageUrl} 
                  alt={selectedCCTV.name}
                  autoRefresh={true}
                  refreshInterval={5000}
                />
              )}
              {selectedCCTV && isSheetOpen && showVideo && (
                <video 
                  controls 
                  autoPlay 
                  playsInline
                  className="w-full h-full"
                  src={selectedCCTV.cctvUrl}
                >
                  브라우저가 비디오 재생을 지원하지 않습니다.
                </video>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500 space-y-2">
              <p>출처: {selectedCCTV?.source === 'ITS' ? '국가 ITS CCTV' : '기본형 (고화질)'}</p>
              <p className="text-xs">ID: {selectedCCTV?.id} {selectedCCTV?.direction && `| ${selectedCCTV.direction}`}</p>
              {/* 국가표준링크 정보 */}
              {selectedCCTV && cctvStandardInfo[selectedCCTV.id] && (
                <div className="text-xs text-gray-600 space-y-1 border-t pt-2 mt-2">
                  {cctvStandardInfo[selectedCCTV.id].administrative && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-medium">행정구역:</span>
                      <span>{[
                        cctvStandardInfo[selectedCCTV.id].administrative.sido,
                        cctvStandardInfo[selectedCCTV.id].administrative.sigungu,
                        cctvStandardInfo[selectedCCTV.id].administrative.dong
                      ].filter(Boolean).join(' ')}</span>
                    </div>
                  )}
                  {cctvStandardInfo[selectedCCTV.id].coord && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-medium">좌표:</span>
                      <span>위도 {cctvStandardInfo[selectedCCTV.id].coord.lat.toFixed(6)}, 경도 {cctvStandardInfo[selectedCCTV.id].coord.lng.toFixed(6)}</span>
                      <span className="text-gray-400">({cctvStandardInfo[selectedCCTV.id].coord.epsg})</span>
                    </div>
                  )}
                  {cctvStandardInfo[selectedCCTV.id].location?.roadName && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-medium">도로명:</span>
                      <span>{cctvStandardInfo[selectedCCTV.id].location.roadName}</span>
                    </div>
                  )}
                </div>
              )}
              {selectedCCTV && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400">국가표준링크:</span>
                  {Object.entries(getStandardMapLinks(selectedCCTV.coord.lat, selectedCCTV.coord.lng, selectedCCTV.name)).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
            target="_blank"
            rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
          >
                      {getLinkName(key)}
          </a>
                  ))}
                </div>
              )}
            </div>
        </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
