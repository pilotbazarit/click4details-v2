// Pushes to the same window.dataLayer GTM's base snippet in app/layout.js
// already initializes. Use Custom Event triggers in GTM matching these
// event names (add_to_cart, begin_checkout, purchase, sign_up) rather than
// URL-based triggers - these fire at the exact user action, not on page view,
// so they stay accurate through refreshes/back-navigation and don't require
// guessing which route maps to which action.
export const pushDataLayerEvent = (eventName, payload = {}) => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });
};
