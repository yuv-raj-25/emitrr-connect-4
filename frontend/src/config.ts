// Point this to your backend server
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://emitrr-connect-4.onrender.com";

export const WS_URL = BACKEND_URL.replace(/^http/, "ws");
export const API_URL = BACKEND_URL;