import axios from "axios";

export const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");
};

export const getFileUrl = (filePath) => {
    if (!filePath) return "#";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
    const apiUrl = getBaseUrl();
    const baseOrigin = apiUrl.replace(/\/api\/?$/, "");
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return baseOrigin ? `${baseOrigin}/${cleanPath}` : `/${cleanPath}`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;

