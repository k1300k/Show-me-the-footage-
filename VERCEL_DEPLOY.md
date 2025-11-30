# 🚀 Vercel 배포 가이드

Show Me The CCTV를 Vercel에 배포하는 단계별 가이드입니다.

## 📋 사전 준비

### 1. GitHub 리포지토리 준비
✅ 코드가 GitHub에 push 되어 있어야 합니다.

### 2. 필요한 API 키 (선택사항)
- 국토부 ITS API 키 (없으면 샘플 데이터 사용)
- 네이버 Geocoding API (없어도 작동)
- OpenAI/Gemini/Claude API (사용자가 직접 설정)

---

## 🌐 Vercel 배포 단계

### Step 1: Vercel 가입

1. [Vercel](https://vercel.com/) 접속
2. **Sign Up** 클릭
3. **GitHub 계정으로 로그인** (권장)
4. 권한 승인

---

### Step 2: 프로젝트 Import

1. Vercel 대시보드에서 **Add New...** → **Project** 클릭

2. **Import Git Repository**
   - GitHub 리포지토리 목록에서 `Show-me-the-footage-` 선택
   - 또는 리포지토리 URL 입력

3. **Configure Project**
   - Framework Preset: **Next.js** (자동 감지)
   - Root Directory: `./` (변경 불필요)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)

---

### Step 3: 환경 변수 설정

**Environment Variables** 섹션에서 추가:

```env
# 국토부 ITS API (선택사항)
ITS_API_KEY=발급받은_키

# 네이버 Geocoding API (선택사항)
NAVER_MAP_CLIENT_ID=발급받은_Client_ID
NAVER_MAP_CLIENT_SECRET=발급받은_Client_Secret

# CCTV Stream 설정 (기본값)
CCTV_CO_NAME=mnsoft
CCTV_SERVICE_NAME=mnsoftmonitor
CCTV_STREAM_BASE=http://stream.ktict.co.kr
```

**중요**:
- Production, Preview, Development 모두 체크
- API 키가 없어도 샘플 데이터로 작동

---

### Step 4: 배포

1. **Deploy** 버튼 클릭
2. 빌드 진행 확인 (약 2~3분)
3. 배포 완료! 🎉

배포 URL 예시:
```
https://show-me-the-footage-xxx.vercel.app
```

---

## ⚙️ 배포 후 설정

### 1. 도메인 연결 (선택사항)

1. Vercel 프로젝트 > **Settings** > **Domains**
2. 커스텀 도메인 입력
3. DNS 레코드 설정
4. SSL 자동 적용

---

### 2. 환경 변수 업데이트

추가 API 키가 생기면:

1. Vercel 프로젝트 > **Settings** > **Environment Variables**
2. 변수 추가 또는 수정
3. **Save** 클릭
4. **Deployments** > 최신 배포 > **Redeploy** (환경 변수 적용)

---

### 3. 자동 배포 설정

✅ GitHub에 push하면 자동으로 배포됩니다!

- **main/master 브랜치**: Production 배포
- **다른 브랜치**: Preview 배포
- **Pull Request**: Preview URL 자동 생성

---

## 🔧 빌드 최적화

### package.json 확인

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### Next.js 설정 (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 최적화된 빌드
  images: {
    domains: ['stream.ktict.co.kr'], // 외부 이미지 허용
  },
};

module.exports = nextConfig;
```

---

## 📊 성능 최적화

### 1. 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 자동 변환
- Lazy Loading

### 2. 코드 스플리팅
- Dynamic Import 활용 (이미 적용됨)
- Route 기반 자동 분리

### 3. 캐싱 전략
- React Query 캐싱 (30초)
- Static Assets CDN

---

## 🐛 문제 해결

### Build Error 발생 시

1. **로컬에서 먼저 테스트**
   ```bash
   npm run build
   npm run start
   ```

2. **에러 확인**
   - TypeScript 오류: `npm run type-check`
   - Lint 오류: `npm run lint`

3. **Vercel 로그 확인**
   - Deployments > 실패한 배포 > **View Build Logs**

---

### Runtime Error 발생 시

1. **Vercel 함수 로그**
   - Deployments > Runtime Logs

2. **환경 변수 확인**
   - Settings > Environment Variables

3. **API 엔드포인트 테스트**
   ```
   https://your-app.vercel.app/api/cctv?minX=126&maxX=128&minY=36&maxY=38
   ```

---

## 📱 모바일 최적화 확인

배포 후 실제 모바일 기기에서 테스트:

1. **모바일 브라우저 접속**
   ```
   https://your-app.vercel.app
   ```

2. **홈 화면에 추가** (PWA)
   - iOS: Safari > 공유 > 홈 화면에 추가
   - Android: Chrome > 메뉴 > 홈 화면에 추가

3. **체크리스트**
   - [ ] 하단 네비게이션 바 표시
   - [ ] 2열 그리드 레이아웃
   - [ ] 터치 최적화
   - [ ] Safe Area 적용 (iOS)

---

## 🔐 보안 체크리스트

- [ ] API 키는 환경 변수로만 관리
- [ ] 클라이언트에 노출되는 키 없음
- [ ] CORS 설정 확인
- [ ] Rate Limiting 고려

---

## 📈 Analytics 설정 (선택사항)

### Vercel Analytics

1. Vercel 프로젝트 > **Analytics** 탭
2. **Enable Analytics**
3. 자동으로 트래픽 분석

### Google Analytics

```typescript
// app/layout.tsx에 추가
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

---

## 🎉 배포 완료 체크리스트

- [ ] Vercel 배포 성공
- [ ] 배포 URL 접속 확인
- [ ] CCTV 목록 로드 확인
- [ ] 검색 기능 테스트
- [ ] 지도 뷰 작동 확인
- [ ] 모바일 반응형 확인
- [ ] API 키 환경 변수 설정
- [ ] 커스텀 도메인 연결 (선택)

---

## 🔗 유용한 링크

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)
- [도메인 설정](https://vercel.com/docs/concepts/projects/domains)

---

## 💡 Pro Tips

1. **Preview 배포 활용**
   - 브랜치마다 자동 Preview URL 생성
   - 테스트 후 main에 merge

2. **Vercel CLI 사용**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

3. **로그 모니터링**
   - Real-time 함수 로그 확인
   - 에러 추적

---

**Happy Deploying!** 🚀


