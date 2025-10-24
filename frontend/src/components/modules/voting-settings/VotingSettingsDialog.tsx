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
    const [durationHours, setDurationHours] = useState(24);

    const handleStart = () => {
        if (startImmediately) {
            onStartVoting({ durationHours });
        } else if (startTime) {
            onStartVoting({ startTime, durationHours });
        } else {
            // Start immediately as fallback
            onStartVoting({ durationHours });
        }
    };

    const handleImmediateStart = () => {
        onStartVoting(); // Start immediately with default settings
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
                        <Label htmlFor="duration">Voting Duration (hours)</Label>
                        <Input
                            id="duration"
                            type="number"
                            min="1"
                            max="720"
                            value={durationHours}
                            onChange={(e) => setDurationHours(parseInt(e.target.value) || 24)}
                        />
                        <p className="text-sm text-muted-foreground">
                            Voting will automatically end after {durationHours} hours
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
                            disabled={loading}
                        >
                            {loading ? 'Starting...' : 'Start Immediately'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleStart}
                            disabled={!startTime || loading}
                        >
                            {loading ? 'Scheduling...' : 'Schedule Voting'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}