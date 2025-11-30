'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Settings, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIConfig {
  engine: 'none' | 'openai' | 'gemini' | 'claude';
  apiKey: string;
  enabled: boolean;
}

interface AIEngineInfo {
  name: string;
  description: string;
  color: string;
  icon: string;
  requiresKey: boolean;
  pricing: string;
  link?: string;
}

const AI_ENGINES: Record<'none' | 'openai' | 'gemini' | 'claude', AIEngineInfo> = {
  none: {
    name: '사용 안 함',
    description: '기본 키워드 매칭 방식',
    color: 'gray',
    icon: '🔍',
    requiresKey: false,
    pricing: '무료',
  },
  openai: {
    name: 'OpenAI GPT-4',
    description: '가장 강력한 자연어 처리',
    color: 'green',
    icon: '🤖',
    requiresKey: true,
    pricing: '유료 (토큰당 과금)',
    link: 'https://platform.openai.com/api-keys',
  },
  gemini: {
    name: 'Google Gemini',
    description: '무료 티어 제공, 한국어 우수',
    color: 'blue',
    icon: '✨',
    requiresKey: true,
    pricing: '무료 티어 가능',
    link: 'https://aistudio.google.com/app/apikey',
  },
  claude: {
    name: 'Anthropic Claude',
    description: '정확한 분석, 긴 컨텍스트',
    color: 'purple',
    icon: '🧠',
    requiresKey: true,
    pricing: '유료 (토큰당 과금)',
    link: 'https://console.anthropic.com/settings/keys',
  },
};

export default function AISettings() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AIConfig>({
    engine: 'none',
    apiKey: '',
    enabled: false,
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (e) {
        console.error('Failed to parse AI config:', e);
      }
    }
  }, []);

  // 설정 저장
  const handleSave = () => {
    try {
      localStorage.setItem('ai_config', JSON.stringify(config));
      toast.success(`✅ 설정 저장 완료`, {
        description: `${AI_ENGINES[config.engine].name} 설정이 저장되었습니다.`,
      });
      setOpen(false);
    } catch (e) {
      toast.error("❌ 저장 실패", {
        description: "설정을 저장하는 중 오류가 발생했습니다.",
      });
    }
  };

  // API 키 테스트
  const handleTest = async () => {
    if (config.engine === 'none') {
      toast.info("ℹ️ 테스트 불필요", {
        description: "AI 엔진을 선택하지 않았습니다.",
      });
      return;
    }

    if (!config.apiKey) {
      toast.error("⚠️ API 키 필요", {
        description: "API 키를 입력해주세요.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          engine: config.engine,
          apiKey: config.apiKey,
        }),
      });

      if (response.ok) {
        setTestResult('success');
        toast.success("✅ 연결 성공", {
          description: `${AI_ENGINES[config.engine].name} API 키가 유효합니다.`,
        });
      } else {
        setTestResult('error');
        toast.error("❌ 연결 실패", {
          description: "API 키를 확인해주세요.",
        });
      }
    } catch (error) {
      setTestResult('error');
      toast.error("❌ 테스트 실패", {
        description: "네트워크 오류가 발생했습니다.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const currentEngine = AI_ENGINES[config.engine];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings className="w-5 h-5" />
          {config.enabled && config.engine !== 'none' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-500" />
            AI 검색 설정
          </DialogTitle>
          <DialogDescription>
            AI를 활용하여 더 똑똑한 CCTV 검색을 경험하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* AI 엔진 선택 */}
          <div className="space-y-3">
            <Label htmlFor="engine" className="text-base font-semibold">
              AI 엔진 선택
            </Label>
            <Select
              value={config.engine}
              onValueChange={(value: AIConfig['engine']) => {
                setConfig({ ...config, engine: value });
                setTestResult(null);
              }}
            >
              <SelectTrigger id="engine">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AI_ENGINES).map(([key, engine]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{engine.icon}</span>
                      <span>{engine.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {engine.pricing}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 선택된 엔진 정보 */}
          <Card className={`border-2 border-${currentEngine.color}-200 bg-${currentEngine.color}-50`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{currentEngine.icon}</span>
                {currentEngine.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {currentEngine.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">가격:</span>
                <Badge variant="outline">{currentEngine.pricing}</Badge>
              </div>
              {currentEngine.link && (
                <div className="pt-2 border-t">
                  <a
                    href={currentEngine.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    🔗 API 키 발급 받기
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API 키 입력 */}
          {currentEngine.requiresKey && (
            <div className="space-y-3">
              <Label htmlFor="apiKey" className="text-base font-semibold">
                API 키
              </Label>
              <div className="space-y-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-... 또는 API 키 입력"
                  value={config.apiKey}
                  onChange={(e) => {
                    setConfig({ ...config, apiKey: e.target.value });
                    setTestResult(null);
                  }}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">
                  ⚠️ API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.
                </p>
              </div>
            </div>
          )}

          {/* 테스트 버튼 */}
          {currentEngine.requiresKey && config.apiKey && (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleTest}
                disabled={isTesting}
                variant="outline"
                className="flex-1"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    테스트 중...
                  </>
                ) : (
                  '🧪 연결 테스트'
                )}
              </Button>
              {testResult === 'success' && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>연결 성공</span>
                </div>
              )}
              {testResult === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>연결 실패</span>
                </div>
              )}
            </div>
          )}

          {/* AI 기능 활성화 */}
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div>
              <p className="font-semibold">AI 검색 활성화</p>
              <p className="text-sm text-gray-600">
                {config.enabled ? 'AI가 검색을 도와줍니다' : 'AI 기능이 비활성화되어 있습니다'}
              </p>
            </div>
            <Button
              variant={config.enabled ? 'default' : 'outline'}
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            >
              {config.enabled ? '활성화됨' : '비활성화'}
            </Button>
          </div>

          {/* 저장 버튼 */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              className="flex-1"
              size="lg"
            >
              💾 설정 저장
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              size="lg"
            >
              취소
            </Button>
          </div>

          {/* 안내 정보 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <h4 className="font-semibold text-sm mb-2">💡 AI 검색 기능</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• 자연어로 복잡한 질문 가능</li>
                <li>• 상황에 맞는 CCTV 추천</li>
                <li>• 교통 상황 분석 및 설명</li>
                <li>• 대화형 인터페이스</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

