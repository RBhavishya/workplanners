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
import { Pencil, Loader, X } from "lucide-react";
import { getusersByIdAPI, UserUpdateAPI } from "@/https/services/users";
import { Button } from "../ui/button";
import { errPopper } from "@/lib/helpers/errPoppers";

function ViewProfile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?.id;

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
          setUserType({
            user_type: data?.user_type,
          });
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
  });

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      return await UserUpdateAPI(userId, payload);
    },
    onSuccess: async (res: any) => {
      if (res?.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    },
    onError: (err) => {
      errPopper(err);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setIsUploading(true);
    }
  };

  const handleRemoveFile = () => {
    setPreviewUrl(null);
    setUserData((prev: any) => ({
      ...prev,
      profile_pic: "",
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = () => {
    const payload = {
      display_name: userData.name,
      email: userData.email,
      phone: userData.phone_number,
      designation: userData.disignation,
    };

    updateUser(payload);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-sm text-gray-500">Loading user details...</p>
      </div>
    );
  }

  return (
    <Card className="flex flex-col p-4 shadow-lg rounded-lg bg-transparent shadow-none border-0">
      <CardHeader className="flex-none mb-4 md:mb-0 md:mr-4 relative bg-white border shadow p-0 rounded-md divide-y divide-gray-300 space-y-2">
        <CardTitle className="text-xl font-semibold p-2 relative">
          {!isEditing ? (
            <Button
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition right-2 top-1 absolute cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="absolute right-2 top-1 flex gap-2">
              <Button
                className="bg-gray-400 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-500 transition cursor-pointer"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition cursor-pointer"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          )}
          Profile Information
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
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow"
                />
                {isUploading && (
                  <div className="absolute w-32 h-32 inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 rounded-full">
                    <Loader className="text-white w-6 h-6 animate-spin" />
                  </div>
                )}
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-0 right-0 bg-red-500 p-1 rounded-full border border-white"
                >
                  <X className="text-white w-4 h-4" />
                </button>
              </div>
            ) : (
              <img
                src={
                  userData.profile_pic && userData.profile_pic.trim() !== ""
                    ? userData.profile_pic
                    : "/table/profile.webp"
                }
                alt="User Profile"
                className="w-32 h-32 rounded-full object-cover flex items-center justify-center border-2 border-gray-300 shadow"
              />
            )}
             <span className="absolute bottom-2 left-3 bg-blue-700 text-white rounded-full p-1">
            <Pencil className="w-4 h-4" />
          </span>
          </label>
        </div>
      </CardHeader>

      <CardContent className="space-x-4 bg-white shadow rounded-md p-2 divide-y divide-gray-300 space-y-2">
        <div className="text-xl font-semibold p-2">Personal Information</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700">
          <div>
            <strong>Full Name:</strong>
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
            <strong>Email:</strong>
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
            <strong>Phone Number:</strong>
            {isEditing ? (
              <input
                type="text"
                name="phone_number"
                value={userData.phone_number}
                onChange={handleInputChange}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              <p>{userData.phone_number || "-"}</p>
            )}
          </div>

          <div>
            <strong>Designation:</strong>
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
            <strong>User Type:</strong>
            <p>{userType.user_type || "-"}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-4 md:mt-0"></CardFooter>
    </Card>
  );
}

export default ViewProfile;
