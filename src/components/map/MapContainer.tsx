'use client';

import { useState } from 'react';
import { Map, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCCTVData } from '@/hooks/useCCTVData';
import { useFavorites } from '@/hooks/useFavorites';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CCTV } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import ImageViewer from '@/components/player/ImageViewer';
import { Star, Video } from 'lucide-react';
import Link from 'next/link';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export default function MapContainer() {
  const [ isKakaoLoading, kakaoError ] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY as string,
    libraries: ['services', 'clusterer'],
  });

  const { location, isLoading: isGeoLoading, error: geoError } = useGeolocation();
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const { data: cctvList, isLoading: isCCTVLoading } = useCCTVData(bounds);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const defaultCenter = { lat: 37.5665, lng: 126.9780 };
  const center = location || defaultCenter;

  const handleMapCreate = (map: kakao.maps.Map) => {
    updateBounds(map);
  };

  const handleIdle = (map: kakao.maps.Map) => {
    updateBounds(map);
  };

  const updateBounds = (map: kakao.maps.Map) => {
    const b = map.getBounds();
    setBounds({
      minX: b.getSouthWest().getLng(),
      maxX: b.getNorthEast().getLng(),
      minY: b.getSouthWest().getLat(),
      maxY: b.getNorthEast().getLat(),
    });
  };

  const handleMarkerClick = (cctv: CCTV) => {
    setSelectedCCTV(cctv);
    setIsSheetOpen(true);
    setShowVideo(false);
  };

  const toggleFavorite = () => {
    if (!selectedCCTV) return;
    if (isFavorite(selectedCCTV.id)) {
      removeFavorite(selectedCCTV.id);
    } else {
      addFavorite(selectedCCTV);
    }
  };

  if (kakaoError) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-100 flex-col p-4 text-center">
        <p className="text-red-500 font-bold mb-2">지도 로드 실패</p>
        <p className="text-sm text-gray-600 mb-4">{kakaoError.message}</p>
        <p className="text-xs text-gray-500">.env.local 파일에 NEXT_PUBLIC_KAKAO_MAP_KEY를 설정해주세요.</p>
      </div>
    );
  }

  if (isKakaoLoading) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-100">
        <div className="space-y-4 text-center">
          <Skeleton className="w-[200px] h-[20px] rounded-full mx-auto" />
          <p className="text-muted-foreground">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (isGeoLoading) {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-gray-100 space-y-4">
        <Skeleton className="w-[200px] h-[20px] rounded-full" />
        <p className="text-muted-foreground">현재 위치를 찾고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh]">
      <Map
        center={center}
        style={{ width: '100%', height: '100%' }}
        level={5}
        onCreate={handleMapCreate}
        onIdle={handleIdle}
      >
        <MarkerClusterer
          averageCenter={true}
          minLevel={6}
        >
          {cctvList?.map((cctv) => (
            <MapMarker
              key={cctv.id}
              position={{ lat: cctv.coord.lat, lng: cctv.coord.lng }}
              title={cctv.name}
              clickable={true}
              onClick={() => handleMarkerClick(cctv)}
            />
          ))}
        </MarkerClusterer>

        {location && (
          <MapMarker 
            position={location}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
              size: { width: 24, height: 35 },
            }}
          />
        )}
      </Map>
      
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Link href="/favorites">
          <Button variant="secondary" size="icon" className="shadow-md">
            <Star className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {geoError && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-md text-xs max-w-xs text-center">
          위치 권한이 거부되어 서울시청 위치로 표시됩니다.
        </div>
      )}
      
      {isCCTVLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 px-4 py-2 rounded-full shadow-md text-sm animate-pulse">
          CCTV 정보를 불러오는 중...
        </div>
      )}

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
