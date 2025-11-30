'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCCTVData } from '@/hooks/useCCTVData';
import { useFavorites } from '@/hooks/useFavorites';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CCTV } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import ImageViewer from '@/components/player/ImageViewer';
import { Star, Video, Send, MessageSquare, Hash } from 'lucide-react';
import Link from 'next/link';
import L from 'leaflet';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

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
    
    // 괄호 안의 내용 추출
    const parenthesesMatch = name.match(/\(([^)]+)\)/);
    if (parenthesesMatch) {
      const inside = parenthesesMatch[1];
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
  
  return Array.from(keywordSet).sort().slice(0, 15);
};

// 키워드 추출 함수
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

// CCTV 커스텀 아이콘
const cctvIcon = L.divIcon({
  html: `
    <div style="
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M23 4v2h-1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6H1V4h7V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h7zM4 6v13h16V6H4zm6-1h4V4h-4v1zm3 5.732V14a1 1 0 1 1-2 0v-3.268a2 2 0 1 1 2 0z"/>
      </svg>
    </div>
  `,
  className: 'custom-cctv-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// 검색된 CCTV 강조 아이콘 (주황색)
const cctvHighlightIcon = L.divIcon({
  html: `
    <div style="
      background: #f97316;
      border: 3px solid white;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(249,115,22,0.5);
      cursor: pointer;
      animation: bounce 1s infinite;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M23 4v2h-1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6H1V4h7V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h7zM4 6v13h16V6H4zm6-1h4V4h-4v1zm3 5.732V14a1 1 0 1 1-2 0v-3.268a2 2 0 1 1 2 0z"/>
      </svg>
    </div>
  `,
  className: 'custom-cctv-highlight-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// 현재 위치 커스텀 아이콘
const locationIcon = L.divIcon({
  html: `
    <div style="
      background: #ef4444;
      border: 3px solid white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    "></div>
  `,
  className: 'custom-location-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// 지도 범위 업데이트 컴포넌트
function MapBoundsUpdater({ onBoundsChange }: { onBoundsChange: (bounds: Bounds) => void }) {
  const map = useMap();

  useEffect(() => {
    const updateBounds = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        minX: bounds.getWest(),
        maxX: bounds.getEast(),
        minY: bounds.getSouth(),
        maxY: bounds.getNorth(),
      });
    };

    updateBounds();
    map.on('moveend', updateBounds);
    
    return () => {
      map.off('moveend', updateBounds);
    };
  }, [map, onBoundsChange]);

  return null;
}

// 지도 중심 이동 컴포넌트
function MapCenterController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  
  return null;
}

export default function MapContainer() {
  const [isClient, setIsClient] = useState(false);
  const { location, isLoading: isGeoLoading } = useGeolocation();
  // 초기 bounds를 서울 전체를 포함하도록 설정
  const [bounds, setBounds] = useState<Bounds>({
    minX: 126.0,
    maxX: 128.0,
    minY: 36.0,
    maxY: 38.0,
  });
  const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '지도에서 CCTV를 검색하거나 마커를 클릭해주세요.',
      timestamp: new Date(),
      sender: 'system',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [searchResults, setSearchResults] = useState<CCTV[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const { data: cctvList, isLoading: isCCTVLoading } = useCCTVData(bounds);
  const cctvArray = cctvList || [];
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // 디버깅: CCTV 목록 확인 및 안내 메시지 업데이트
  useEffect(() => {
    console.log('📡 CCTV List loaded:', cctvArray.length, 'items');
    if (cctvArray.length > 0) {
      console.log('📍 Sample CCTVs:');
      cctvArray.slice(0, 5).forEach(cctv => {
        console.log(`  - ${cctv.name} (${cctv.id}) at [${cctv.coord.lat}, ${cctv.coord.lng}]`);
      });
      
      // 처음 로드되었을 때 안내 메시지 업데이트
      if (messages.length === 1) {
        setMessages([
          {
            id: '1',
            text: `CCTV ${cctvArray.length}개를 불러왔습니다. 검색창에서 "강남", "논현", "역삼" 등을 검색해보세요!`,
            timestamp: new Date(),
            sender: 'system',
          },
        ]);
      }
    }
  }, [cctvArray]);

  // 서울 전체 CCTV를 볼 수 있는 중심점과 줌 레벨
  const defaultCenter: [number, number] = [37.5400, 127.0000]; // 서울 중심
  const defaultZoom = 12; // 서울 전체가 보이는 줌 레벨
  
  const center: [number, number] = location 
    ? [location.lat, location.lng] 
    : defaultCenter;

  // 해시태그 키워드 추출
  const hashtagKeywords = useMemo(() => {
    if (!cctvArray || cctvArray.length === 0) {
      return ['강남역', '신촌역', '광화문', '서울역', '올림픽대로', '한강대교', '마포대교', '여의도', '잠실', '홍대'];
    }
    return extractKeywordsFromCCTVs(cctvArray);
  }, [cctvArray]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMarkerClick = (cctv: CCTV) => {
    setSelectedCCTV(cctv);
    setIsSheetOpen(true);
    setShowVideo(false);
    
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

  // 검색 수행 함수
  const performSearch = async (keyword: string) => {
    if (!keyword.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: keyword,
      timestamp: new Date(),
      sender: 'user',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    console.log('🔍 Searching for:', keyword);
    console.log('📦 Available CCTVs:', cctvArray.length);

    // 1단계: CCTV 이름 직접 검색
    if (cctvArray && cctvArray.length > 0) {
      const directResults = cctvArray.filter(cctv => 
        cctv.name.includes(keyword) || 
        cctv.direction?.includes(keyword) ||
        keyword.includes(cctv.name.split(' ')[0])
      );

      if (directResults.length > 0) {
        console.log('✅ Direct search results:', directResults.length);
        setSearchResults(directResults);
        setShowSearchResults(true);
        
        const firstResult = directResults[0];
        setSearchCenter([firstResult.coord.lat, firstResult.coord.lng]);
        
        console.log('📍 Moving to:', firstResult.name, firstResult.coord);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `"${keyword}" 관련 CCTV ${directResults.length}곳을 찾았습니다.`,
            timestamp: new Date(),
            sender: 'system',
          }]);
        }, 500);
        return;
      }
    }

    // 2단계: 주소/지명으로 좌표 검색 (Geocoding)
    console.log('🌍 Trying geocoding for:', keyword);
    
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(keyword)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Geocoding success:', data);
        
        // 좌표 주변의 CCTV 검색 (반경 1km)
        const lat = data.lat;
        const lng = data.lng;
        const radius = 0.01; // 약 1km
        
        const nearbyResults = cctvArray.filter(cctv => {
          const distance = Math.sqrt(
            Math.pow(cctv.coord.lat - lat, 2) + 
            Math.pow(cctv.coord.lng - lng, 2)
          );
          return distance <= radius;
        });

        if (nearbyResults.length > 0) {
          console.log('✅ Nearby CCTVs found:', nearbyResults.length);
          setSearchResults(nearbyResults);
          setShowSearchResults(true);
          setSearchCenter([lat, lng]);
          
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: `"${data.address}" 주변 CCTV ${nearbyResults.length}곳을 찾았습니다.`,
              timestamp: new Date(),
              sender: 'system',
            }]);
          }, 500);
          return;
        } else {
          // 좌표는 찾았지만 주변에 CCTV 없음
          setSearchCenter([lat, lng]);
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: `"${data.address}" 위치를 찾았지만 주변에 CCTV가 없습니다. 지도를 확인해주세요.`,
              timestamp: new Date(),
              sender: 'system',
            }]);
          }, 500);
          return;
        }
      }
    } catch (error) {
      console.error('❌ Geocoding failed:', error);
    }

    // 3단계: 검색 실패
    setSearchResults([]);
    setShowSearchResults(false);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `"${keyword}"에 대한 결과를 찾을 수 없습니다. 다른 키워드를 시도해보세요.\n(예: 강남역, 서초동, 테헤란로)`,
        timestamp: new Date(),
        sender: 'system',
      }]);
    }, 500);
  };

  // CCTV 썸네일 클릭 핸들러
  const handleThumbnailClick = (cctv: CCTV) => {
    setSearchCenter([cctv.coord.lat, cctv.coord.lng]);
    handleMarkerClick(cctv);
  };

  const sendMessage = () => {
    console.log('🚀 sendMessage called, input:', inputMessage);
    
    if (!inputMessage.trim()) {
      console.log('⚠️ Empty input');
      return;
    }

    const keyword = extractKeyword(inputMessage);
    console.log(`✂️ Extracted Keyword: "${keyword}" from "${inputMessage}"`);

    if (!keyword) {
      console.log('⚠️ No keyword extracted');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: '검색할 장소명을 정확히 입력해주세요.',
          timestamp: new Date(),
          sender: 'system',
        }]);
      }, 500);
      return;
    }

    performSearch(keyword);
  };

  // 디버그용 즉시 검색 함수
  const testSearch = (keyword: string) => {
    console.log('🧪 Test search for:', keyword);
    setInputMessage(keyword);
    performSearch(keyword);
  };

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="space-y-4 text-center">
          <Skeleton className="w-[200px] h-[20px] rounded-full mx-auto" />
          <p className="text-muted-foreground">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (isGeoLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 space-y-4">
        <Skeleton className="w-[200px] h-[20px] rounded-full" />
        <p className="text-muted-foreground">현재 위치를 찾고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* 지도 */}
      <LeafletMap
        center={center}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater onBoundsChange={setBounds} />
        <MapCenterController center={searchCenter} />

        {/* CCTV 마커 */}
        {cctvArray.map((cctv) => {
          const isSearchResult = searchResults.some(result => result.id === cctv.id);
          return (
            <Marker
              key={cctv.id}
              position={[cctv.coord.lat, cctv.coord.lng]}
              icon={isSearchResult ? cctvHighlightIcon : cctvIcon}
              eventHandlers={{
                click: () => handleMarkerClick(cctv),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{cctv.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {cctv.coord.lat.toFixed(4)}, {cctv.coord.lng.toFixed(4)}
                  </p>
                  {isSearchResult && (
                    <Badge className="mt-1 text-xs bg-orange-500">검색 결과</Badge>
                  )}
                  <p className="text-xs text-blue-600 mt-1">클릭하여 영상 보기</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 현재 위치 마커 */}
        {location && (
          <Marker position={[location.lat, location.lng]} icon={locationIcon} />
        )}
      </LeafletMap>

      {/* 메시지 창 (상단 오버레이) */}
      <div className="absolute top-4 left-4 z-[1000] max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4" />
              검색
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 최근 메시지 1개만 표시 */}
            <div className="max-h-20 overflow-y-auto space-y-2">
              {messages.slice(-1).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg px-3 py-1.5 ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-xs">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 검색 입력 */}
            <div className="flex gap-2">
              <Input
                placeholder="예: 강남역, 올림픽대로"
                value={inputMessage}
                onChange={(e) => {
                  console.log('📝 Input changed:', e.target.value);
                  setInputMessage(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    console.log('⏎ Enter pressed');
                    sendMessage();
                  }
                }}
                className="text-sm"
              />
              <Button 
                size="sm" 
                onClick={() => {
                  console.log('🖱️ Send button clicked');
                  sendMessage();
                }}
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>

            {/* 디버그 테스트 버튼 */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => testSearch('강남')}
                className="text-xs"
              >
                테스트: 강남
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => testSearch('논현')}
                className="text-xs"
              >
                테스트: 논현
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  console.log('📊 Current state:');
                  console.log('  - CCTVs:', cctvArray.length);
                  console.log('  - First CCTV:', cctvArray[0]);
                }}
                className="text-xs"
              >
                상태확인
              </Button>
            </div>

            {/* 해시태그 */}
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <Hash className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">추천 검색어</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hashtagKeywords.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleHashtagClick(tag)}
                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors border border-blue-200 active:scale-95"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 결과 썸네일 목록 (하단 오버레이) */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <Card className="shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">
                검색 결과 ({searchResults.length}개)
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchResults(false)}
                className="h-6 px-2 text-xs"
              >
                닫기
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {searchResults.map((cctv) => (
                  <div
                    key={cctv.id}
                    onClick={() => handleThumbnailClick(cctv)}
                    className="flex-shrink-0 w-40 cursor-pointer hover:scale-105 transition-transform"
                  >
                    <Card className="overflow-hidden">
                      <div className="relative aspect-video bg-gray-900">
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
                      <div className="p-2 bg-white">
                        <p className="text-xs font-semibold truncate" title={cctv.name}>
                          {cctv.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          📍 {cctv.coord.lat.toFixed(3)}, {cctv.coord.lng.toFixed(3)}
                        </p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 즐겨찾기 버튼 */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Link href="/favorites">
          <Button variant="secondary" size="icon" className="shadow-md">
            <Star className="w-5 h-5" />
          </Button>
        </Link>
      </div>
      
      {/* CCTV 개수 및 위치 정보 표시 */}
      {cctvArray.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/95 px-4 py-2 rounded-lg shadow-lg text-sm">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-blue-500">
              🎥 CCTV {cctvArray.length}개
            </Badge>
            <div className="text-xs text-gray-600">
              서울 전역 분포 | 🔵 일반 🟠 검색결과
            </div>
          </div>
        </div>
      )}
      
      {/* 로딩 표시 */}
      {isCCTVLoading && cctvArray.length === 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 px-4 py-2 rounded-full shadow-md text-sm">
          <Badge variant="default" className="bg-gray-500">
            데이터 불러오는 중...
          </Badge>
        </div>
      )}

      {/* CCTV 상세 정보 시트 */}
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

            <div className="mt-4 text-sm text-gray-500">
              <p>출처: KT ICT CCTV</p>
              <p className="text-xs mt-1">
                좌표: {selectedCCTV?.coord.lat.toFixed(4)}, {selectedCCTV?.coord.lng.toFixed(4)} | 
                ID: {selectedCCTV?.id} {selectedCCTV?.direction && `| ${selectedCCTV.direction}`}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
