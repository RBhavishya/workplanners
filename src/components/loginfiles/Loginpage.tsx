import * as React from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import loginimage from "src/assets/loginimage.png";
import slackicon from "src/assets/slackicon.png";

import { slackAuthAPI, slackCallbackAPI } from "@/https/services/auth";
import Cookies from "js-cookie";

const Loginpage = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  const [code2, setCode2] = useState<string>();

  useEffect(() => {
    if (search?.code) {
      setCode2(search.code);
    }
  }, [search]);

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

  const slackCallbackMutation = useMutation({
    mutationFn: slackCallbackAPI,
    onSuccess: (data) => {
      console.log(data);
      if (data?.status === 200) {
        const user = data?.data?.data.user;
        const token = data?.data?.data.jwt_token;
        if (user && token) {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("access_token", token.access_token);
          localStorage.setItem("refresh_token", token.refresh_token);
          // localStorage.setItem("expires_at", String(token.expires_at));
          Cookies.set("token", token.access_token);
          Cookies.set("refreshToken", token.refresh_token);
          navigate({ to: "/dashboard" });
        }
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

  return (
    <div className="flex h-screen w-screen">
      {/* Left side image */}
      <div className="w-1/2 h-full flex items-center justify-center bg-white">
        <img
          src={loginimage}
          alt="Login Illustration"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right side login */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-white">
        <div className="text-center space-y-8 px-6">
          <p className="uppercase tracking-wider text-gray-600 font-medium">
            Welcome Back.
          </p>
          <button
            onClick={() => slackAuthMutation.mutate()}
            className="flex items-center gap-3 px-6 py-3 border border-gray-300 rounded-lg"
          >
            <img src={slackicon} alt="Slack" className="w-5 h-5" />
            <span className="text-gray-700 font-medium cursor-pointer">
              {slackAuthMutation.isPending || slackCallbackMutation.isPending
                ? "Logging in..."
                : "Continue with Slack"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;
