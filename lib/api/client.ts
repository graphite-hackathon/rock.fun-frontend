import axios from "axios";

const client = axios.create({
  baseURL:
    // import.meta.env.VITE_PUBLIC_API_URL ||
    "https://rock-fun-backend.onrender.com"
});

client.interceptors.request.use((config) => {
  console.log(localStorage.getItem("jwt"));
  if (localStorage.getItem("jwt")) {
    config.headers.Authorization = `Bearer ${localStorage.getItem("jwt")}`;
  }
  config.headers["ngrok-skip-browser-warning"] = "true";
  return config;
});
export default client;
