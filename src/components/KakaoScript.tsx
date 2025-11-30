'use client';

import Script from "next/script";

interface KakaoScriptProps {
  appKey?: string;
}

export default function KakaoScript({ appKey }: KakaoScriptProps) {
  if (!appKey) return null;

  return (
    <Script
      src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services,clusterer&autoload=false`}
      strategy="beforeInteractive"
      onLoad={() => console.log('✅ Kakao Script Loaded')}
      onError={(e) => console.error('❌ Kakao Script Error', e)}
    />
  );
}

