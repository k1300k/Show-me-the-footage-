'use client';

import { useState, useEffect } from 'react';
import { useCCTVData } from '@/hooks/useCCTVData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import ImageViewer from '@/components/player/ImageViewer';
import { CCTV } from '@/types';
import { Star, Send, MessageSquare, Video, Search, Hash } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'system';
}

// 인기 CCTV 해시태그 목록
const POPULAR_CCTV_TAGS = [
  '강남역',
  '신촌역',
  '광화문',
  '서울역',
  '올림픽대로',
  '한강대교',
  '마포대교',
  '여의도',
  '잠실',
  '홍대',
  '이태원',
  '명동',
];

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
  const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showCCTVList, setShowCCTVList] = useState(false);
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
  const performSearch = (keyword: string) => {
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
      const results = allCCTVList.filter(cctv => 
        cctv.name.includes(keyword) || cctv.direction?.includes(keyword)
      );

      setFilteredCCTVs(results);
      setShowCCTVList(true);

      setTimeout(() => {
        let responseText = '';
        if (results.length > 0) {
          responseText = `"${keyword}" 관련 CCTV ${results.length}곳을 찾았습니다.`;
        } else {
          responseText = `"${keyword}"에 대한 CCTV 정보를 찾을 수 없습니다. 다른 지역을 검색해보세요.`;
        }

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: responseText,
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎥 Show Me The CCTV</h1>
            <p className="text-sm text-gray-600">실시간 전국 CCTV 모니터링</p>
          </div>
          <Badge variant="default" className="bg-green-500">
            LIVE
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto flex flex-col gap-4 p-4">
          
          {/* Top: Message Box */}
          <Card className="flex flex-col h-64 md:h-80">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5" />
                메시지
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-4 pt-0">
              {/* Messages */}
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

              {/* Input */}
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

              {/* 해시태그 영역 */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">인기 검색어</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CCTV_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleHashtagClick(tag)}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors border border-blue-200"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom: CCTV List */}
          {showCCTVList ? (
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
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <CardContent className="text-center space-y-4 py-20">
                <Search className="w-16 h-16 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    어디를 보고 싶으신가요?
                  </h3>
                  <p className="text-gray-500 mb-4">
                    "강남역 보여줘", "올림픽대로 상황" 처럼<br/>
                    자연스럽게 물어보세요!
                  </p>
                  <Button onClick={handleSearchClick} variant="outline">
                    전체 목록 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
