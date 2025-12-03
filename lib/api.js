import axios from "axios";
import toast from "react-hot-toast";

// Set your API base URL here
// const API_BASE_URL = "http://127.0.0.1:8000/api"; // 🔁 Replace with your actual API URL
// const API_BASE_URL ="https://floralwhite-porpoise-504857.hostingersite.com/api";

const { API_URL } = require("@/helpers/apiUrl");

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL + "api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
// Automatically attach token (if exists)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// POST request
export const post = async (url, data) => {
  try {
    const response = await api.post(url, data);
    toast.success(response.data.message || "Saved Successfully");
    return response.data;
  } catch (error) {
    // console.log("Error:", error);
    toast.error(error.response?.data?.message || "Network error");
    return error.response?.data || { message: "Network error" };
  }
};

// GET request
export const get = async (url, data = null) => {
  try {
    const response = await api.get(url, { params: data });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Network error" };
  }
};

// PUT request
export const put = async (url, data) => {
  try {
    const response = await api.put(url, data);
    toast.success(response.data.message || "Saved Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Network error");
    return error.response?.data || { message: "Network error" };
  }
};

//delete request
export const deleteRequest = async (url, data = null) => {
  try {
    const response = await api.delete(url, { params: data });
    toast.success(response.data.message || "Saved Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Network error");
    throw error.response?.data || { message: "Network error" };
  }
};

// get current user from local storage
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
// get token from local storage
export const getToken = () => {
  const token = localStorage.getItem("auth_token");
  return token ? token : null;
};

// Export as default for custom use
// Assign the object to a variable before exporting
const apiMethods = {
  post,
  get,
  put,
  getCurrentUser,
  getToken,
  deleteRequest,
};

export default apiMethods;
