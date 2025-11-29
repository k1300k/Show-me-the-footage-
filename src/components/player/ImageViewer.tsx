'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageViewerProps {
  src: string;
  alt?: string;
  autoRefresh?: boolean; // 자동 새로고침 (CCTV 썸네일용)
  refreshInterval?: number; // 새로고침 간격 (ms)
}

export default function ImageViewer({ 
  src, 
  alt = 'CCTV 이미지',
  autoRefresh = true,
  refreshInterval = 5000, // 5초마다 새로고침
}: ImageViewerProps) {
  const [error, setError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageUrl, setImageUrl] = React.useState(src);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  // 이미지 새로고침 (캐시 방지용 타임스탬프 추가)
  const refreshImage = React.useCallback(() => {
    const timestamp = new Date().getTime();
    setImageUrl(`${src}?t=${timestamp}`);
    setLastUpdate(new Date());
    setIsLoading(true);
    setError(false);
  }, [src]);

  // 자동 새로고침
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshImage();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshImage]);

  // src 변경 시 초기화
  React.useEffect(() => {
    refreshImage();
  }, [src]);

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden group">
      {/* Image Element */}
      {!error && (
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
        />
      )}

      {/* Loading Spinner */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white p-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-sm mb-4">이미지를 불러올 수 없습니다.</p>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={refreshImage}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </div>
      )}

      {/* Refresh Button & Last Update Time */}
      {!error && (
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
            {lastUpdate.toLocaleTimeString('ko-KR')}
          </span>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-black/50 hover:bg-black/70"
            onClick={refreshImage}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
