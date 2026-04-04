import { apiRequest } from "@/lib/api";
import { setToken, removeToken } from "@/lib/auth";

export async function loginService({ email, password }) {

  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  // store token securely
  setToken(res.token);

  return res.user;
}

export function logoutService() {

  removeToken();

  // optional: redirect handled by UI

}

export async function registerService(data) {
  const res = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  setToken(res.token);

  return res.user;
}