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
    token: {
      access_token: string;
      refresh_token: string;
      expires_at: string;
      
    };
    jwt_token: {
            expires_at(arg0: string, expires_at: any): unknown;
            access_token: string,
            refresh_token: string
        };
  };
};
  message?: string;
}
