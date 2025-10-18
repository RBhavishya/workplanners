import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import loginimage from "../../assets/loginimage.png";
import slackicon from "../../assets/slackicon.svg";
import {
  LoginAPI,
  slackAuthAPI,
  slackCallbackAPI,
} from "@/https/services/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { loginProps } from "@/interfaces";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  const [code2, setCode2] = useState<string>();
  const [loginDetails, setLoginDetails] = useState({ email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  interface User {
    id: number;
    name: string;
    email: string;
    user_type: "ADMIN" | "MANAGER" | "EMPLOYEE";
  }

  interface JwtToken {
    access_token: string;
    refresh_token: string;
  }

  interface SlackCallbackData {
    user: User;
    jwt_token: JwtToken;
  }

  useEffect(() => {
    if (search?.code) {
      setCode2(search.code);
    }
  }, [search]);

  // Slack Auth
  const slackAuthMutation = useMutation({
    mutationFn: slackAuthAPI,
    onSuccess: (response) => {
      const { data } = response?.data;
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("Unable to start Slack login. Please try again.");
      }
    },
    onError: () => {
      toast.error("Slack login error. Please try again.");
    },
  });

  const slackCallbackMutation = useMutation({
    mutationFn: slackCallbackAPI,
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        const user: User = data?.data?.data.user;
        const jwt_token: JwtToken = data?.data?.data.jwt_token;

        if (!user || !jwt_token) return;

        Cookies.set("user", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
        Cookies.set("token", jwt_token.access_token);
        Cookies.set("refreshToken", jwt_token.refresh_token);

        let redirectPath = "/dashboard";
        switch (user.user_type) {
          case "EMPLOYEE":
            redirectPath = "/tasks";
            break;
          case "ADMIN":
          case "MANAGER":
          default:
            redirectPath = "/dashboard";
        }

        navigate({ to: redirectPath });
      }
    },
    onError: () => {
      navigate({ to: "/" });
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (loginDetails: loginProps) => {
      const response = await LoginAPI(loginDetails);
      if (response?.status === 200 || response?.status === 201) {
        return response;
      }
      throw response;
    },
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Login successful");
      const { access_token, user_details } = res?.data?.data;

      Cookies.set("token", access_token);
      localStorage.setItem("user", JSON.stringify(user_details));
      setErrors({});

      let redirectPath = "/dashboard";
      if (
        user_details?.user_type === "EMPLOYEE" ||
        user_details?.user_type === "TEAM_LEAD"
      ) {
        redirectPath = "/tasks";
      } else if (
        user_details?.user_type === "ADMIN" ||
        user_details?.user_type === "MANAGER"
      ) {
        redirectPath = "/dashboard";
      }

      navigate({ to: redirectPath });
    },
    onError: (error: any) => {
      setErrors({});
      if (error?.status === 422 && error?.data?.errData) {
        setErrors(error.data.errData);
      } else {
        toast.error(
          error?.data?.message || "invalid credentials"
        );
      }
    },
  });
  useEffect(() => {
    if (code2) {
      slackCallbackMutation.mutate(code2);
    }
  }, [code2]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    mutate(loginDetails);
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left side illustration */}
      <div className="w-1/2 h-full">
        <img
          src={loginimage}
          alt="Login Illustration"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right side login */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 rounded-xl border shadow-md">
          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-2">
            Welcome Back.
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Sign In To Your Account Or Create New One
          </p>

          {/* Slack button */}
          <button
            onClick={() => slackAuthMutation.mutate()}
            className="flex items-center justify-center gap-3 w-full px-6 py-3 border border-gray-300 rounded-lg mb-6 cursor-pointer"
          >
            <img src={slackicon} alt="Slack" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">
              {slackAuthMutation.isPending ||
              slackCallbackMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                </span>
              ) : (
                "Continue with Slack"
              )}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            or continue with email
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Email + Password form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                placeholder=" Enter your Email"
                onChange={(e) =>
                  setLoginDetails({
                    ...loginDetails,
                    email: e.target.value,
                  })
                }
              />
              {errors?.email && (
                <p className="text-xs pt-1 text-red-600">
                  {errors.email.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full">
                <Input
                  id="password"
                  placeholder="Enter your Password"
                  // type={passwordVisible ? "text" : "password"}
                  value={loginDetails.password}
                  onChange={(e) =>
                    setLoginDetails({
                      ...loginDetails,
                      password: e.target.value,
                    })
                  }
                  type="text"
                  autoComplete="off"
                  style={
                    {
                      WebkitTextSecurity: passwordVisible ? "none" : "disc",
                    } as any
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-800 cursor-pointer"
                >
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </button>
              </div>
              {errors?.password && (
                <p className="text-xs pt-1 text-red-600">
                  {errors.password.join(", ")}
                </p>
              )}
            </div>
            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                // onClick={() => navigate({ to: "/forgot-password" })}
                className="text-sm text-indigo-600 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
