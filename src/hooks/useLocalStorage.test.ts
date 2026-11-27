import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes with default value, persists updates, and handles malformed JSON', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', { count: 1 }));
    expect(result.current[0]).toEqual({ count: 1 });

    act(() => {
      result.current[1]({ count: 5 });
    });

    expect(result.current[0]).toEqual({ count: 5 });
    expect(JSON.parse(window.localStorage.getItem('test_key') ?? '{}')).toEqual({ count: 5 });

    window.localStorage.setItem('broken_key', '{not-valid-json');
    const { result: broken } = renderHook(() => useLocalStorage('broken_key', 'fallback'));
    expect(broken.current[0]).toBe('fallback');
  });
});
