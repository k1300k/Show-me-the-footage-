'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 환경 변수가 설정되어 있는지 확인
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    setIsConfigured(!!key && key !== 'your_kakao_map_key_here');
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      title: '1. 카카오 개발자 사이트 접속',
      description: '카카오 개발자 콘솔에 로그인하세요',
      link: 'https://developers.kakao.com/',
      linkText: 'Kakao Developers 열기',
    },
    {
      title: '2. 애플리케이션 등록',
      description: '내 애플리케이션 > 애플리케이션 추가하기',
      details: [
        '앱 이름: "Show Me The CCTV" (또는 원하는 이름)',
        '회사명: 선택사항',
        '저장 버튼 클릭',
      ],
    },
    {
      title: '3. JavaScript 키 복사',
      description: '생성된 앱 선택 > 앱 키 > JavaScript 키 복사',
    },
    {
      title: '4. Web 플랫폼 등록',
      description: '플랫폼 메뉴 > Web 플랫폼 등록',
      copyText: 'http://localhost:3001',
      details: [
        '사이트 도메인에 아래 주소를 입력하세요:',
        'http://localhost:3001',
      ],
    },
  ];

  const envContent = `# KT ICT CCTV Database
DB_HOST=cctvdb1.ktict.co.kr
DB_PORT=1433
DB_USER=user_hdauto
DB_PASSWORD=e(oYgFXQ)UYW6(%N
DB_NAME=cctv

# CCTV Stream Account
CCTV_CO_NAME=mnsoft
CCTV_SERVICE_NAME=mnsoftmonitor
CCTV_STREAM_BASE=http://stream.ktict.co.kr

# Kakao Map API Key (복사한 JavaScript 키를 여기에 붙여넣기)
NEXT_PUBLIC_KAKAO_MAP_KEY=${apiKey || '여기에_복사한_JavaScript_키_붙여넣기'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">🗺️ Show Me The CCTV</h1>
          <p className="text-gray-600">카카오맵 API 설정 가이드</p>
        </div>

        {/* Status Card */}
        {isConfigured ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <p className="font-semibold">설정 완료!</p>
                  <p className="text-sm">카카오맵 API 키가 이미 설정되어 있습니다.</p>
                </div>
              </div>
              <Link href="/">
                <Button className="w-full mt-4">지도 보러 가기 →</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-yellow-800 text-sm">
                ⚠️ 카카오맵 API 키가 설정되지 않았습니다. 아래 가이드를 따라 설정해주세요.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Steps */}
        {steps.map((step, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {step.details && (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {step.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              )}
              {step.link && (
                <a href={step.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {step.linkText}
                  </Button>
                </a>
              )}
              {step.copyText && (
                <div className="flex gap-2">
                  <Input value={step.copyText} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(step.copyText!)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* API Key Input */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>5. API 키 입력 (선택)</CardTitle>
            <CardDescription>
              복사한 JavaScript 키를 입력하면 .env.local 파일 내용을 자동 생성합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="예: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
          </CardContent>
        </Card>

        {/* .env.local Content */}
        <Card>
          <CardHeader>
            <CardTitle>6. .env.local 파일 생성</CardTitle>
            <CardDescription>
              프로젝트 루트 폴더에 .env.local 파일을 만들고 아래 내용을 복사하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                {envContent}
              </pre>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(envContent)}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    복사
                  </>
                )}
              </Button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>📁 파일 위치:</strong> /Users/john/Show-me-the-footage-/.env.local
            </div>
          </CardContent>
        </Card>

        {/* Final Step */}
        <Card className="border-2 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle>7. 서버 재시작</CardTitle>
            <CardDescription>파일 저장 후 서버를 재시작하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <div># 터미널에서 Ctrl+C로 서버 중단 후</div>
              <div className="text-green-400">npm run dev</div>
            </div>
            <Link href="/">
              <Button className="w-full" size="lg">
                완료! 지도 보러 가기 🎉
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Help */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 text-center">
              문제가 있으신가요?{' '}
              <a
                href="https://developers.kakao.com/docs/latest/ko/getting-started/app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                카카오 개발자 가이드 보기
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

