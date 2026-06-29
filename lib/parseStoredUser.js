export const parseStoredUser = (value) => {
  if (!value) return null;

  try {
    const parsedUser = typeof value === "string" ? JSON.parse(value) : value;
    return typeof parsedUser === "string" ? JSON.parse(parsedUser) : parsedUser;
  } catch (error) {
    console.log("Failed to parse user data", error);
    return null;
  }
};