export const IP_ADDRESS = import.meta.env.VITE_SERVER_IP || "localhost";

export const EXPRESS_SERVER_URL =
  (import.meta.env.VITE_EXPRESS_SERVER_URL || `http://${IP_ADDRESS}:3000`).replace(/\/$/, "");

export const WS_SERVER_URL =
  (import.meta.env.VITE_WS_SERVER_URL || `ws://${IP_ADDRESS}:5000`).replace(/\/$/, "");