import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGeolocation } from './useGeolocation';

describe('useGeolocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  beforeEach(() => {
    // Mock navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default loading state', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should update coordinates on success', () => {
    const { result } = renderHook(() => useGeolocation());

    // Simulate success callback
    const successCallback = mockGeolocation.getCurrentPosition.mock.calls[0][0];
    act(() => {
      successCallback({
        coords: {
          latitude: 37.5665,
          longitude: 126.9780,
        },
      });
    });

    expect(result.current.location).toEqual({
      lat: 37.5665,
      lng: 126.9780,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', () => {
    const { result } = renderHook(() => useGeolocation());

    // Simulate error callback
    const errorCallback = mockGeolocation.getCurrentPosition.mock.calls[0][1];
    act(() => {
      errorCallback({
        code: 1,
        message: 'User denied Geolocation',
      });
    });

    expect(result.current.location).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('User denied Geolocation');
  });
});


