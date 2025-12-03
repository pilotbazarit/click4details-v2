export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_LIVECHAT_API_URL || 'http://localhost:5000';
};
