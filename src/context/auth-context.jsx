// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { getToken, removeToken } from "@/lib/auth";
// import { apiRequest } from "@/lib/api";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {

//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Load user on app start
//   useEffect(() => {

//     async function loadUser() {

//       try {

//         const token = getToken();

//         if (!token) {
//           setLoading(false);
//           return;
//         }

//         const res = await apiRequest("/auth/profile");
//         console.log("PROFILE RESPONSE:", res);
//         setUser(res.user);

//       } catch {

//         removeToken();
//         setUser(null);

//       } finally {

//         setLoading(false);

//       }

//     }

//     loadUser();

//   }, []);

//   function login(userData) {
//     setUser(userData);
//   }

//   function logout() {

//     removeToken();
//     setUser(null);

//     window.location.href = "/login";

//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         logout,
//         isAuthenticated: !!user,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );

// }

// export function useAuth() {

//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }

//   return context;

// }

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {

    try {

      const token = getToken();

      if (!token) {
        setUser(null);
        return;
      }

      const res = await apiRequest("/auth/profile");

      setUser(res.user);

    } catch {

      removeToken();
      setUser(null);

    }

  }

  useEffect(() => {

    async function init() {

      await loadUser();
      setLoading(false);

    }

    init();

  }, []);

  async function login(userData) {

    // set immediately for instant UI update
    setUser(userData);

    // optional: reload from server for accuracy
    await loadUser();

  }

  function logout() {

    removeToken();
    setUser(null);
    window.location.href = "/login";

  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        loadUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;

}