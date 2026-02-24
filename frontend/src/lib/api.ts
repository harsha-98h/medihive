import axios from "axios";

export const api = axios.create({
  baseURL: "https://medihive-production.up.railway.app/api",
});
