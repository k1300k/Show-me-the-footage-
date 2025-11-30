'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Check, Info } from 'lucide-react';
import { toast } from 'sonner';

interface CCTVConfig {
  source: 'ktict' | 'its' | 'both';
}

const CCTV_SOURCES = {
  ktict: {
    name: 'KT ICT CCTV',
    description: 'KT ICT 실시간 CCTV (고화질)',
    icon: '📹',
    coverage: '전국 주요 도로 및 교차로',
    quality: '높음',
    features: ['실시간 썸네일 (5초 갱신)', 'HLS 라이브 스트리밍', '고화질 영상'],
    status: '정상',
  },
  its: {
    name: '국가 ITS CCTV',
    description: '국토교통부 교통정보센터 CCTV',
    icon: '🚗',
    coverage: '전국 국도 및 고속도로',
    quality: '중간',
    features: ['국가 공공 데이터', '전국 광범위 커버리지', 'API 키 필요'],
    status: '정상',
  },
  both: {
    name: '통합 모드',
    description: 'KT ICT + 국가 ITS 통합',
    icon: '🔄',
    coverage: '전국 모든 CCTV',
    quality: '혼합',
    features: ['최대 CCTV 개수', '다양한 위치', '통합 검색'],
    status: '정상',
  },
};

export default function CCTVSettings() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<CCTVConfig>({
    source: 'its', // 기본값: 국가 ITS
  });

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedConfig = localStorage.getItem('cctv_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (e) {
        console.error('Failed to parse CCTV config:', e);
      }
    }
  }, []);

  // 설정 저장
  const handleSave = () => {
    try {
      localStorage.setItem('cctv_config', JSON.stringify(config));
      toast.success(`✅ CCTV 소스 설정 완료`, {
        description: `${CCTV_SOURCES[config.source].name}로 변경되었습니다.`,
      });
      setOpen(false);
      
      // 페이지 새로고침하여 새 소스로 데이터 로드
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error('설정 저장 실패', {
        description: '다시 시도해주세요.',
      });
    }
  };

  const currentSource = CCTV_SOURCES[config.source];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100"
          title="CCTV 소스 설정"
        >
          <Camera className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Camera className="w-6 h-6" />
            CCTV 소스 설정
          </DialogTitle>
          <DialogDescription>
            사용할 CCTV 데이터 소스를 선택하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 현재 소스 정보 */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-2xl">{currentSource.icon}</span>
                현재 사용 중: {currentSource.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {currentSource.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">커버리지:</span>
                <Badge variant="outline">{currentSource.coverage}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">화질:</span>
                <Badge variant="outline">{currentSource.quality}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">상태:</span>
                <Badge className="bg-green-500">{currentSource.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 소스 선택 */}
          <div className="space-y-3">
            <Label htmlFor="cctv-source" className="text-base font-semibold">
              CCTV 소스 선택
            </Label>
            <Select
              value={config.source}
              onValueChange={(value: 'ktict' | 'its' | 'both') =>
                setConfig({ ...config, source: value })
              }
            >
              <SelectTrigger id="cctv-source" className="w-full">
                <SelectValue placeholder="CCTV 소스 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="its">
                  <div className="flex items-center gap-2">
                    <span>🚗</span>
                    <span>국가 ITS CCTV (기본)</span>
                  </div>
                </SelectItem>
                <SelectItem value="ktict">
                  <div className="flex items-center gap-2">
                    <span>📹</span>
                    <span>KT ICT CCTV</span>
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <span>🔄</span>
                    <span>통합 모드 (KT ICT + 국가 ITS)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 소스별 상세 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">📋 소스별 상세 정보</h3>
            
            {Object.entries(CCTV_SOURCES).map(([key, source]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  config.source === key
                    ? 'border-2 border-blue-500 shadow-md'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setConfig({ source: key as 'ktict' | 'its' | 'both' })}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{source.icon}</span>
                      {source.name}
                    </div>
                    {config.source === key && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {source.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">주요 기능:</p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {source.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 안내 메시지 */}
          {config.source === 'its' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold mb-1">📝 국가 ITS API 안내</p>
                <p>국가 ITS CCTV를 사용하려면 공공데이터포털에서 API 키를 발급받아야 합니다.</p>
                <p className="mt-1">
                  <a
                    href="https://www.data.go.kr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    공공데이터포털 바로가기 →
                  </a>
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  API 키가 없어도 샘플 데이터로 테스트할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {config.source === 'both' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">🔄 통합 모드 안내</p>
                <p>KT ICT와 국가 ITS의 CCTV를 모두 표시합니다.</p>
                <p className="mt-1">최대한 많은 CCTV를 확인할 수 있습니다.</p>
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              💾 설정 저장 및 적용
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

