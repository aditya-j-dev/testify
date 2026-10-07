export function requireRole(requiredRole) {

  return function(decodedToken) {

    if (!decodedToken) {
      throw new Error("Unauthorized");
    }

    if (decodedToken.role !== requiredRole) {
      throw new Error("Forbidden: insufficient permissions");
    }

  };

}