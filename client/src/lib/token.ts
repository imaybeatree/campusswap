export const getToken = () => {
  return localStorage.getItem("campusswap-token");
};

export const setToken = (token: string) => {
  localStorage.setItem("campusswap-token", token);
};

export const signOut = () => {
  localStorage.removeItem("campusswap-token");
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  // decode jwt token to check expiration
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiration = payload.exp * 1000; // convert to milliseconds
    if (expiration < Date.now()) {
      // Token is expired
      throw new Error();
    }
    return true;
  } catch {
    signOut();
    return false;
  }
};
