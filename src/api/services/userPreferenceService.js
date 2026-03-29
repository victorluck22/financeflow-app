import httpClient from "../httpClient";

export const updateUserPreferences = async (payload) => {
  const { data } = await httpClient.patch("/user/preferences", payload);
  return data;
};
