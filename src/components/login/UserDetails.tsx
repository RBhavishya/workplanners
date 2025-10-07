import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <p className="text-gray-500">No user data found</p>;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 16) return "Good Afternoon";
    if (hour >= 16 && hour < 20) return "Good Evening";
    return "Good Night";
  };

  return (
   <div className="w-full flex justify-start">
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-3 focus:outline-none cursor-pointer">
          {/* Profile Image */}
          <img
            src={user.profile_pic ? user.profile_pic : "/table/profile.webp"}
            alt={user.display_name || "User"}
            className="h-12 w-12 rounded-full object-cover shadow-md"
          />

          {/* User Info with Down Arrow */}
          <div className="flex items-center gap-25 text-left">
            <p className="font-semibold">{user.display_name || "User"}</p>
            <ChevronDown size={18} className="text-gray-600 cursor-pointer" />
          </div>
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent
        className="w-60 bg-white border-none shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] p-2 rounded-lg"
        side="bottom"
        align="start"
      >
        <DropdownMenuItem className="p-3 cursor-default flex flex-col items-start">
          <span className="font-medium text-gray-700">Email:</span>
          <span className="text-gray-600 text-sm">{user.email || "N/A"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="p-3 cursor-default flex flex-col items-start">
          <span className="font-medium text-gray-700">Phone:</span>
          <span className="text-gray-600 text-sm">{user.phone || "N/A"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
};

export default UserDetails;
