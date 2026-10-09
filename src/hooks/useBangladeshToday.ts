import { useEffect, useState } from 'react';
import { bangladeshDateKey } from '../utils/sessionAppearance';

export default function useBangladeshToday() {
  const [today, setToday] = useState(() => bangladeshDateKey());
  useEffect(() => {
    let timer: number;
    const update = () => {
      const now = new Date(), day = bangladeshDateKey(now);
      setToday(day); window.clearTimeout(timer);
      const midnight = new Date(`${day}T00:00:00+06:00`).getTime() + 86400000;
      timer = window.setTimeout(update, midnight - now.getTime() + 50);
    };
    update(); window.addEventListener('focus', update); document.addEventListener('visibilitychange', update);
    return () => { window.clearTimeout(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); };
  }, []);
  return today;
}
