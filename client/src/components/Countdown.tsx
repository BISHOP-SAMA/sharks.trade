import { useState, useEffect } from "react";
import { differenceInSeconds } from "date-fns";

interface CountdownProps {
  endTime: string | Date;
  onEnd?: () => void;
}

export function Countdown({ endTime, onEnd }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const end = new Date(endTime);
    
    const tick = () => {
      const diff = differenceInSeconds(end, new Date());
      if (diff <= 0) {
        setTimeLeft(0);
        onEnd?.();
      } else {
        setTimeLeft(diff);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  if (timeLeft <= 0) {
    return <span className="text-destructive font-mono font-bold">AUCTION ENDED</span>;
  }

  return (
    <div className="flex gap-2 text-center">
      <div className="flex flex-col">
        <span className="text-2xl font-mono font-bold text-foreground bg-white/5 px-3 py-1 rounded border border-white/10">{hours.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">HRS</span>
      </div>
      <span className="text-2xl font-bold text-muted-foreground/50 py-1">:</span>
      <div className="flex flex-col">
        <span className="text-2xl font-mono font-bold text-foreground bg-white/5 px-3 py-1 rounded border border-white/10">{minutes.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">MIN</span>
      </div>
      <span className="text-2xl font-bold text-muted-foreground/50 py-1">:</span>
      <div className="flex flex-col">
        <span className="text-2xl font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20">{seconds.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase tracking-widest text-primary mt-1">SEC</span>
      </div>
    </div>
  );
}
