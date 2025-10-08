import { $fetch } from "../fetch";

// export const getSingleViewUserAPI = async (id: any | undefined) => {
//     //  const queryParams = {
//     //    metadata: true,
//     //  };
//     try {
//       return await $fetch.get(`/users/${id}`);
//     } catch (err) {
//       throw err;
//     }
//   };
  export const uploadProfileAPI = async (userId: any, payload: any) => {
    try {
      return await $fetch.patch(`/users/${userId}/profile-pic`, payload);
    } catch (err: any) {
      throw err;
    }
  };

  export const uploadToS3API = async (url: string, file: File) => {
  try {
    const options = {
      method: "PUT",
      body: file,
    };
    return await fetch(url, options);
  } catch (err) {
    throw err;
  }
};

export const fileUploadAPI = async (payload: any) => {
  try {
    return await $fetch.post(`/files/upload`, payload);
  } catch (err) {
    throw err;
  }
};