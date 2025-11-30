'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Map, Star, Settings, BookOpen, Info } from 'lucide-react';
import SearchHistory from '@/components/SearchHistory';
import UserGuide from '@/components/UserGuide';
import CCTVSettings from '@/components/CCTVSettings';
import AISettings from '@/components/AISettings';
import ProgramInfo from '@/components/ProgramInfo';

interface MobileLayoutProps {
  children: React.ReactNode;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  onHistorySearch?: (query: string) => void;
}

export default function MobileLayout({ children, viewMode, onViewModeChange, onHistorySearch }: MobileLayoutProps) {

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 모바일 헤더 - 컴팩트 */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              🎥 CCTV
              <Badge variant="default" className="bg-green-500 text-xs">LIVE</Badge>
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {onHistorySearch && <SearchHistory onSearchSelect={onHistorySearch} />}
            <UserGuide />
            <CCTVSettings />
            <AISettings />
            <ProgramInfo />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* 하단 네비게이션 바 - iOS 스타일 */}
      <div className="bg-white border-t shadow-lg flex-shrink-0 safe-area-bottom">
        <div className="grid grid-cols-3 h-16">
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              viewMode === 'list' 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <Home className={`w-6 h-6 ${viewMode === 'list' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">홈</span>
          </button>
          
          <button
            onClick={() => onViewModeChange('map')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              viewMode === 'map' 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <Map className={`w-6 h-6 ${viewMode === 'map' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">지도</span>
          </button>
          
          <button
            onClick={() => {
              window.location.href = '/favorites';
            }}
            className="flex flex-col items-center justify-center gap-1 transition-colors text-gray-500"
          >
            <Star className="w-6 h-6" />
            <span className="text-xs font-medium">즐겨찾기</span>
          </button>
        </div>
      </div>
    </div>
  );
}


