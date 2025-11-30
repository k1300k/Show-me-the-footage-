'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, MessageSquare, Sparkles, Code2, MapPin, Search, Image } from 'lucide-react';

interface Version {
  version: string;
  date: string;
  title: string;
  prompts: string[];
  features: string[];
  improvements: string[];
  technical: string[];
}

const versions: Version[] = [
  {
    version: 'v1.0',
    date: '2025-11-29 초기',
    title: '프로젝트 초기 구성',
    prompts: [
      '@prd.mdc 수행해 주시고, 반영될 때 마다 github 업데이트 해 주세요.',
      '실행해 주세요',
    ],
    features: [
      'Next.js 14+ (App Router) 프로젝트 생성',
      'TypeScript Strict Mode 설정',
      'Tailwind CSS + Shadcn/UI 통합',
      'Zustand 상태 관리',
      'React Query 데이터 페칭',
      'KT ICT CCTV API 연동',
    ],
    improvements: [
      'PRD(Product Requirements Document) 기반 체계적 설계',
      '모바일 퍼스트 반응형 디자인',
      'CCTV 썸네일 자동 갱신 (5초)',
    ],
    technical: [
      'Next.js API Routes로 CORS 해결',
      'React Query로 캐싱 및 자동 리페치',
      'Shadcn/UI 컴포넌트 시스템',
    ],
  },
  {
    version: 'v1.1',
    date: '2025-11-29 오전',
    title: '자연어 검색 및 목록 뷰 구현',
    prompts: [
      '우선 간단하게 cctv를 요청하면 썸내일 정도만 나오는 방식으로 1차로 구성해 주세요',
      '검색창 밑에 cctv 대표명들 해시태그# 달아서 바로 찾게 해 주세요',
      'cctv 이름과 매칭되는 정보로 구성해 주세요. # 제안을',
    ],
    features: [
      '자연어 처리 검색 시스템',
      '메시지 기반 대화형 UI',
      '동적 해시태그 생성 (CCTV 이름 기반)',
      'CCTV 썸네일 그리드 목록',
      '즐겨찾기 기능 (로컬 스토리지)',
    ],
    improvements: [
      '키워드 자동 추출 ("강남역 보여줘" → "강남역")',
      '검색 결과 실시간 필터링',
      '해시태그 빠른 검색 (8~15개)',
    ],
    technical: [
      'NLP 키워드 추출 알고리즘',
      '정규식 기반 자연어 처리',
      'useMemo를 통한 해시태그 최적화',
    ],
  },
  {
    version: 'v1.2',
    date: '2025-11-29 오후',
    title: '지도 통합 (Kakao → Leaflet)',
    prompts: [
      'https://wikidocs.net/294002 카카오맵은 이것으로 연결이 될까요',
      '키를 어떻게 받나요',
      '지도 로드 실패 .env.local 파일에 NEXT_PUBLIC_KAKAO_MAP_KEY를 설정해주세요.',
      '지도 방식이 현재 문제가 있는 거 같습니다. 다른 방식이나 다른 api 고려해 주세요.',
      '1 (네이버 지도 또는 Leaflet 선택 → Leaflet 선택)',
    ],
    features: [
      'Leaflet + OpenStreetMap 지도 통합',
      'API 키 불필요한 오픈소스 지도',
      '목록/지도 뷰 토글 버튼',
      '지도 범위 기반 CCTV 로드',
      'CCTV 마커 클러스터링',
    ],
    improvements: [
      '카카오맵 의존성 제거',
      'SSR 호환성 개선 (Dynamic Import)',
      'React 19 완벽 호환',
      '즉시 사용 가능 (API 키 불필요)',
    ],
    technical: [
      'react-leaflet 라이브러리',
      'Dynamic Import로 클라이언트 전용 렌더링',
      'MapBoundsUpdater 커스텀 훅',
    ],
  },
  {
    version: 'v1.3',
    date: '2025-11-29 저녁',
    title: '지도 UI/UX 개선',
    prompts: [
      '지도에도 메세지 창 넣어주시고 cctv 좌표값으로 지도 위에 아이콘으로 구성해 주세요',
      '검색 된 cctv 썸네일 표출과 위치 보여주세요',
    ],
    features: [
      '지도 상단 오버레이 검색창',
      '커스텀 CCTV 아이콘 (파란색 카메라)',
      '검색 결과 강조 아이콘 (주황색 + 바운스)',
      '하단 썸네일 패널 (가로 스크롤)',
      '현재 위치 펄스 애니메이션',
      '지도 중심 자동 이동',
    ],
    improvements: [
      '검색 시 지도+썸네일 동시 표시',
      '썸네일 클릭 → 지도 이동 + 영상 시트',
      '검색 결과 시각적 구분 (색상+애니메이션)',
      'CCTV 좌표 정보 팝업 표시',
    ],
    technical: [
      'L.divIcon으로 커스텀 마커',
      'CSS keyframes 애니메이션',
      'MapCenterController 컴포넌트',
      '검색 결과 state 기반 조건부 렌더링',
    ],
  },
  {
    version: 'v1.4',
    date: '2025-11-29 밤',
    title: '검색 기능 안정화 및 디버깅',
    prompts: [
      '안 나오네요',
      '지도위에 cctv 안 나오는데 좌표가 없나요',
      '검색을 하면 반응이 없습니다.',
      'cctv 목록이 지도 위에 몇개나 있나요',
    ],
    features: [
      '10개 CCTV 샘플 데이터 최적화',
      '검색 디버깅 테스트 버튼',
      '상태 확인 버튼',
      '실시간 콘솔 로깅',
      'CCTV 개수 표시 배지',
      '서울 전역 최적 뷰포트',
    ],
    improvements: [
      'useCCTVData 데이터 접근 오류 수정',
      '검색 이벤트 핸들러 강화',
      '초기 bounds 설정으로 전체 CCTV 로드',
      'onKeyDown으로 Enter 키 처리 개선',
    ],
    technical: [
      'React Hook 데이터 플로우 디버깅',
      '이벤트 버블링 및 핸들러 검증',
      '콘솔 로깅 시스템 구축',
      '초기 상태 최적화 (bounds, zoom)',
    ],
  },
  {
    version: 'v1.5',
    date: '2025-11-30',
    title: '지명/주소 기반 검색 확장',
    prompts: [
      '네이버지도의 지명 동명 주소명에 속한 좌표로 cctv를 검색할 수 있을까요',
      '지하철역이나 주요 랜드마트 등도 포함되는 거죠',
    ],
    features: [
      '100개 이상 지하철역 데이터베이스',
      '주요 랜드마크 20개 (코엑스, 롯데타워 등)',
      '주요 대학교 7개 (서울대, 연대, 고대 등)',
      '한강 교량 9개',
      '주요 도로 11개',
      '네이버 Geocoding API 통합',
      '주소 → 좌표 변환 시스템',
      '반경 1km 내 CCTV 자동 검색',
    ],
    improvements: [
      '3단계 검색 알고리즘 (이름→주소→내장DB)',
      '검색 범위 대폭 확장 (10배 이상)',
      '지명/건물명/역명 통합 검색',
      'Fallback 지역 데이터 30개 → 100개',
    ],
    technical: [
      'Naver Geocoding API 프록시',
      '거리 계산 알고리즘 (Euclidean)',
      'async/await 검색 파이프라인',
      'API 키 선택적 사용 (없어도 작동)',
    ],
  },
  {
    version: 'v1.6',
    date: '2025-11-30',
    title: 'AI 통합 및 모바일 최적화',
    prompts: [
      '프로그램 개발 이력 및 프롬프트 기반 정보 추가',
      '현재 질의 방식은 ai를 사용하지 않은 것으로 알고 있습니다. ai를 활용하려면 어떻게 해야 하나요',
      '상황에 따라 달라지니 ai 셋팅 화면을 구성해 주세요',
      '사용설명서 추가해 주세요',
      '모바일에서 접근할 경우를 고려해 모바일 버전으로 별도 구성해 주세요',
    ],
    features: [
      'AI 설정 화면 (OpenAI, Gemini, Claude)',
      'API 키 관리 및 테스트',
      '프로그램 개발 이력 모달',
      '전체 프롬프트 이력 표시',
      '사용설명서 (8개 섹션)',
      'FAQ 및 문제 해결',
      '모바일 전용 레이아웃',
      '하단 네비게이션 바',
      'PWA 매니페스트',
      '터치 최적화',
      'Safe Area 지원',
    ],
    improvements: [
      'AI 엔진 선택 및 실시간 테스트',
      '디바이스 자동 감지 (useDeviceDetect)',
      '모바일 2열 / 데스크톱 4열 그리드',
      '반응형 해시태그 (스크롤 vs 래핑)',
      '85vh 모바일 시트 / 600px 데스크톱',
      '브라우저 로컬 스토리지 AI 설정 저장',
    ],
    technical: [
      'OpenAI/Gemini/Claude API 통합 준비',
      'Sonner Toast 알림 시스템',
      'useDeviceDetect 커스텀 훅',
      '조건부 레이아웃 렌더링',
      'CSS Safe Area Inset',
      'PWA manifest.json',
      'Viewport 메타데이터 분리',
    ],
  },
];

export default function ProgramInfo() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Info className="w-5 h-5" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Code2 className="w-6 h-6 text-blue-500" />
            Show Me The CCTV - 개발 이력
          </DialogTitle>
          <DialogDescription className="text-base">
            바이브코딩 프롬프트 방식으로 구현된 프로그램의 진화 과정
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 서비스 소개 */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                바이브코딩 프롬프트 기반 개발
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">
                이 프로그램은 <strong>자연어 프롬프트</strong>만으로 개발된 
                AI 협업 프로젝트입니다. 개발자가 원하는 기능을 대화하듯 설명하면,
                AI가 즉시 코드를 생성하고 개선합니다.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-sm mb-1">📝 프롬프트 기반</div>
                  <p className="text-xs text-gray-600">
                    코드 작성 없이 자연어로 개발
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-sm mb-1">⚡ 빠른 구현</div>
                  <p className="text-xs text-gray-600">
                    아이디어에서 실행까지 수 시간
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-sm mb-1">🔄 반복 개선</div>
                  <p className="text-xs text-gray-600">
                    실시간 피드백으로 즉시 수정
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-sm mb-1">📚 학습 가능</div>
                  <p className="text-xs text-gray-600">
                    모든 프롬프트 이력 보존
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 버전별 이력 */}
          {versions.map((v, idx) => (
            <Card key={v.version} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="default" className="bg-blue-600">
                      {v.version}
                    </Badge>
                    <span className="text-lg">{v.title}</span>
                  </CardTitle>
                  <span className="text-sm text-gray-500">{v.date}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 사용자 프롬프트 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold text-sm">실제 사용자 프롬프트</h4>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                    {v.prompts.map((prompt, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-purple-600 font-mono">💬</span>
                        <p className="text-gray-700 italic">"{prompt}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 추가된 기능 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm">추가된 기능</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {v.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs bg-green-50 p-2 rounded">
                        <span className="text-green-600">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 개선사항 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold text-sm">주요 개선사항</h4>
                  </div>
                  <ul className="space-y-1">
                    {v.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-orange-600">→</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 기술적 구현 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-sm">기술적 구현</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {v.technical.map((tech, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 통계 요약 */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {versions.length}
                  </div>
                  <div className="text-sm text-gray-600">버전</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {versions.reduce((acc, v) => acc + v.prompts.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">프롬프트</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {versions.reduce((acc, v) => acc + v.features.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">기능</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">
                    {versions.reduce((acc, v) => acc + v.improvements.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">개선</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

