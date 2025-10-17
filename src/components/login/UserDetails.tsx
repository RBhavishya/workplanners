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
import ResetPasswordDialog from "../core/ResetPasswordDialoge";
import { useMutation } from "@tanstack/react-query";
import { resetPasswordUsersAPI } from "@/https/services/users";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { UserDetailsProps } from "@/interfaces/users";

const UserDetails: React.FC = () => {
  const [user, setUser] = useState<UserDetailsProps | null>(null);
  const navigate = useNavigate();
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetError, setResetError] = useState("");
  const [userToResetPassword, setUserToResetPassword] = useState<number | null>(
    null
  );

  const { mutate: resetPassword, isPending: resetLoading } = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      resetPasswordUsersAPI(id.toString(), { password }),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Password reset successfully");
      setResetError("");
      setResetPasswordDialogOpen(false);
    },
    onError: (error: any) => {
      if (error?.status === 422 && error?.data?.errData) {
        const passwordErrors = error.data.errData.password;
        if (Array.isArray(passwordErrors) && passwordErrors.length > 0) {
          setResetError(passwordErrors[0]);
        } else {
          setResetError("Password validation failed");
        }
      } else {
        const message = error?.data?.message || "Failed to reset password";
        toast.error(message);
        setResetError(message);
      }
    },
  });

  const handlePasswordUpdate = (newPassword: string) => {
    if (userToResetPassword) {
      resetPassword({ id: userToResetPassword, password: newPassword });
    }
  };

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
    Cookies.remove("token");
    localStorage.removeItem("user");
    navigate({ to: "/" });
  };

  return (
    <div className="flex justify-end w-full pr-6">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex gap-3 items-center hover:cursor-pointer focus-visible:ring-0 focus:outline-0">
          <Avatar>
            <img
              src={user.profile_pic ? user.profile_pic : "/table/profile.webp"}
              alt={user.display_name || "User"}
              className="h-12 w-12 rounded-full object-cover shadow-md"
            />
            <AvatarFallback>
              {user.display_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-gray-800 ">
              {user.display_name || "User"}
            </span>
            <span className="text-xs 3xl:!text-sm text-neutral-500">
              {
                user.user_type === "EMPLOYEE"
                  ? user.designation
                  : user.user_type
                      .split("_")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      ) 
                      .join(" ") 
              }
            </span>
          </div>
          <ChevronDown size={18} className="text-gray-600" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] border-none p-2 rounded-md w-44"
          align="end"
          side="bottom"
        >
          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2 text-gray-700 focus:bg-violet-100 focus:text-violet-600 transition-colors"
            onClick={() => navigate({ to: "/view-profile" })}
          >
            <User size={16} className="hover:text-violet-600" />
            <span>View Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2 text-gray-700 group focus:bg-violet-100 focus:text-violet-600 transition-colors"
            onClick={() => {
              setUserToResetPassword(user.id);
              setResetPasswordDialogOpen(true);
            }}
          >
            <Key size={16} className="hover:text-violet-600" />

            <span>Update Password</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-white focus:bg-red-100 focus:text-red-600 transition-colors"
            onClick={handleLogout}
          >
            <LogOutIcon size={16} className="hover:text-red-600" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onCancelClick={() => {
          setResetPasswordDialogOpen(false);
          setResetError("");
        }}
        onOKClick={handlePasswordUpdate}
        error={resetError}
        resetLoading={resetLoading}
        dialogTitle="Update Password"
        label_1="Updating..."
        label_2="Update Password"
        label="Enter a new password for this user."
      />
    </div>
  );
};

export default UserDetails;
