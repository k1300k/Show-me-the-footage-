'use client';

import { useState } from 'react';
import { Map, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCCTVData } from '@/hooks/useCCTVData';
import { useFavorites } from '@/hooks/useFavorites';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CCTV } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import ImageViewer from '@/components/player/ImageViewer';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export default function MapContainer() {
  // Load Kakao Maps SDK
  const [ isKakaoLoading, kakaoError ] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY as string,
    libraries: ['services', 'clusterer'],
  });

  const { location, isLoading: isGeoLoading, error: geoError } = useGeolocation();
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { data: cctvList, isLoading: isCCTVLoading } = useCCTVData(bounds);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Default center (Seoul City Hall)
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
  };

  const toggleFavorite = () => {
    if (!selectedCCTV) return;
    if (isFavorite(selectedCCTV.id)) {
      removeFavorite(selectedCCTV.id);
    } else {
      addFavorite(selectedCCTV);
    }
  };

  // 1. Check Kakao SDK Error
  if (kakaoError) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-100 flex-col p-4 text-center">
        <p className="text-red-500 font-bold mb-2">지도 로드 실패</p>
        <p className="text-sm text-gray-600 mb-4">{kakaoError.message}</p>
        <p className="text-xs text-gray-500">.env.local 파일에 NEXT_PUBLIC_KAKAO_MAP_KEY가 올바르게 설정되었는지 확인해주세요.</p>
      </div>
    );
  }

  // 2. Check Kakao SDK Loading
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

  // 3. Check Geolocation Loading
  if (isGeoLoading) {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-gray-100 space-y-4">
        <Skeleton className="w-[200px] h-[20px] rounded-full" />
        <p className="text-muted-foreground">현재 위치를 찾고 있습니다...</p>
      </div>
    );
  }

  // 4. Check Geolocation Error (위치 권한 거부는 치명적이지 않으므로 기본 위치로 진행)
  // if (geoError) { ... } 대신 경고만 표시

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
            >
            </MapMarker>
          ))}
        </MarkerClusterer>

        {/* Current User Marker */}
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
      
      {/* Top Bar Actions */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Link href="/favorites">
          <Button variant="secondary" size="icon" className="shadow-md">
            <Star className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Geolocation Warning */}
      {geoError && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-md text-xs max-w-xs text-center">
          위치 권한이 거부되어 서울시청 위치로 표시됩니다.
        </div>
      )}
      
      {/* Loading Indicator */}
      {isCCTVLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 px-4 py-2 rounded-full shadow-md text-sm animate-pulse">
          CCTV 정보를 불러오는 중...
        </div>
      )}

      {/* CCTV Image Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[60dvh] sm:h-[500px] rounded-t-xl p-0">
          <div className="p-6 h-full flex flex-col">
            <SheetHeader className="mb-4 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <SheetTitle>{selectedCCTV?.name || 'CCTV'}</SheetTitle>
                <SheetDescription>
                  실시간 교통 상황 이미지입니다.
                </SheetDescription>
              </div>
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
            </SheetHeader>
            
            <div className="flex-1 w-full bg-black rounded-lg overflow-hidden relative">
              {selectedCCTV && isSheetOpen && selectedCCTV.imageUrl && (
                 <ImageViewer src={selectedCCTV.imageUrl} alt={selectedCCTV.name} />
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>출처: {selectedCCTV?.source === 'SEOUL' ? '서울시 CCTV' : '국가교통정보센터'}</p>
              <p className="text-xs mt-1">※ 현재는 샘플 이미지가 표시됩니다.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
