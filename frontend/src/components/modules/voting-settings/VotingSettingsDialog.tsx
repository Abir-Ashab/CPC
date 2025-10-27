'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface VotingSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStartVoting: (settings?: { startTime?: Date; durationHours?: number }) => void;
    loading: boolean;
}

export function VotingSettingsDialog({ open, onOpenChange, onStartVoting, loading }: VotingSettingsDialogProps) {
    const [startImmediately, setStartImmediately] = useState(true);
    const [startTime, setStartTime] = useState<Date>();
    const [durationHours, setDurationHours] = useState<number | ''>('');
    const [durationMinutes, setDurationMinutes] = useState<number | ''>('');

    const getTotalDurationInHours = () => {
        const hours = typeof durationHours === 'number' ? durationHours : 0;
        const minutes = typeof durationMinutes === 'number' ? durationMinutes : 0;
        
        if (hours === 0 && minutes === 0) return undefined;
        return hours + (minutes / 60);
    };

    const handleStart = () => {
        const duration = getTotalDurationInHours();
        if (startImmediately) {
            onStartVoting({ durationHours: duration });
        } else if (startTime) {
            onStartVoting({ startTime, durationHours: duration });
        } else {
            onStartVoting({ durationHours: duration });
        }
    };

    const handleImmediateStart = () => {
        const duration = getTotalDurationInHours();
        onStartVoting({ durationHours: duration }); 
    };

    const formatTotalDuration = () => {
        const hours = typeof durationHours === 'number' ? durationHours : 0;
        const minutes = typeof durationMinutes === 'number' ? durationMinutes : 0;
        
        if (hours === 0 && minutes === 0) {
            return 'Enter voting duration';
        }
        
        const parts = [];
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        
        return `Voting will automatically end after ${parts.join(' and ')}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start Voting Session</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Start Time</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={startImmediately ? "default" : "outline"}
                                onClick={() => setStartImmediately(true)}
                                className="flex-1"
                            >
                                Start Immediately
                            </Button>
                            <Button
                                type="button"
                                variant={!startImmediately ? "default" : "outline"}
                                onClick={() => setStartImmediately(false)}
                                className="flex-1"
                            >
                                Schedule
                            </Button>
                        </div>
                    </div>

                    {!startImmediately && (
                        <div className="space-y-2">
                            <Label>Start Date & Time</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !startTime && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startTime ? format(startTime, "PPP 'at' p") : "Pick a date and time"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startTime}
                                        onSelect={setStartTime}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                    <div className="p-3 border-t">
                                        <Input
                                            type="time"
                                            value={startTime ? format(startTime, 'HH:mm') : ''}
                                            onChange={(e) => {
                                                if (startTime && e.target.value) {
                                                    const [hours, minutes] = e.target.value.split(':');
                                                    const newDate = new Date(startTime);
                                                    newDate.setHours(parseInt(hours), parseInt(minutes));
                                                    setStartTime(newDate);
                                                }
                                            }}
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Voting Duration</Label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label htmlFor="duration-hours" className="text-xs text-muted-foreground">Hours</Label>
                                <Input
                                    id="duration-hours"
                                    type="number"
                                    min="0"
                                    max="720"
                                    placeholder="0"
                                    value={durationHours}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '') {
                                            setDurationHours('');
                                        } else {
                                            const parsed = parseInt(value);
                                            if (!isNaN(parsed) && parsed >= 0) {
                                                setDurationHours(parsed);
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="duration-minutes" className="text-xs text-muted-foreground">Minutes</Label>
                                <Input
                                    id="duration-minutes"
                                    type="number"
                                    min="0"
                                    max="59"
                                    placeholder="0"
                                    value={durationMinutes}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '') {
                                            setDurationMinutes('');
                                        } else {
                                            const parsed = parseInt(value);
                                            if (!isNaN(parsed) && parsed >= 0 && parsed <= 59) {
                                                setDurationMinutes(parsed);
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {formatTotalDuration()}
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    {startImmediately ? (
                        <Button
                            onClick={handleImmediateStart}
                            disabled={loading || getTotalDurationInHours() === undefined}
                        >
                            {loading ? 'Starting...' : 'Start Immediately'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleStart}
                            disabled={!startTime || loading || getTotalDurationInHours() === undefined}
                        >
                            {loading ? 'Scheduling...' : 'Schedule Voting'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}