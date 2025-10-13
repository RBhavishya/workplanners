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
import {  useRouter } from "@tanstack/react-router";

function ViewProfile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?.id;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userType, setUserType] = useState<any>("");
  const [userData, setUserData] = useState<any>({
    name: "",
    email: "",
    phone_number: "",
    profile_pic: "",
    disignation: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // Update user
  const updateUser = useMutation({
    mutationFn: async (payload: any) => UserUpdateAPI(userId, payload),
    onSuccess: (res: any) => {
      if (res?.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);

        // Update localStorage
        const updatedUser = {
          ...storedUser,
          display_name: userData.name,
          email: userData.email,
          phone: userData.phone_number,
          designation: userData.disignation,
          profile_pic: previewUrl || userData.profile_pic,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Dispatch event for header update
        window.dispatchEvent(new Event("userUpdated"));
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    },
    onError: (err) => errPopper(err),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setIsUploading(true);
    }
  };

  const handleRemoveFile = () => {
    setPreviewUrl(null);
    setUserData((prev: any) => ({ ...prev, profile_pic: "" }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    const payload = {
      display_name: userData.name,
      email: userData.email,
      phone: userData.phone_number,
      designation: userData.disignation,
    };
    updateUser.mutate(payload);
  };

  const handleCancel = () => setIsEditing(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-sm text-gray-500">Loading user details...</p>
      </div>
    );
  }

  return (
    <Card className="flex flex-col p-4 shadow-none rounded-md bg-white m-4 border-0">
      <CardHeader className="flex-none md:mb-0 md:mr-4 relative bg-white border-none shadow-none p-0 rounded-md">
        <CardTitle className="text-xl font-medium p-0">
          <Button onClick={() => router.history.back()} className="hover:bg-white p-0 px-2 cursor-pointer bg-white border-none shadow-none text-black">
          <ArrowLeft />
          </Button>
          Profile
        </CardTitle>

        <div className="p-2 w-fit">
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer relative w-32 h-32"
          >
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover shadow"
                /> 
              </div>
            ) : (
              <div className="relative">
                <img
                  src={
                    userData.profile_pic?.trim()
                      ? userData.profile_pic
                      : "/table/profile.webp"
                  }
                  alt="User Profile"
                  className="w-32 h-32 rounded-full object-cover shadow"
                />
              </div>
            )}
          </label>
        </div>
      </CardHeader>

      <CardContent className="bg-white shadow-none rounded-md p-3 border">
        <div className="flex items-center justify-between relative mb-4">
        <div className="text-lg font-medium mb-2">
          Personal Information
        </div>
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
                {updateUser.isPending? (
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
            <p className="text-base text-neutral-400">Full Name</p>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              <p>{userData.name || "-"}</p>
            )}
          </div>

          <div>
          <p className="text-base text-neutral-400">Email</p>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              <p>{userData.email || "-"}</p>
            )}
          </div>

          <div>
          <p className="text-base text-neutral-400">Phone Number</p>
            {isEditing ? (
              <input
                type="text"
                name="phone_number"
                value={userData.phone_number}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    handleInputChange(e);
                  }
                }}
                maxLength={10}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              <p>{userData.phone_number || "-"}</p>
            )}
          </div>

          <div>
          <p className="text-base text-neutral-400">Designation</p>
            {isEditing ? (
              <input
                type="text"
                name="disignation"
                value={userData.disignation}
                onChange={handleInputChange}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              <p>{userData.disignation || "-"}</p>
            )}
          </div>

          <div>
          <p className="text-base text-neutral-400">User Type</p>
            <p>{userType.user_type.charAt(0).toUpperCase() + userType.user_type.slice(1).toLowerCase()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ViewProfile;
