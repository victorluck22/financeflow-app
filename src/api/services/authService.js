import httpClient from "../httpClient";

export const loginRequest = async (credentials) => {
  try {
    const { data } = await httpClient.post("/auth/login", credentials);
    return data;
  } catch (error) {
    throw error;
  }
};

export const preRegisterRequest = async (payload) => {
  const { data } = await httpClient.post("/auth/register", payload);
  return data;
};

export const setupPasswordRequest = async (payload) => {
  const { data } = await httpClient.post("/auth/setup-password", payload);
  return data;
};

export const forgotPasswordRequest = async (payload) => {
  const { data } = await httpClient.post("/auth/forgot-password", payload);
  return data;
};

export const resetPasswordRequest = async (payload) => {
  const { data } = await httpClient.post("/auth/reset-password", payload);
  return data;
};

export const updateProfileRequest = async (payload) => {
  const { data } = await httpClient.patch("/user/profile", payload);
  return data;
};

export const requestEmailChangeRequest = async (payload) => {
  const { data } = await httpClient.post("/auth/email-change/request", payload);
  return data;
};

export const confirmEmailChangeRequest = async (payload) => {
  const { data } = await httpClient.post("/auth/email-change/confirm", payload);
  return data;
};

export const searchShareUserByEmailRequest = async (email) => {
  const { data } = await httpClient.get("/user-shares/search", {
    params: { email },
  });
  return data;
};

export const listUserSharesRequest = async () => {
  const { data } = await httpClient.get("/user-shares");
  return data;
};

export const createUserShareRequest = async (payload) => {
  const { data } = await httpClient.post("/user-shares", payload);
  return data;
};

export const acceptUserShareRequest = async (id) => {
  const { data } = await httpClient.post(`/user-shares/${id}/accept`);
  return data;
};

export const revokeUserShareRequest = async (id) => {
  const { data } = await httpClient.post(`/user-shares/${id}/revoke`);
  return data;
};

export const logoutRequest = async () => {
  try {
    const { data } = await httpClient.post("/auth/logout");
    return data;
  } catch (error) {
    console.error("Error on logout: ", error);
    // Não lançar erro - logout local deve funcionar mesmo se API falhar
    return null;
  }
};
