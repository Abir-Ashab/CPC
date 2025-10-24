'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ResetConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    loading: boolean;
}

export function ResetConfirmationDialog({ open, onOpenChange, onConfirm, loading }: ResetConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Reset Voting System
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 text-sm">
                    <p>• Stop voting and clear all voting settings</p>
                    <p>• Reset all user votes</p>
                    <p>• Clear all photo vote counts and winner status</p>
                    <p>• Remove all winners and unpublished results</p>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Voting System'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}