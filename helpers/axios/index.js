import axios from "axios";
import { errorHandler } from "../functions";

const setAuthTokenBeforeRequest = (config) => {
  let access_token = localStorage.getItem("auth_token");

  if (!access_token) {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        if (user && user.token) {
          access_token = user.token;
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    }
  }

  if (!config.headers) {
    config.headers = {};
  }

  if (!config.headers.Authorization && access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }

  return config;
};


export function createApiRequest(baseUrl, config = {}) {
  const apiInstance = axios.create({
    baseURL: baseUrl,
    ...config
  });

  apiInstance.interceptors.request.use(setAuthTokenBeforeRequest, (error) =>
    errorHandler(error)
  );

  apiInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Clear token if needed
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");

        if (error.response?.data?.message === 'Unauthenticated.') {
          window.location.href = "/";
          return; // Prevent further execution
        }
      }

      // This will now be reached only if:
      // - error.response.status !== 401
      // - or status is 401 but message !== 'Unauthenticated.'
      return errorHandler(error);
    }
  );

  return apiInstance;
}

// export function createApiRequest(baseUrl, config = {}) {
//   const apiInstance = axios.create({
//     baseURL: baseUrl,
//     ...config
//   });

//   apiInstance.interceptors.request.use(setAuthTokenBeforeRequest, (error) =>
//     errorHandler(error)
//   );

//   apiInstance.interceptors.response.use(

//     (response) => response.data,
//     (error) => {
//       if (error.response?.status === 401) {
//         // Clear token if needed
//         localStorage.removeItem("auth_token");
//         localStorage.removeItem("user");

//         if (error.response?.data?.message === 'Unauthenticated.') {
//           window.location.href = "/";
//           return; // Prevent further execution
//         }
//         else {
//           return errorHandler(error);
//         }
//       }
//     }
//   );

//   return apiInstance;
// }
