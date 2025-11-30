'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History, X, Search, ArrowRight, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SearchRecord {
  id: string;
  query: string;
  keyword: string;
  resultCount: number;
  timestamp: Date;
  nlpInfo?: {
    originalQuery: string;
    extractedKeyword: string;
    matchType: 'direct' | 'geocoding' | 'nlp';
  };
}

interface SearchHistoryProps {
  onSearchSelect: (query: string) => void;
}

export default function SearchHistory({ onSearchSelect }: SearchHistoryProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<SearchRecord[]>([]);

  // 로컬 스토리지에서 검색 이력 불러오기
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('search_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Date 객체로 변환
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(historyWithDates);
      }
    } catch (e) {
      console.error('Failed to load search history:', e);
    }
  };

  // 검색 이력 추가 (외부에서 호출)
  const addSearchRecord = (record: Omit<SearchRecord, 'id' | 'timestamp'>) => {
    const newRecord: SearchRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    const updatedHistory = [newRecord, ...history].slice(0, 20); // 최대 20개
    setHistory(updatedHistory);
    
    try {
      localStorage.setItem('search_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to save search history:', e);
    }
  };

  // 전역에서 접근 가능하도록 window 객체에 추가
  useEffect(() => {
    (window as any).addSearchHistory = addSearchRecord;
    return () => {
      delete (window as any).addSearchHistory;
    };
  }, [history]);

  // 이력 삭제
  const deleteRecord = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    
    try {
      localStorage.setItem('search_history', JSON.stringify(updatedHistory));
      toast.success('검색 이력 삭제', {
        description: '선택한 이력이 삭제되었습니다.',
      });
    } catch (e) {
      console.error('Failed to delete search record:', e);
    }
  };

  // 전체 이력 삭제
  const clearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('search_history');
      toast.success('전체 삭제 완료', {
        description: '모든 검색 이력이 삭제되었습니다.',
      });
    } catch (e) {
      console.error('Failed to clear search history:', e);
    }
  };

  // 이력 선택
  const handleSelect = (query: string) => {
    onSearchSelect(query);
    setOpen(false);
    toast.success('검색 실행', {
      description: `"${query}" 검색 결과를 불러옵니다.`,
    });
  };

  // 시간 포맷
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  // 매칭 타입 배지
  const getMatchTypeBadge = (matchType?: string) => {
    switch (matchType) {
      case 'direct':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">직접 매칭</Badge>;
      case 'geocoding':
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">위치 검색</Badge>;
      case 'nlp':
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">자연어 처리</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100"
          title="검색 이력"
        >
          <History className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-6 h-6" />
              검색 이력
            </div>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllHistory}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                전체 삭제
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            최근 검색한 내용과 자연어 처리 결과를 확인하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">검색 이력이 없습니다</p>
              <p className="text-xs mt-2">검색을 시작하면 이곳에 기록됩니다</p>
            </div>
          ) : (
            history.map((record) => (
              <Card
                key={record.id}
                className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                onClick={() => handleSelect(record.query)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{record.query}</span>
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {formatTime(record.timestamp)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRecord(record.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* 검색 결과 */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">검색 결과:</span>
                    <Badge variant="secondary">{record.resultCount}곳</Badge>
                  </div>

                  {/* 자연어 처리 정보 */}
                  {record.nlpInfo && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-900">자연어 처리 결과</span>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 w-20">원문:</span>
                          <span className="text-gray-900 font-medium">{record.nlpInfo.originalQuery}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-purple-600 ml-20" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 w-20">키워드:</span>
                          <Badge className="bg-purple-600">{record.nlpInfo.extractedKeyword}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 w-20">매칭 방식:</span>
                          {getMatchTypeBadge(record.nlpInfo.matchType)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 추출된 키워드만 있는 경우 */}
                  {!record.nlpInfo && record.keyword !== record.query && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">추출 키워드:</span>
                      <Badge variant="outline" className="bg-blue-50">{record.keyword}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              💡 검색 이력은 최대 20개까지 저장되며, 브라우저에만 보관됩니다.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

