// export function setToken(token) {
//   localStorage.setItem("token", token);
// }

// export function getToken() {
//   return localStorage.getItem("token");
// }

// export function removeToken() {
//   localStorage.removeItem("token");
// }

// export function isAuthenticated() {
//   return !!getToken();
// }/

export function setToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    document.cookie = `testify-token=${token}; path=/; max-age=604800; samesite=lax`;
  }
}

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    document.cookie = `testify-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}