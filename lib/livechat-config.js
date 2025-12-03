// Live Chat Configuration
// NOTE: Chat IDs are now DYNAMIC based on user context
// This config provides defaults, but actual chatId is determined at runtime
export const liveChatConfig = {
  // API base URL for live chat backend
  // Replace with your actual live chat API URL
  apiUrl: process.env.NEXT_PUBLIC_LIVECHAT_API_URL || 'http://localhost:5000',
  
  // Socket.io server URL
  // Replace with your actual socket server URL
  socketUrl: process.env.NEXT_PUBLIC_LIVECHAT_SOCKET_URL || 'http://localhost:5000',
  
  // Default Chat ID (used when no specific context is detected)
  // Dynamic chat IDs are generated based on:
  // - Main site: pbl-chat-001
  // - User shops: shop-{shopId}
  // - Company shops: company-{companyId}
  // - Seller's own shop: user-{userId}
  // - Admin: pbl-chat-admin
  chatId: process.env.NEXT_PUBLIC_LIVECHAT_DEFAULT_CHAT_ID || 'pbl-chat-001',
  
  // Default theme (theme1, theme2, or theme3)
  defaultTheme: 'theme3', // Theme3 is the most modern
  
  // Position settings
  position: {
    bottom: '20px',
    right: '20px',
  },
  
  // Features
  features: {
    enableTickets: true,
    enableHelp: true,
    enableRating: true,
    enableFileUpload: true,
    enableEmoji: true,
  },
  
  // Branding
  branding: {
    logoUrl: '/logo.svg',
    websiteTitle: 'PBL Support',
    chatIconText: 'Need Help?',
    showChatIcon: true,
  }
};

export default liveChatConfig;

