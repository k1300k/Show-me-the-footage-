'use client';

import { useFavorites } from '@/hooks/useFavorites';
import VideoPlayer from '@/components/player/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  // Simple state to handle client-side rendering to avoid hydration mismatch with localstorage
  // In a real app, we might use a useEffect to wait for mount, but zustand persist usually handles this if configured right.
  // However, with Next.js SSR, we need to ensure we only render after mount.
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">내 관심 CCTV</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>등록된 즐겨찾기가 없습니다.</p>
            <p className="text-sm mt-2">지도에서 ⭐ 버튼을 눌러 추가해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((cctv) => (
              <Card key={cctv.id} className="overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">{cctv.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8"
                    onClick={() => removeFavorite(cctv.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0 aspect-video bg-black">
                  <VideoPlayer src={cctv.cctvUrl} autoPlay={false} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

