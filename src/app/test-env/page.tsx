'use client';

export default function TestEnvPage() {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">환경 변수 테스트</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p className="font-mono">
          <strong>NEXT_PUBLIC_KAKAO_MAP_KEY:</strong>{' '}
          {kakaoKey ? (
            <span className="text-green-600">
              {kakaoKey.substring(0, 10)}... (길이: {kakaoKey.length})
            </span>
          ) : (
            <span className="text-red-600">❌ NOT FOUND</span>
          )}
        </p>
      </div>
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm">
          <strong>확인사항:</strong><br/>
          1. 키가 보이지 않으면 <code>.env.local</code> 파일이 없거나 잘못됨<br/>
          2. 서버를 재시작해야 환경 변수가 반영됨<br/>
          3. <code>NEXT_PUBLIC_</code> 접두어가 있어야 클라이언트에서 사용 가능
        </p>
      </div>
    </div>
  );
}

