export interface SlackAuthResponse {
  success: boolean;
  status: number;
  data: {
   data:{ authUrl: string;}
  };
  message?: string;
}

export interface SlackCallbackResponse {
  success: boolean;
  status: number;
  data: {
    data:{
    user: {
      id: number;
      name: string;
      email?: string;
    
    };
    jwt_token: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };
  };
};
  message?: string;
}