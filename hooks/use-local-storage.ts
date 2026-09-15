"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(key);
        if (saved !== null) setValue(JSON.parse(saved) as T);
      } catch {
        // Keep the interface usable when storage is unavailable.
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [key]);

  const updateValue = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = next instanceof Function ? next(current) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // State still updates for this session.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, updateValue] as const;
}
