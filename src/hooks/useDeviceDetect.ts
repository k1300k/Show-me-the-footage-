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
  // 초기값을 클라이언트 사이드에서 즉시 계산
  const getInitialDeviceInfo = (): DeviceInfo => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        screenWidth: 0,
        screenHeight: 0,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const isTouchDevice = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0;

    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = 
      /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    return {
      isMobile: isMobile || isMobileUA,
      isTablet,
      isDesktop: !isMobile && !isMobileUA,
      isTouchDevice,
      screenWidth: width,
      screenHeight: height,
    };
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getInitialDeviceInfo);

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isTouchDevice = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0;

      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

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

    // 초기 업데이트
    updateDeviceInfo();
    
    // 이벤트 리스너
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};


