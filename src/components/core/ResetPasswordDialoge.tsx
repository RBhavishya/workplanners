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
  error,
  dialogTitle,
  label_1,
  label_2
}: {
  open: boolean;
  label: string;
  onCancelClick: () => void;
  onOKClick: (newPassword: string) => void;
  resetLoading: boolean;
  error?: string;
  dialogTitle: string;
  label_1?: string;
  label_2?: string;
}) => {
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleConfirm = async () => {
    onOKClick(password);
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

  if (!open) return null;


  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancelClick()}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {label || "Enter a new password for this user."}
          </DialogDescription>
        </DialogHeader>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-sm 3xl:!text-base mb-1">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              className="bg-[#F5F6FA] appearance-none block py-1 h-10 text-lg 3xl:text-xl focus:outline-none focus:border-gray-500 focus-visible:ring-0 focus-visible:shadow-none placeholder:text-sm placeholder:text-slate-600 border rounded-md text-md w-full pr-10"
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
              {passwordVisible ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm 3xl:!text-base mt-1">{error}</p>}
        </div>

        <DialogFooter>
          {/* Reset Button */}
            <Button
            type="button"
            variant="default"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-sm flex items-center gap-2 cursor-pointer font-normal"
            onClick={handleConfirm}
            disabled={resetLoading}
          >
            {resetLoading && (
              <Loader2 className="animate-spin h-4 w-4 text-white" />
            )}
            {resetLoading ? `${label_1}` : `${label_2}`}
          </Button>

          {/* Cancel Button */}
          <Button
            type="button"
            className="px-4 py-2 border rounded-sm hover:bg-gray-100 disabled:opacity-50 cursor-pointer shadow-none font-normal"
            variant="outline"
            onClick={onCancelClick}
            disabled={resetLoading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
