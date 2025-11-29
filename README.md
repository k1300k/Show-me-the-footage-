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
# 국토부 ITS OpenAPI (필수)
ITS_API_KEY=발급받은_ITS_API_키

# Kakao Map API Key (선택 - 지도 기능 사용 시 필수)
NEXT_PUBLIC_KAKAO_MAP_KEY=발급받은_카카오맵_키

# CCTV Stream 설정 (기본값 사용 가능)
CCTV_CO_NAME=mnsoft
CCTV_SERVICE_NAME=mnsoftmonitor
CCTV_STREAM_BASE=http://stream.ktict.co.kr
```

### 3. API 키 발급 방법

#### 🔑 국토부 ITS OpenAPI
1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. 검색: **"ITS 국가교통정보센터_CCTV 정보제공 서비스"**
3. **활용신청** 클릭
4. 승인 후 (1~2일 소요) **마이페이지 > 오픈API > 인증키** 확인
5. 일반 인증키(Encoding) 복사

#### 🗺️ 카카오맵 API (선택사항)
1. [Kakao Developers](https://developers.kakao.com/) 로그인
2. 내 애플리케이션 > 애플리케이션 추가
3. 앱 키 > **JavaScript 키** 복사
4. 플랫폼 > Web 플랫폼 등록 > `http://localhost:3001` 추가

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3001` 접속

---

## 📋 주요 기능

- ✅ **실시간 CCTV 영상**: 국토부 ITS API 연동
- ✅ **JPEG 썸네일**: 5초마다 자동 갱신
- ✅ **HLS 라이브 스트리밍**: 고화질 영상 재생
- ✅ **메시지 시스템**: 자연어 처리 기반 검색 (예정)
- ✅ **즐겨찾기**: 로컬 저장
- ⏳ **지도 연동**: 카카오맵 (2단계)

---

## 🔧 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **State**: Zustand + React Query
- **Video**: HLS.js
- **API**: 국토부 ITS OpenAPI + KT ICT Stream

---

## 📌 API 키 없이 테스트

API 키가 없어도 **샘플 CCTV 10개**로 테스트 가능합니다.
`.env.local` 없이 `npm run dev` 실행 시 자동으로 샘플 데이터 사용.

---

## 🛠️ 설정 가이드

웹 UI 설정 가이드: `http://localhost:3001/setup`

---

## 📞 문의

- 국토부 ITS API: [공공데이터포털](https://www.data.go.kr/)
- 카카오맵 API: [Kakao Developers](https://developers.kakao.com/)

---

## 📄 라이선스

MIT License
