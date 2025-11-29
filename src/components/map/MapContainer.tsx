'use client';

import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Skeleton } from '@/components/ui/skeleton';

export default function MapContainer() {
  const { location, isLoading, error } = useGeolocation();

  // Default center (Seoul City Hall) if location fails or is loading
  const defaultCenter = { lat: 37.5665, lng: 126.9780 };
  
  const center = location || defaultCenter;

  if (isLoading) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-100">
        <div className="text-center space-y-4">
          <Skeleton className="w-[200px] h-[20px] rounded-full" />
          <p className="text-muted-foreground">현재 위치를 찾고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center">
        <p className="text-red-500">위치 정보를 가져올 수 없습니다: {error}</p>
      </div>
    );
  }

  return (
    <Map
      center={center}
      style={{ width: '100%', height: '100dvh' }}
      level={3}
    >
      {/* Current User Marker */}
      {location && (
        <MapMarker position={location}>
          <div className="p-1 text-xs">내 위치</div>
        </MapMarker>
      )}
    </Map>
  );
}

