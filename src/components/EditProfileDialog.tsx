
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Loader2 } from 'lucide-react';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onOpenChange }) => {
  const { profile, fetchProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
  });

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username.trim() || username === profile?.username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.trim())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned means username is available
        setUsernameAvailable(true);
      } else if (data) {
        // Username exists
        setUsernameAvailable(false);
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username !== profile?.username) {
        checkUsernameAvailability(formData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, profile?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Check if username is available before submitting
    if (formData.username !== profile.username && usernameAvailable === false) {
      toast({
        title: "Username unavailable",
        description: "This username is already taken. Please choose another one.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await fetchProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUsernameStatus = () => {
    if (formData.username === profile?.username) return null;
    if (checkingUsername) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (usernameAvailable === true) return <Check className="h-4 w-4 text-green-500" />;
    if (usernameAvailable === false) return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getUsernameMessage = () => {
    if (formData.username === profile?.username) return null;
    if (checkingUsername) return "Checking availability...";
    if (usernameAvailable === true) return "Username is available";
    if (usernameAvailable === false) return "Username is already taken";
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <div className="col-span-3 space-y-1">
                <div className="relative">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pr-8"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {getUsernameStatus()}
                  </div>
                </div>
                {getUsernameMessage() && (
                  <p className={`text-xs ${
                    usernameAvailable === true ? 'text-green-600' : 
                    usernameAvailable === false ? 'text-red-600' : 
                    'text-muted-foreground'
                  }`}>
                    {getUsernameMessage()}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar_url" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading || (formData.username !== profile?.username && usernameAvailable === false)}
            >
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
