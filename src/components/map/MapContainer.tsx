'use client';

import { useState, useCallback } from 'react';
import { Map, MapMarker, MarkerClusterer } from 'react-kakao-maps-sdk';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCCTVData } from '@/hooks/useCCTVData';
import { Skeleton } from '@/components/ui/skeleton';
import { CCTV } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import VideoPlayer from '@/components/player/VideoPlayer';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export default function MapContainer() {
  const { location, isLoading: isGeoLoading, error: geoError } = useGeolocation();
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { data: cctvList, isLoading: isCCTVLoading } = useCCTVData(bounds);

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

  if (isGeoLoading) {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-gray-100 space-y-4">
        <Skeleton className="w-[200px] h-[20px] rounded-full" />
        <p className="text-muted-foreground">현재 위치를 찾고 있습니다...</p>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-100">
        <p className="text-red-500">위치 정보를 가져올 수 없습니다: {geoError}</p>
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
            >
              {/* Marker InfoWindow (Optional, minimal) */}
              {/* <div style={{ padding: "5px", color: "#000" }}>{cctv.name}</div> */}
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
      
      {/* Loading Indicator */}
      {isCCTVLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 px-4 py-2 rounded-full shadow-md text-sm animate-pulse">
          CCTV 정보를 불러오는 중...
        </div>
      )}

      {/* Video Player Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[60dvh] sm:h-[500px] rounded-t-xl p-0">
          <div className="p-6 h-full flex flex-col">
            <SheetHeader className="mb-4">
              <SheetTitle>{selectedCCTV?.name || 'CCTV'}</SheetTitle>
              <SheetDescription>
                실시간 교통 영상을 확인합니다.
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 w-full bg-black rounded-lg overflow-hidden relative">
              {selectedCCTV && isSheetOpen && (
                 <VideoPlayer src={selectedCCTV.cctvUrl} />
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>출처: {selectedCCTV?.source === 'EX' ? '한국도로공사' : '국가교통정보센터(ITS)'}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
