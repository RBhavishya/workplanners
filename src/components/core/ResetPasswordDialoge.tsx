import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";

const ResetPasswordDialog = ({
  open,
  label,
  onCancelClick,
  onOKClick,
  resetLoading,
}: {
  open: boolean;
  label: string;
  onCancelClick: () => void;
  onOKClick: (newPassword: string) => void;
  resetLoading: boolean;
}) => {
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleConfirm = () => {
    if (password.trim()) {
      onOKClick(password);
    }
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    if (!open) {
      setPassword("");
      setPasswordVisible(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (password.trim() !== "") {
      onOKClick(password);
      setPassword(""); 
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancelClick()}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {label || "Enter a new password for this user."}
          </DialogDescription>
        </DialogHeader>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-sm mb-1">New Password</label>
          <div className="relative">
            <Input
              className="bg-[#F5F6FA] appearance-none block py-1 h-10 text-lg focus:outline-none focus:border-gray-500 focus-visible:ring-0 focus-visible:shadow-none placeholder:text-sm placeholder:text-slate-600 border rounded-md text-md w-full pr-10"
              id="password"
              placeholder="Enter Password"
              value={password}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              type="text" 
              autoComplete="off"
              style={
                {
                  WebkitTextSecurity: passwordVisible ? "none" : "disc",
                } as any
              }
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-800"
            >
              {passwordVisible ? <Eye /> : <EyeOff />}
            </button>
          </div>
        </div>

        <DialogFooter>
          {/* Reset Button */}
          <button
            type="button"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 cursor-pointer"
            onClick={handleConfirm}
            disabled={resetLoading || !password.trim()}
          >
            {resetLoading && (
              <Loader2 className="animate-spin h-4 w-4 text-white" />
            )}
            {resetLoading ? "Resetting..." : "Reset Password"}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            onClick={onCancelClick}
            disabled={resetLoading}
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
