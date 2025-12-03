/**
 * Determines the appropriate chat ID based on the current context
 * This enables dynamic chat codes for different shops, users, and pages
 */

/**
 * Get chat ID based on context (user, shop, route, etc.)
 * @param {Object} context - Object containing user and route information
 * @param {string} [context.userId] - User ID
 * @param {string} [context.shopId] - Shop ID
 * @param {string} [context.companyShopId] - Company shop ID
 * @param {string} [context.role] - User role
 * @param {string} [context.pathname] - Current pathname
 * @returns {string} The appropriate chat ID string
 */
export const getChatIdForContext = (context) => {
  const { userId, shopId, companyShopId, role, pathname } = context;
  
  // Priority 1: Explicit shop ID (viewing a specific user shop)
  if (shopId) {
    return `shop-${shopId}`;
  }
  
  // Priority 2: Company shop ID (viewing a specific company shop)
  if (companyShopId) {
    return `company-${companyShopId}`;
  }
  
  // Priority 3: User's own shop (seller viewing their shop)
  if (role === 'seller' && userId) {
    return `user-${userId}`;
  }
  
  // Priority 4: Admin role gets dedicated support
  if (role === 'admin') {
    return 'pbl-chat-admin';
  }
  
  // Priority 5: Path-based detection for fallback
  if (pathname) {
    // User shop pages
    if (pathname.startsWith('/user-shop/') || pathname.includes('/user-shop/')) {
      const parts = pathname.split('/');
      const shopIdIndex = parts.indexOf('user-shop') + 1;
      if (shopIdIndex < parts.length && parts[shopIdIndex]) {
        return `shop-${parts[shopIdIndex]}`;
      }
    }
    
    // Company shop pages
    if (pathname.startsWith('/company-shop/') || pathname.includes('/company-shop/')) {
      const parts = pathname.split('/');
      const companyIdIndex = parts.indexOf('company-shop') + 1;
      if (companyIdIndex < parts.length && parts[companyIdIndex]) {
        return `company-${parts[companyIdIndex]}`;
      }
    }
    
    // My shop - seller's own shop
    if (pathname.startsWith('/my-shop') || pathname.includes('/my-shop')) {
      if (userId) {
        return `user-${userId}`;
      }
    }
  }
  
  // Default: Main PBL support
  return process.env.NEXT_PUBLIC_LIVECHAT_DEFAULT_CHAT_ID || 'pbl-chat-001';
};

/**
 * Extract shop ID from pathname
 * @param {string} pathname - Current route pathname
 * @returns {string|undefined} Shop ID if found, undefined otherwise
 */
export const getShopIdFromPath = (pathname) => {
  if (!pathname) return undefined;
  
  // Check for user-shop pattern
  if (pathname.includes('/user-shop/')) {
    const parts = pathname.split('/');
    const shopIdIndex = parts.indexOf('user-shop') + 1;
    if (shopIdIndex < parts.length && parts[shopIdIndex]) {
      return parts[shopIdIndex];
    }
  }
  
  return undefined;
};

/**
 * Extract company shop ID from pathname
 * @param {string} pathname - Current route pathname
 * @returns {string|undefined} Company shop ID if found, undefined otherwise
 */
export const getCompanyShopIdFromPath = (pathname) => {
  if (!pathname) return undefined;
  
  // Check for company-shop pattern
  if (pathname.includes('/company-shop/')) {
    const parts = pathname.split('/');
    const companyIdIndex = parts.indexOf('company-shop') + 1;
    if (companyIdIndex < parts.length && parts[companyIdIndex]) {
      return parts[companyIdIndex];
    }
  }
  
  return undefined;
};

/**
 * Check if current context should use a shop-specific chat
 * @param {string} pathname - Current route pathname
 * @returns {boolean} True if should use shop-specific chat
 */
export const isShopContext = (pathname) => {
  if (!pathname) return false;
  
  return pathname.includes('/user-shop/') || 
         pathname.includes('/company-shop/') || 
         pathname.includes('/my-shop');
};

