import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { toast } from "sonner";
import { Pencil, Loader, X, SquarePen, ArrowLeft } from "lucide-react";
import { getusersByIdAPI, UserUpdateAPI } from "@/https/services/users";
import { Button } from "../ui/button";
import { errPopper } from "@/lib/helpers/errPoppers";
import { useRouter } from "@tanstack/react-router";
import { Input } from "../ui/input";

function ViewProfile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?.id;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userType, setUserType] = useState<any>("");
  const [userData, setUserData] = useState<any>({
    name: "",
    email: "",
    phone_number: "",
    profile_pic: "",
    disignation: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user data
  const { isLoading } = useQuery({
    queryKey: ["users", userId],
    enabled: !!userId,
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await getusersByIdAPI(Number(userId));
        if (response.success) {
          const data = response?.data?.data;
          setUserData({
            name: data?.display_name,
            email: data?.email,
            phone_number: data?.phone,
            profile_pic: data?.profile_pic,
            disignation: data?.designation,
          });
          setUserType({ user_type: data?.user_type });
        } else {
          throw response;
        }
      } catch (errData) {
        console.error(errData);
        errPopper(errData);
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const updateUser = useMutation({
    mutationFn: async (payload: any) => UserUpdateAPI(userId, payload),
    onSuccess: (res: any) => {
      if (res?.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setErrors({});

        const updatedUser = {
          ...storedUser,
          display_name: userData.name,
          email: userData.email,
          phone: userData.phone_number,
          designation: userData.disignation,
          user_type: userType.user_type,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        window.dispatchEvent(new Event("userUpdated"));
      } else {
        const message = res?.message || "Failed to update profile";
        toast.error(message);
      }
    },
    onError: (error: any) => {
      if (error?.status === 422 && error?.data?.errData) {
        // directly set backend validation errors
        setErrors(error.data.errData);
      } else {
        const message = error?.data?.message || "Failed to update user";
        toast.error(message);
      }
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    const payload = {
      display_name: userData.name,
      email: userData.email,
      phone: userData.phone_number,
      designation: userData.disignation,
      user_type: userType.user_type,
    };
    updateUser.mutate(payload);
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCancel = () => setIsEditing(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
      <img src="/6-dots-scale.svg" alt="loader" width={60} height={60} />
    </div>
    );
  }

  return (
    <Card className="flex flex-col p-4 shadow-none rounded-md bg-white m-4 border-0">
      <CardHeader className="flex-none md:mb-0 md:mr-4 relative bg-white border-none shadow-none p-0 rounded-md">
        <CardTitle className="text-xl font-medium p-0">
          <Button
            onClick={() => router.history.back()}
            className="hover:bg-white p-0 px-2 cursor-pointer bg-white border-none shadow-none text-black"
          >
            <ArrowLeft />
          </Button>
          Profile
        </CardTitle>

        <div className="relative">
          <img
            src="/table/profile.webp"
            alt="User Profile"
            className="w-32 h-32 rounded-full object-cover shadow"
          />
        </div>
      </CardHeader>

      <CardContent className="bg-white shadow-none rounded-md p-3 border">
        <div className="flex items-center justify-between relative mb-4">
          <div className="text-lg font-medium mb-2">Personal Information</div>
          {!isEditing ? (
            <Button
              className="bg-violet-600 font-light text-white px-4 py-0 h-7 rounded-sm text-sm absolute right-2 top-1 hover:bg-violet-700 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <SquarePen /> Edit
            </Button>
          ) : (
            <div className="absolute right-2 top-1 flex gap-2">
              <Button
                className="bg-gray-400 text-white px-4 py-0 h-7 rounded-sm text-sm hover:bg-gray-500 cursor-pointer font-light"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 text-white px-6 py-0 h-7 rounded-sm text-sm hover:bg-green-700 cursor-pointer font-light"
                onClick={handleSave}
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? (
                  <>
                    <Loader className="animate-spin w-4 h-4" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-base text-gray-700">
          <div>
            <p className="text-base text-neutral-400 flex items-center gap-1">
              Full Name
              {isEditing && <span className="text-red-500">*</span>}
            </p>
            {isEditing ? (
              <Input
                type="text"
                name="name"
                value={userData.name}
                onChange={(e) => {
                  handleInputChange(e);
                  clearFieldError("display_name");
                }}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              <p>{userData.name || "-"}</p>
            )}
            {errors.display_name && (
              <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>
            )}
          </div>

          <div>
            <p className="text-base text-neutral-400 flex items-center gap-1">
              Email
              {isEditing && <span className="text-red-500">*</span>}
            </p>
            {isEditing ? (
              <Input
                type="email"
                name="email"
                value={userData.email}
                onChange={(e) => {
                  handleInputChange(e);
                  clearFieldError("email");
                }}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              <p>{userData.email || "-"}</p>
            )}
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <p className="text-base text-neutral-400 flex items-center gap-1">
              Phone Number
              {isEditing && <span className="text-red-500">*</span>}
            </p>
            {isEditing ? (
              <Input
                type="text"
                name="phone_number"
                value={userData.phone_number}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    handleInputChange(e);
                    clearFieldError("phone");
                  }
                }}
                maxLength={10}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              <p>{userData.phone_number || "-"}</p>
            )}
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <p className="text-base text-neutral-400 flex items-center gap-1">
              Designation
              {isEditing && <span className="text-red-500">*</span>}
            </p>
            {isEditing ? (
              <Input
                type="text"
                name="disignation"
                value={userData.disignation}
                onChange={(e) => {
                  handleInputChange(e);
                  clearFieldError("designation");
                }}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              <p>{userData.disignation || "-"}</p>
            )}
            {errors.designation && (
              <p className="text-red-500 text-sm mt-1">{errors.designation}</p>
            )}
          </div>

          <div>
            <p className="text-base text-neutral-400 flex items-center gap-1">
              Role
              {isEditing && <span className="text-red-500">*</span>}
            </p>
            <p>
              {userType.user_type.charAt(0).toUpperCase() +
                userType.user_type.slice(1).toLowerCase()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ViewProfile;
