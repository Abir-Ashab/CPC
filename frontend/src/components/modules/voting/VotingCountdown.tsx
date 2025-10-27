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

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    const TimeCard = ({ value, label }: { value: number; label: string }) => (
        <div className="bg-zinc-50 rounded-xl px-6 py-4 min-w-[80px] shadow-lg">
            <div className="text-4xl font-bold text-gray-600 tabular-nums text-center mb-1">
                {formatNumber(value)}
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-600 text-center font-semibold">
                {label}
            </div>
        </div>
    );

    return (
        <div className='mb-2'>
            <div className="flex items-center justify-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-700">
                    Time Remaining
                </h3>
            </div>

            <div className="flex items-center justify-center gap-3">
                <TimeCard value={timeLeft.days} label="DAYS" />
                <TimeCard value={timeLeft.hours} label="HOURS" />
                <TimeCard value={timeLeft.minutes} label="MINUTES" />
                <TimeCard value={timeLeft.seconds} label="SECONDS" />
            </div>
        </div>
    );
}