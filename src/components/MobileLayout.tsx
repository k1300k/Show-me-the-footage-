'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Map, Star, Settings, BookOpen, Info } from 'lucide-react';
import UserGuide from '@/components/UserGuide';
import AISettings from '@/components/AISettings';
import ProgramInfo from '@/components/ProgramInfo';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'favorites'>('home');

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
            <UserGuide />
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
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'home' 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">홈</span>
          </button>
          
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'map' 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <Map className={`w-6 h-6 ${activeTab === 'map' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">지도</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('favorites');
              window.location.href = '/favorites';
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'favorites' 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <Star className={`w-6 h-6 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">즐겨찾기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

