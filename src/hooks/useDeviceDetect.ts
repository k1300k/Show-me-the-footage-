import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
}

export const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // 터치 디바이스 감지
      const isTouchDevice = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0;

      // 화면 크기 기반 디바이스 타입 감지
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      // User Agent 기반 추가 감지
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = 
        /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

      setDeviceInfo({
        isMobile: isMobile || isMobileUA,
        isTablet,
        isDesktop: !isMobile && !isMobileUA,
        isTouchDevice,
        screenWidth: width,
        screenHeight: height,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};


