import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Key, LogOutIcon, User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router"; // adjust router
import { Avatar, AvatarFallback } from "../ui/avtatar";

interface User {
  id: number;
  slack_id: string;
  user_name: string;
  display_name: string;
  email: string;
  profile_pic: string;
  designation: string;
  phone: string;
  user_type: string;
  user_status: string;
  created_at: string;
}

const UserDetails: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };

    loadUser();

    // Listen for profile updates
    const handleUserUpdate = () => loadUser();
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  if (!user) return <p className="text-gray-500">No user data found</p>;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate({ to: "/" });
  };

  return (
    <div className="flex justify-end w-full pr-6">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex gap-2 items-center hover:cursor-pointer">
          <Avatar>
            <img
              src={user.profile_pic ? user.profile_pic : "/table/profile.webp"}
              alt={user.display_name || "User"}
              className="h-12 w-12 rounded-full object-cover shadow-md"
            />
            <AvatarFallback>{user.display_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-gray-800">{user.display_name || "User"}</span>
          <ChevronDown size={18} className="text-gray-600" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] border-none p-2 rounded-md w-44"
          align="end"
          side="bottom"
        >
          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-violet-100 transition-colors"
            onClick={() => navigate({ to: "/view-profile" })}
          >
            <User size={16} />
            <span>View Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-violet-100 transition-colors"
          >
            <Key size={16} />
            <span>Update Password</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-white hover:bg-red-600 transition-colors"
            onClick={handleLogout}
          >
            <LogOutIcon size={16} />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserDetails;

