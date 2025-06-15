
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your application preferences and settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notifications</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-sm">
                Email notifications
              </Label>
              <Switch id="email-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="text-sm">
                Push notifications
              </Label>
              <Switch id="push-notifications" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Privacy</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-visibility" className="text-sm">
                Public profile
              </Label>
              <Switch id="profile-visibility" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="activity-status" className="text-sm">
                Show activity status
              </Label>
              <Switch id="activity-status" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Appearance</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-mode" className="text-sm">
                Compact mode
              </Label>
              <Switch id="compact-mode" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
