import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Generate a unique session ID
export function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

// Get or create session ID from localStorage
export function getSessionId() {
  if (typeof window === 'undefined') return null;

  let sessionId = localStorage.getItem('guest_session_id');

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('guest_session_id', sessionId);
  }

  return sessionId;
}

// Check if user has permission for a specific shop, section and action
export function hasPermission(permissionList, companyShopId, section, action) {
  if (!companyShopId || !permissionList) return false;

  return permissionList.some(
    permission =>
      permission.shopId === companyShopId &&
      (permission.section === section || permission.section === "*") &&
      (permission.action === action || permission.action === "*")
  );
}
