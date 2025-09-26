// src/utils/auth.js
import { jwtDecode } from "jwt-decode";

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token); // <-- correct function
    if (!decoded.exp) return false;
    // exp is in seconds, Date.now() is in ms
    return decoded.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
}
