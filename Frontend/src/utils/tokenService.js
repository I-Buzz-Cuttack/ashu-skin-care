// export const getToken = () => localStorage.getItem("access_token");
export const getToken = () =>
  localStorage.getItem("hms_token") || sessionStorage.getItem("hms_token");

const getAuthStorage = () =>
  sessionStorage.getItem("hms_user") ? sessionStorage : localStorage;

export const setToken = (token, storage = getAuthStorage()) => {
  if (!token) return;
  storage.setItem("hms_token", token);
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("hms_token");
  localStorage.removeItem("refresh_token");
  sessionStorage.removeItem("hms_token");
  sessionStorage.removeItem("refresh_token");
};
