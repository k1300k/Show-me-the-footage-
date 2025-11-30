# 🎥 Show Me The CCTV

전국 도로 CCTV 실시간 모니터링 서비스

[![Vercel Deploy](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/k1300k/Show-me-the-footage-)

**바이브코딩 프롬프트 방식**으로 개발된 프로젝트입니다. (v1.6)

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

# 네이버 지도 Geocoding API (선택사항 - 주소 검색 시 필요)
NAVER_MAP_CLIENT_ID=발급받은_Client_ID
NAVER_MAP_CLIENT_SECRET=발급받은_Client_Secret

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
- **🤖 AI 검색 지원**: OpenAI, Google Gemini, Anthropic Claude 선택 가능
- **📹 실시간 CCTV 영상**: JPEG 썸네일 (5초 자동 갱신) + HLS 라이브 스트리밍
- **⭐ 즐겨찾기**: 로컬 스토리지 기반 저장
- **🔄 자동 데이터 연동**: 국토부 ITS API 또는 샘플 데이터 자동 전환
- **📱 반응형 디자인**: 모바일/데스크톱 최적화

### ✅ 추가 기능
- **📹 CCTV 소스 선택**: KT ICT / 국가 ITS / 통합 모드 중 선택 가능
- **🗺️ 지도 뷰**: Leaflet + OpenStreetMap 기반 실시간 지도
- **🔄 목록/지도 전환**: 토글 버튼으로 간편 전환
- **📍 위치 기반 검색**: 지도 영역 내 CCTV 자동 표시
- **🗺️ 주소/지명 검색**: 100개 이상 지하철역, 랜드마크, 대학교 지원
- **⚙️ AI 설정**: 원하는 AI 엔진 선택 및 API 키 관리
- **📚 개발 이력**: 바이브코딩 프롬프트 기반 전체 개발 과정 확인
- **📖 사용설명서**: 모든 기능에 대한 상세한 가이드 및 문제 해결
- **📱 모바일 최적화**: 터치 최적화, 하단 네비게이션, PWA 지원

---

## 🎯 사용 방법

### 📖 상세 가이드
헤더 우측 상단의 **📖 사용설명서** 버튼을 클릭하면 모든 기능에 대한 상세한 가이드를 확인할 수 있습니다!

### 빠른 시작 (30초!)
1. **목록** 또는 **지도** 뷰 선택
2. 검색창에 "강남역" 입력 또는 해시태그 클릭
3. 검색 결과 썸네일 클릭
4. 실시간 CCTV 영상 확인! 🎉

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

### 4. CCTV 소스 선택
- 헤더 우측 상단 📹 버튼 클릭
- 3가지 소스 중 선택:
  - **국가 ITS** (기본): 광범위 커버리지, 공공 데이터 (API 키 필요)
  - **KT ICT**: 고화질, 실시간 썸네일, HLS 스트리밍
  - **통합 모드**: 두 소스를 모두 사용하여 최대 CCTV 개수
- 설정 저장 후 자동 새로고침

### 5. 헤더 버튼 안내
- 📖 **사용설명서**: 전체 기능 가이드
- 📹 **CCTV 소스**: 데이터 소스 선택
- ⚙️ **AI 설정**: AI 엔진 선택 및 설정
- ℹ️ **프로그램 정보**: 개발 이력 확인

### 6. 모바일 사용 방법

#### 📱 **모바일 전용 기능**
- **하단 네비게이션**: 홈 / 지도 / 즐겨찾기 버튼
- **터치 최적화**: 큰 버튼, 스와이프 제스처
- **컴팩트 헤더**: 모바일 화면에 최적화된 레이아웃
- **2열 그리드**: 한눈에 보는 CCTV 썸네일

#### 📥 **홈 화면에 추가 (PWA)**
1. **iOS**: Safari → 공유 → "홈 화면에 추가"
2. **Android**: Chrome → 메뉴 → "홈 화면에 추가"

#### 💡 **모바일 팁**
- 가로 스크롤 해시태그로 빠른 검색
- 상단 검색창은 항상 고정
- 하단 시트로 영상 확인
- Safe Area 지원 (노치 영역 자동 대응)

---

## 🔧 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Shadcn/UI
- **State**: Zustand + React Query
- **Maps**: Leaflet + OpenStreetMap (API 키 불필요)
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

### 🗺️ 지도 기능 (API 키 불필요!)
- **Leaflet + OpenStreetMap** 사용
- 별도 API 키 발급 필요 없음
- 즉시 사용 가능

### 📍 네이버 지도 Geocoding API (선택사항)

주소나 지명으로 CCTV를 검색하려면 네이버 지도 API가 필요합니다.

#### 발급 방법
1. [Naver Cloud Platform](https://www.ncloud.com/) 회원가입
2. Console > Services > Application Service > Maps
3. **Application 등록**
   - Application 이름 입력
   - **Maps > Geocoding** 서비스 선택
4. 인증 정보 확인
   - **Client ID** 복사
   - **Client Secret** 복사
5. `.env.local`에 추가
   ```env
   NAVER_MAP_CLIENT_ID=발급받은_Client_ID
   NAVER_MAP_CLIENT_SECRET=발급받은_Client_Secret
   ```

**없어도 작동**: 주요 지역은 내장 데이터로 검색 가능  
**무료 사용량**: 월 10만 건까지 무료

### 🤖 AI 검색 설정 (선택사항)

AI를 활용하면 더 똑똑한 검색이 가능합니다!

#### 지원하는 AI 엔진
1. **OpenAI GPT-4** (유료)
   - 가장 강력한 자연어 처리
   - API 키: https://platform.openai.com/api-keys

2. **Google Gemini** (무료 티어)
   - 한국어 지원 우수
   - API 키: https://aistudio.google.com/app/apikey

3. **Anthropic Claude** (유료)
   - 정확한 분석
   - API 키: https://console.anthropic.com/settings/keys

#### 설정 방법
1. 헤더 우측 상단 ⚙️ **설정 버튼** 클릭
2. AI 엔진 선택
3. API 키 입력
4. 🧪 **연결 테스트** 클릭
5. **AI 검색 활성화** 토글
6. 💾 **설정 저장**

**참고**: AI 없이도 기본 키워드 검색으로 사용 가능합니다!

---

## 📊 프로젝트 구조

```
src/
├── app/
│   ├── api/cctv/          # CCTV API Proxy
│   ├── favorites/         # 즐겨찾기 페이지
│   └── page.tsx           # 메인 페이지 (목록/지도 토글)
├── components/
│   ├── map/               # 지도 컴포넌트 (Leaflet)
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
- Leaflet 지도: [Leaflet 문서](https://leafletjs.com/)
- KT ICT: 현대오토에버 계정 (mnsoft_mnsoftmonitor)

---

## 📄 라이선스

MIT License

---

## 🚀 Vercel 배포

### 빠른 배포
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/k1300k/Show-me-the-footage-)

### 배포 가이드
자세한 배포 방법은 **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** 파일을 참고하세요.

**핵심 단계**:
1. Vercel 계정 생성 (GitHub 연동)
2. 리포지토리 Import
3. 환경 변수 설정 (선택사항)
4. Deploy 버튼 클릭
5. 완료! 🎉

---

## 📱 모바일 테스트

### 브라우저에서 모바일 뷰 확인
자세한 방법은 **[MOBILE_TEST_GUIDE.md](./MOBILE_TEST_GUIDE.md)** 파일을 참고하세요.

**빠른 방법**:
1. Chrome/Edge에서 `F12` (개발자 도구)
2. `Ctrl+Shift+M` (Windows) 또는 `Cmd+Shift+M` (Mac)
3. 디바이스 선택: iPhone 14 Pro
4. 새로고침 (F5)

---

## 🎉 최종 검토 완료

### ✅ v1.6 기능 완료
- ✅ **모든 핵심 기능 구현 완료**
- ✅ **자연어 처리 검색 작동**
- ✅ **100개 이상 지명/지하철역 검색**
- ✅ **Leaflet 지도 통합 (API 키 불필요)**
- ✅ **목록/지도 뷰 전환 기능**
- ✅ **AI 설정 화면 (OpenAI/Gemini/Claude)**
- ✅ **프로그램 개발 이력 확인**
- ✅ **사용설명서 내장**
- ✅ **모바일 전용 레이아웃**
- ✅ **PWA 지원 (홈 화면 추가 가능)**
- ✅ **빌드 오류 수정 완료**
- ✅ **문서화 완료 (README, VERCEL_DEPLOY, MOBILE_TEST_GUIDE)**

### 🌐 배포 준비 완료
- ✅ Vercel 배포 가이드 작성
- ✅ 환경 변수 설정 가이드
- ✅ 모바일 테스트 가이드
- ✅ GitHub 리포지토리 준비

**프로젝트 준비 완료!** 🚀

---

## 📚 관련 문서

- **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)**: Vercel 배포 가이드
- **[MOBILE_TEST_GUIDE.md](./MOBILE_TEST_GUIDE.md)**: 모바일 뷰 테스트 방법
- **[prd.mdc](./.cursor/rules/prd.mdc)**: 초기 프로젝트 요구사항 문서

---

## 🏆 개발 이력

앱 내에서 우측 상단 **ℹ️ 버튼**을 클릭하면 전체 개발 이력과 프롬프트 질의 내역을 확인할 수 있습니다.

**주요 버전**:
- **v1.0**: 프로젝트 초기 설정 (Next.js + Shadcn/UI)
- **v1.1**: CCTV API 연동 (국토부 ITS + KT ICT)
- **v1.2**: 자연어 검색 및 해시태그
- **v1.3**: Leaflet 지도 통합
- **v1.4**: 검색 기능 안정화
- **v1.5**: 지명/주소 검색 확장 (100개 이상 위치)
- **v1.6**: AI 통합 + 모바일 최적화 + PWA
