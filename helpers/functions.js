import dayjs from "dayjs";

import utc from "dayjs/plugin/utc"; // dependent on utc plugin
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import weekOfYear from "dayjs/plugin/weekOfYear";

export function onlyNumberInput(e) {
  const allowedKeys = [
    "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"
  ];
  const isNumber = /^[0-9]$/.test(e.key);

  if (!isNumber && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
}


export const formatPriceUSA = (price) => {
  if (!price || isNaN(price)) return price;
  return Number(price).toLocaleString('en-US');
};


export const formatPrice = (price) => {
  if (!price || isNaN(price)) return price;
  return Number(price).toLocaleString('en-IN');
};

export function onlyDecimalInput(e) {
  const allowedKeys = [
    "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", ".", "Home", "End",
  ];
  const isNumber = /^[0-9]$/.test(e.key);

  if (!isNumber && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }

  // Prevent multiple decimals
  if (e.key === "." && e.currentTarget.value.includes(".")) {
    e.preventDefault();
  }
}

export function getQueryString(name, url = window.location.href) {
  name = name.replace(/[\\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Create form data
 * @param  {[object]}   data
 * @return {[mixed]}
 */
export const createFormData = (data, Type = FormData) => {
  if (![FormData, URLSearchParams].includes(Type)) {
    return data;
  }
  const formData = new Type();
  for (const key in data) {
    if (data[key] instanceof File) {
      formData.append(key, data[key], data[key].name);
    } else {
      formData.append(key, data[key]);
    }
  }
  return formData;
};

export const toDotObject = (inputData = {}) => {
  const data = {};
  const recursive = (obj, prefix = "") => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && !(obj[key] instanceof File)) {
        const updatedData = recursive(obj[key], `${prefix + key}.`);
        if (updatedData) {
          data[`${prefix}${key}`] = updatedData;
        }
      } else if (obj[key]) {
        data[`${prefix}${key}`] = obj[key];
      }
    }
    return null;
  };
  recursive(inputData);
  return data;
};

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const dates = (dateString) => {
  const TZ = "Europe/London";
  // eslint-disable-next-line no-unused-vars
  const TZ_CODE = "en-EU";

  const instance = dayjs;
  instance.extend(utc);
  instance.extend(timezone);
  instance.extend(weekOfYear);
  instance.extend(relativeTime);
  instance.tz.setDefault(TZ);
  return instance.tz(dateString, TZ);
};

export const formatDateWithTz = (date, format = "DD MMM, YYYY - hh:mma") =>
  dates(date).format(format);
export const formatDate = (date, format = "DD MMM, YYYY - hh:mma") =>
  dayjs(date).format(format);

export const formatNumber = (number) =>
  number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");

/**
 * Filter an object
 * @param  {[type]}   obj      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
export function filterObject(obj, callback) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, val]) => callback(val, key))
  );
}

/**
 * Get the env variable
 * @param  {[name]} Boolean
 * @return {[Boolean]}
 */
export function env(key) {
  let name = key;

  if (!key.startsWith("NODE_")) {
    name = `REACT_APP_${key}`;
  }

  if (process === undefined) {
    return false;
  }

  return process.env[name];
}

/**
 * Check the env
 * @param  {[name]} Boolean
 * @return {[Boolean]}
 */
export function isEnv(name) {
  const currentEnv = env("NODE_ENV");
  if (Array.isArray(name)) {
    return name.includes(currentEnv);
  }
  return currentEnv === name;
}

/**
 * Conditionally callback or do something
 * @param  {[condition]} Boolean
 * @param  {Function} callback
 * @return {[mixed]}            [callback value]
 */
export function when(condition, callback, defaultValue = null) {
  if (condition) {
    if (typeof callback === "function") {
      callback(condition);
    }
    return callback;
  }
  return defaultValue;
}

/**
 * Strip html tag an object
 * @param  {[string]}   txt
 * @return {[string]}
 */
export function stripTags(txt) {
  return `${txt}`.replace(/(<([^>]+)>)/gi, "");
}

/**
 * Error handler
 * @param  {[object]}   error
 * @return {[mixed]}
 */
export const errorHandler = (error) => {
  if (error.response) {
    return Promise.reject(error.response.data, error);
  }
  if (error.request) {
    return Promise.reject(error.request, error);
  }
  return Promise.reject(error.message, error);
};

/**
 * Format user permissions from string array to object array
 * @param  {Array<string>} permissions - Array of permission strings (e.g., ["120.Vehicle.Create", "102.Shop.Update"])
 * @return {Array<Object>} - Formatted permissions array with shopId, section, and action
 * @example
 * formatPermissions(["120.Vehicle.Create", "102.Shop.Update", "*.*.*"])
 * // Returns: [
 * //   { shopId: 120, section: "Vehicle", action: "Create" },
 * //   { shopId: 102, section: "Shop", action: "Update" }
 * // ]
 */
export const formatPermissions = (permissions) => {
  if (!permissions || !Array.isArray(permissions)) return [];

  return permissions
    .filter(permission => {
      // Filter out only fully wildcard permissions like "*.*.*"
      const parts = permission.split('.');
      return parts.length === 3 && parts[0] !== '*';
    })
    .map(permission => {
      const [shopId, section, action] = permission.split('.');
      return {
        shopId: parseInt(shopId),
        section: section,
        action: action
      };
    });
};
