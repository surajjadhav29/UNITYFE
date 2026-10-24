import { useEffect, useState } from 'react';

export function useCountUp(target: number, durationMs = 850): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setValue(0);
      return;
    }

    let startTime: number | null = null;
    let frame = 0;
    const from = 0;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
