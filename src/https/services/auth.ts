import { $fetch } from "@/https/fetch";
import { SlackAuthResponse, SlackCallbackResponse } from "@/interfaces/auth";

export const slackAuthAPI = async (): Promise<SlackAuthResponse> => {
  try {
    const response = await $fetch.get("/auth/slack");
    return response as SlackAuthResponse;
  } catch (error) {
    throw error;
  }
};

export const slackCallbackAPI = async (code: string): Promise<SlackCallbackResponse> => {
  try {
    const response = await $fetch.get(`/auth/slack/callback`, { code });
    return response as SlackCallbackResponse;
  } catch (error) {
    throw error;
  }
};

export const LoginAPI = async (payload: {
  email: string;
  password: string;
}) => {
  try {
    const response = await $fetch.post("/auth/login", payload);
    return response;
  } catch (err) {
    throw err;
  }
};
