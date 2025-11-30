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
import { 
  BookOpen, 
  Play, 
  Search, 
  Map, 
  List,
  Video,
  Star,
  Settings,
  Info,
  MessageSquare,
  Hash,
  MapPin,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface GuideSection {
  icon: any;
  title: string;
  description: string;
  steps: string[];
  tips?: string[];
}

const guideSections: GuideSection[] = [
  {
    icon: Play,
    title: '1️⃣ 시작하기',
    description: '처음 사용하시는 분들을 위한 기본 가이드',
    steps: [
      '브라우저에서 http://localhost:3000 접속',
      '화면 상단에 "🎥 Show Me The CCTV" 헤더 확인',
      '기본적으로 목록 뷰가 표시됩니다',
      '위치 권한 요청 시 "허용" 클릭 (선택사항)',
    ],
    tips: [
      '💡 위치 권한을 허용하면 내 주변 CCTV를 먼저 볼 수 있습니다',
      '💡 권한 없이도 모든 기능을 사용할 수 있습니다',
    ],
  },
  {
    icon: List,
    title: '2️⃣ 목록 뷰 사용하기',
    description: 'CCTV 목록과 메시지 검색 활용',
    steps: [
      '상단 "목록" 버튼이 선택되어 있는지 확인',
      '메시지 창에 자연어로 입력: "강남역 보여줘"',
      'Enter 키 또는 전송 버튼 클릭',
      '하단에 검색 결과 썸네일 표시',
      '썸네일 클릭 시 실시간 영상 확인',
    ],
    tips: [
      '💡 해시태그를 클릭하면 빠르게 검색할 수 있습니다',
      '💡 자연스럽게 질문하세요: "올림픽대로 상황 어때?"',
    ],
  },
  {
    icon: Map,
    title: '3️⃣ 지도 뷰 사용하기',
    description: '지도에서 CCTV 위치 확인 및 검색',
    steps: [
      '상단 "지도" 버튼 클릭',
      '서울 전역 지도와 CCTV 아이콘 확인',
      '🔵 파란색 카메라: 일반 CCTV',
      '🟠 주황색 카메라: 검색된 CCTV',
      '마커 클릭 시 영상 확인',
    ],
    tips: [
      '💡 지도를 확대/축소하여 원하는 지역 탐색',
      '💡 검색창에서 검색 시 자동으로 해당 위치로 이동',
      '💡 하단 썸네일 클릭 시 해당 CCTV로 이동',
    ],
  },
  {
    icon: Search,
    title: '4️⃣ 검색 방법',
    description: '다양한 검색 방식 활용',
    steps: [
      '**자연어 검색**: "강남역 보여줘", "올림픽대로 교통"',
      '**해시태그**: #강남역, #올림픽대로 클릭',
      '**CCTV 이름**: 지역명, 역명, 도로명 직접 입력',
      '**주소 검색**: "서초동", "테헤란로 152", "역삼동 123" 등',
      '**지도 검색**: 지도 뷰에서 검색 시 위치 자동 이동',
    ],
    tips: [
      '💡 CCTV 이름: 강남, 논현, 역삼, 잠실, 신촌, 광화문 등',
      '💡 주소/지명: 동명, 번지, 도로명 모두 가능',
      '💡 네이버 지도 API 설정 시 더 정확한 주소 검색',
      '💡 불필요한 조사는 자동으로 제거됩니다',
    ],
  },
  {
    icon: Video,
    title: '5️⃣ CCTV 영상 보기',
    description: 'CCTV 실시간 영상 확인 및 제어',
    steps: [
      'CCTV 썸네일 또는 지도 마커 클릭',
      '하단 시트에 영상 표시',
      '📹 버튼: 썸네일 ↔ 라이브 영상 전환',
      '⭐ 버튼: 즐겨찾기 추가/제거',
      '시트 외부 클릭 시 닫기',
    ],
    tips: [
      '💡 썸네일은 5초마다 자동 갱신됩니다',
      '💡 라이브 영상은 HLS 스트리밍 방식',
      '💡 좌표 정보도 함께 표시됩니다',
    ],
  },
  {
    icon: Star,
    title: '6️⃣ 즐겨찾기 관리',
    description: '자주 보는 CCTV를 저장하고 관리',
    steps: [
      'CCTV 영상 시트에서 ⭐ 버튼 클릭',
      '우측 상단 ⭐ 아이콘으로 즐겨찾기 목록 이동',
      '저장된 CCTV 목록 확인',
      '삭제 버튼으로 제거 가능',
    ],
    tips: [
      '💡 즐겨찾기는 브라우저에 저장됩니다',
      '💡 로그인 없이 사용 가능',
    ],
  },
  {
    icon: Settings,
    title: '7️⃣ AI 설정',
    description: 'AI를 활용한 똑똑한 검색 설정',
    steps: [
      '헤더 우측 ⚙️ 설정 버튼 클릭',
      'AI 엔진 선택 (OpenAI, Gemini, Claude)',
      'API 키 입력',
      '🧪 연결 테스트 클릭',
      'AI 검색 활성화 토글',
      '💾 설정 저장',
    ],
    tips: [
      '💡 AI 없이도 기본 검색 사용 가능',
      '💡 Google Gemini는 무료 티어 제공',
      '💡 API 키는 브라우저에만 저장됩니다',
    ],
  },
  {
    icon: Info,
    title: '8️⃣ 개발 이력 보기',
    description: '프로그램이 어떻게 만들어졌는지 확인',
    steps: [
      '헤더 우측 ℹ️ 정보 버튼 클릭',
      '바이브코딩 프롬프트 방식 소개 확인',
      '버전별 개발 이력 탐색 (v1.0 ~ v1.4)',
      '실제 사용자 프롬프트 확인',
      '추가된 기능 및 개선사항 확인',
    ],
    tips: [
      '💡 모든 프롬프트가 기록되어 있습니다',
      '💡 AI 협업 개발 과정을 배울 수 있습니다',
    ],
  },
];

const quickTips = [
  { icon: Zap, text: '키보드 Enter로 빠른 검색' },
  { icon: Hash, text: '해시태그로 원클릭 검색' },
  { icon: MapPin, text: '지도에서 직관적 탐색' },
  { icon: Star, text: '즐겨찾기로 빠른 접근' },
];

export default function UserGuide() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BookOpen className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="w-6 h-6 text-blue-500" />
            사용설명서
          </DialogTitle>
          <DialogDescription className="text-base">
            Show Me The CCTV 완벽 가이드 - 모든 기능을 쉽게 사용하세요!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 빠른 시작 가이드 */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                빠른 시작 (30초만에!)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li className="text-gray-700">
                  <strong>목록</strong> 또는 <strong>지도</strong> 뷰 선택
                </li>
                <li className="text-gray-700">
                  검색창에 <strong>"강남역"</strong> 입력 또는 해시태그 클릭
                </li>
                <li className="text-gray-700">
                  검색 결과 썸네일 클릭
                </li>
                <li className="text-gray-700">
                  실시간 CCTV 영상 확인! 🎉
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* 퀵 팁 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickTips.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <Card key={i} className="bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardContent className="pt-4 text-center">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs text-gray-700">{tip.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 상세 가이드 */}
          {guideSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Card key={idx} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                    {section.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 단계 */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-gray-800">
                      📋 사용 방법
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                      {section.steps.map((step, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
                      ))}
                    </ol>
                  </div>

                  {/* 팁 */}
                  {section.tips && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="space-y-1">
                        {section.tips.map((tip, i) => (
                          <p key={i} className="text-xs text-gray-700">
                            {tip}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* 문제 해결 */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-red-600" />
                문제 해결 (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-800">Q. CCTV 영상이 안 보여요</p>
                <p className="text-gray-600 ml-4">
                  → 네트워크 상태를 확인하고 브라우저를 새로고침해보세요.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Q. 검색이 안 돼요</p>
                <p className="text-gray-600 ml-4">
                  → F12를 눌러 콘솔을 확인하고, 키워드를 변경해보세요.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Q. 지도에 마커가 안 보여요</p>
                <p className="text-gray-600 ml-4">
                  → 지도를 축소(줌 아웃)하여 서울 전역을 확인해보세요.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Q. AI 연결이 실패해요</p>
                <p className="text-gray-600 ml-4">
                  → API 키가 올바른지 확인하고, 해당 플랫폼에서 사용 가능한지 확인하세요.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Q. 즐겨찾기가 사라졌어요</p>
                <p className="text-gray-600 ml-4">
                  → 브라우저 캐시를 삭제하면 로컬 저장 데이터가 삭제됩니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 키보드 단축키 */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                ⌨️ 키보드 단축키
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">검색 실행</span>
                  <Badge variant="outline">Enter</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">모달 닫기</span>
                  <Badge variant="outline">ESC</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">콘솔 열기</span>
                  <Badge variant="outline">F12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">새로고침</span>
                  <Badge variant="outline">F5</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong>📞 문의 및 피드백</strong>
                  </p>
                  <p>
                    이 프로그램은 바이브코딩 프롬프트 방식으로 개발되었습니다.
                    궁금한 점이나 개선 사항이 있다면 GitHub Issues로 문의해주세요.
                  </p>
                  <p>
                    <strong>🔗 관련 링크:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>국토부 ITS API: https://www.data.go.kr</li>
                    <li>Leaflet 문서: https://leafletjs.com</li>
                    <li>OpenAI API: https://platform.openai.com</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

