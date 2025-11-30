'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useCCTVData } from '@/hooks/useCCTVData';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
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
      text: '안녕하세요! 전국 CCTV 실시간 영상 서비스입니다.',
      timestamp: new Date(),
      sender: 'system',
    },
    {
      id: '2',
      text: '원하시는 지역이나 도로명을 말씀해주세요. (예: "강남역 보여줘")',
      timestamp: new Date(),
      sender: 'system',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const { data: allCCTVList, isLoading } = useCCTVData({
    minX: 126.0, maxX: 128.0, minY: 36.0, maxY: 38.0
  });
  
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // CCTV 목록에서 해시태그 키워드 추출
  const hashtagKeywords = useMemo(() => {
    if (!allCCTVList || allCCTVList.length === 0) {
      // 기본 해시태그 (로딩 중이거나 데이터 없을 때)
      return ['강남역', '신촌역', '광화문', '서울역', '올림픽대로', '한강대교', '마포대교', '여의도', '잠실', '홍대'];
    }
    return extractKeywordsFromCCTVs(allCCTVList);
  }, [allCCTVList]);

  useEffect(() => {
    if (allCCTVList) {
      setFilteredCCTVs(allCCTVList);
    }
  }, [allCCTVList]);

  const handleCCTVClick = (cctv: CCTV) => {
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

  // 검색 수행 함수 (공통 로직)
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
          text: `"${keyword}"에 대한 CCTV 정보를 찾을 수 없습니다.\n(예: 강남역, 서초동, 테헤란로)`,
          timestamp: new Date(),
          sender: 'system',
        }]);
      }, 500);
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const keyword = extractKeyword(inputMessage);
    console.log(`Extracted Keyword: ${keyword}`);

    if (!keyword) {
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
      <MobileLayout>
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
            ) : filteredCCTVs.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredCCTVs.map((cctv) => (
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">검색어를 입력해주세요</p>
                <p className="text-xs mt-2">예: 강남역, 올림픽대로</p>
              </div>
            )}
          </div>
        </div>

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

              <div className="mt-3 text-xs text-gray-500">
                <p>ID: {selectedCCTV?.id} {selectedCCTV?.direction && `| ${selectedCCTV.direction}`}</p>
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
            <UserGuide />
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
            <Card className="flex flex-col h-64 md:h-80">
              <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5" />
                  메시지
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
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {msg.timestamp.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
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
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle className="text-lg">
                  검색 결과 ({filteredCCTVs.length}개)
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

            <div className="mt-4 text-sm text-gray-500">
              <p>출처: KT ICT CCTV</p>
              <p className="text-xs mt-1">ID: {selectedCCTV?.id} {selectedCCTV?.direction && `| ${selectedCCTV.direction}`}</p>
            </div>
        </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
