# 🎥 Show Me The CCTV

전국 도로 CCTV 실시간 모니터링 서비스

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하세요:

```env
# 국토부 ITS OpenAPI (선택사항 - 없으면 샘플 데이터 사용)
ITS_API_KEY=발급받은_ITS_API_키

# Kakao Map API Key (선택사항 - 지도 기능 사용 시)
NEXT_PUBLIC_KAKAO_MAP_KEY=발급받은_카카오맵_키

# CCTV Stream 설정 (기본값 사용 가능)
CCTV_CO_NAME=mnsoft
CCTV_SERVICE_NAME=mnsoftmonitor
CCTV_STREAM_BASE=http://stream.ktict.co.kr
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3001` 접속

---

## ✨ 주요 기능

### ✅ 구현 완료
- **💬 자연어 처리 검색**: "강남역 보여줘", "올림픽대로 상황" 등 자연스러운 검색
- **📹 실시간 CCTV 영상**: JPEG 썸네일 (5초 자동 갱신) + HLS 라이브 스트리밍
- **⭐ 즐겨찾기**: 로컬 스토리지 기반 저장
- **🔄 자동 데이터 연동**: 국토부 ITS API 또는 샘플 데이터 자동 전환
- **📱 반응형 디자인**: 모바일/데스크톱 최적화

### ⏳ 향후 계획
- **🗺️ 지도 연동**: 카카오맵 2단계 구현
- **🔍 고급 검색**: 위치 기반, 시간대별 필터링

---

## 🎯 사용 방법

### 1. 자연어 검색
메시지창에 자연스럽게 입력:
- "강남역 보여줘"
- "올림픽대로 상황 어때?"
- "신촌역 CCTV"
- "광화문 교통"

### 2. CCTV 확인
- 검색 결과에서 CCTV 클릭
- 실시간 썸네일 자동 갱신 (5초)
- 📹 버튼으로 라이브 스트리밍 전환
- ⭐ 버튼으로 즐겨찾기 추가

### 3. 즐겨찾기 관리
- 우측 상단 ⭐ 버튼 클릭
- 저장된 CCTV 목록 확인
- 삭제 및 재생 가능

---

## 🔧 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Shadcn/UI
- **State**: Zustand + React Query
- **Video**: HLS.js (라이브 스트리밍)
- **API**: 
  - 국토부 ITS OpenAPI (자동 CCTV 목록)
  - KT ICT Stream (실시간 영상)

---

## 📋 API 키 발급 방법

### 🔑 국토부 ITS OpenAPI (선택사항)
1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. 검색: **"ITS 국가교통정보센터_CCTV 정보제공 서비스"**
3. 활용신청 → 승인 대기 (1~2일)
4. 마이페이지 > 오픈API > 인증키 복사

**없어도 작동**: 샘플 CCTV 10개로 테스트 가능

### 🗺️ 카카오맵 API (선택사항)
1. [Kakao Developers](https://developers.kakao.com/) 로그인
2. 내 애플리케이션 > 애플리케이션 추가
3. 앱 키 > **JavaScript 키** 복사
4. 플랫폼 > Web 플랫폼 등록 > `http://localhost:3001` 추가

**없어도 작동**: 지도 기능만 제외

---

## 🛠️ 설정 가이드

웹 UI 설정 가이드: `http://localhost:3001/setup`

---

## 📊 프로젝트 구조

```
src/
├── app/
│   ├── api/cctv/          # CCTV API Proxy
│   ├── favorites/         # 즐겨찾기 페이지
│   ├── setup/             # 설정 가이드 페이지
│   └── page.tsx           # 메인 페이지
├── components/
│   ├── player/            # 영상 플레이어
│   └── ui/                # Shadcn/UI 컴포넌트
├── hooks/
│   ├── useCCTVData.ts     # CCTV 데이터 훅
│   ├── useGeolocation.ts  # 위치 추적 훅
│   └── useFavorites.ts    # 즐겨찾기 훅
└── types/
    └── index.ts           # TypeScript 타입 정의
```

---

## 🐛 문제 해결

### CCTV가 안 보여요
- 브라우저 콘솔(F12) 확인
- API 키 설정 확인 (`.env.local`)
- 서버 재시작 (`npm run dev`)

### 검색이 안 돼요
- "강남역 보여줘" 형식으로 입력
- 키워드만 입력해도 됨 ("강남역")

### 영상이 안 나와요
- CCTV ID가 올바른지 확인
- KT ICT 스트림 서버 상태 확인

---

## 📞 문의

- 국토부 ITS API: [공공데이터포털](https://www.data.go.kr/)
- 카카오맵 API: [Kakao Developers](https://developers.kakao.com/)
- KT ICT: 현대오토에버 계정 (mnsoft_mnsoftmonitor)

---

## 📄 라이선스

MIT License

---

## 🎉 최종 검토 완료

✅ **모든 핵심 기능 구현 완료**
✅ **자연어 처리 검색 작동**
✅ **빌드 오류 수정 완료**
✅ **문서화 완료**

**프로젝트 준비 완료!** 🚀
