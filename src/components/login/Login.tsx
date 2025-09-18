import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

import loginimage from "src/assets/loginimage.png";
import slackicon from "src/assets/slackicon.svg";
import { slackAuthAPI, slackCallbackAPI } from "@/https/services/auth";
import { Loader2 } from "lucide-react";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  const [code2, setCode2] = useState<string>();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        alert("Unable to start Slack login. Please try again.");
      }
    },
    onError: () => {
      alert("Slack login error. Please try again.");
    },
  });

  // Slack Callback
  const slackCallbackMutation = useMutation({
    mutationFn: slackCallbackAPI,
    onSuccess: (data) => {
      if (data?.status === 200) {
        const user = data?.data?.data.user;
        const jwt_token = data?.data?.data.jwt_token;

        Cookies.set("user", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
        Cookies.set("token", jwt_token.access_token);
        Cookies.set("refreshToken", jwt_token.refresh_token);

        navigate({ to: "/dashboard" });
      }
    },
    onError: () => {
      navigate({ to: "/" });
    },
  });

  useEffect(() => {
    if (code2) {
      slackCallbackMutation.mutate(code2);
    }
  }, [code2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "signin") {
      console.log("Sign In:", { email, password });
      // Call your login API
    } else {
      console.log("Sign Up:", { email, password });
      // Call your register API
    }
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

          {/* Tabs */}
          <button
            onClick={() => slackAuthMutation.mutate()}
            className="flex items-center justify-center gap-3 w-full px-6 py-3 border border-gray-300 rounded-lg mb-6"
          >
            <img src={slackicon} alt="Slack" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">
              {slackAuthMutation.isPending || slackCallbackMutation.isPending ? (
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg text-sm focus:ring focus:ring-indigo-200 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg text-sm focus:ring focus:ring-indigo-200 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                // onClick={() => navigate({ to: "/forgot-password" })}
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              {activeTab === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
