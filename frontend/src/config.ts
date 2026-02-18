// Point this to your backend server
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const WS_URL = BACKEND_URL.replace(/^http/, "ws");
export const API_URL = BACKEND_URL;