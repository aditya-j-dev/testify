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
  }
}