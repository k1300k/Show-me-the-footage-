'use client';

import { useState, useCallback } from 'react';
import { Map, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCCTVData } from '@/hooks/useCCTVData';
import { Skeleton } from '@/components/ui/skeleton';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export default function MapContainer() {
  const { location, isLoading: isGeoLoading, error: geoError } = useGeolocation();
  const [bounds, setBounds] = useState<Bounds | null>(null);
  
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
              onClick={(marker) => {
                // TODO: Open Video Player
                console.log('Clicked CCTV:', cctv);
              }}
            >
              <div style={{ padding: "5px", color: "#000" }}>
                {cctv.name}
              </div>
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
      
      {/* Loading Indicator for CCTV Data */}
      {isCCTVLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 px-4 py-2 rounded-full shadow-md text-sm">
          CCTV 정보를 불러오는 중...
        </div>
      )}
    </div>
  );
}
