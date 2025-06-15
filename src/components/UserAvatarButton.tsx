
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Reusable avatar button or link to login
const UserAvatarButton: React.FC = () => {
  const { user, profile } = useAuth();

  if (user && profile) {
    return (
      <div className="flex items-center gap-2 ml-2">
        <Avatar className="h-8 w-8 border border-border shadow">
          <AvatarImage src={profile.avatar_url || ""} alt={profile.username || ""} />
          <AvatarFallback>
            {(profile.username || profile.full_name || user.email || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }
  return (
    <Link to="/auth">
      <Button variant="outline" size="sm" className="ml-2">
        Login
      </Button>
    </Link>
  );
};

export default UserAvatarButton;
