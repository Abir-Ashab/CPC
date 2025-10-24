'use client';

import { useState, useEffect } from 'react';  
import { Clock } from 'lucide-react';

interface VotingCountdownProps {
    endTime?: string | Date;
    isActive: boolean;
}

export default function VotingCountdown({ endTime, isActive }: VotingCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        total: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

    useEffect(() => {
        if (!endTime || !isActive) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
            return;
        }

        const calculateTimeLeft = () => {
            const end = typeof endTime === 'string' ? new Date(endTime).getTime() : endTime.getTime();
            const now = new Date().getTime();
            const difference = end - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, total: difference });
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [endTime, isActive]);

    if (!isActive || !endTime || timeLeft.total <= 0) {
        return null;
    }

    const isUrgent = timeLeft.total <= 24 * 60 * 60 * 1000; 
    const isCritical = timeLeft.total <= 60 * 60 * 1000;

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className="flex flex-col items-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className={`h-5 w-5 ${
                    isCritical ? 'text-destructive' : isUrgent ? 'text-orange-600' : 'text-muted-foreground'
                }`} />
                <h3 className={`text-lg font-semibold ${
                    isCritical ? 'text-destructive' : isUrgent ? 'text-orange-700' : 'text-foreground'
                }`}>
                    Time Remaining
                </h3>
            </div>

            <div className="flex items-center justify-center gap-4 text-center">
                {timeLeft.days > 0 && (
                    <>
                        <div className="text-center">
                            <div className={`text-3xl font-bold tabular-nums ${
                                isCritical ? 'text-destructive' : isUrgent ? 'text-orange-600' : 'text-foreground'
                            }`}>
                                {formatNumber(timeLeft.days)}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                                {timeLeft.days === 1 ? 'Day' : 'Days'}
                            </div>
                        </div>
                        <div className={`text-2xl font-light ${
                            isCritical ? 'text-destructive/60' : isUrgent ? 'text-orange-400' : 'text-muted-foreground'
                        }`}>:</div>
                    </>
                )}

                <div className="text-center">
                    <div className={`text-3xl font-bold tabular-nums ${
                        isCritical ? 'text-destructive' : isUrgent ? 'text-orange-600' : 'text-foreground'
                    }`}>
                        {formatNumber(timeLeft.hours)}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                        {timeLeft.hours === 1 ? 'Hour' : 'Hours'}
                    </div>
                </div>

                <div className={`text-2xl font-light ${
                    isCritical ? 'text-destructive/60' : isUrgent ? 'text-orange-400' : 'text-muted-foreground'
                }`}>:</div>

                <div className="text-center">
                    <div className={`text-3xl font-bold tabular-nums ${
                        isCritical ? 'text-destructive' : isUrgent ? 'text-orange-600' : 'text-foreground'
                    }`}>
                        {formatNumber(timeLeft.minutes)}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                        Mins
                    </div>
                </div>

                <div className={`text-2xl font-light ${
                    isCritical ? 'text-destructive/60' : isUrgent ? 'text-orange-400' : 'text-muted-foreground'
                }`}>:</div>

                <div className="text-center">
                    <div className={`text-3xl font-bold tabular-nums ${
                        isCritical ? 'text-destructive' : isUrgent ? 'text-orange-600' : 'text-foreground'
                    }`}>
                        {formatNumber(timeLeft.seconds)}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                        Secs
                    </div>
                </div>
            </div>
        </div>
    );
}