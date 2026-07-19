'use client';

import { productsDummyData } from "@/assets/assets";
import CartService from "@/services/CartService";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSessionId } from "@/lib/utils";
import { formatPermissions } from "@/helpers/functions";

const COMPARE_STORAGE_KEY = "compare_items";
const MAX_COMPARE_ITEMS = 4;

const parseMaybeJson = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeStoredValue = (value, fallback = null) => {
  const parsedValue = parseMaybeJson(value, fallback);
  return typeof parsedValue === "string"
    ? parseMaybeJson(parsedValue, fallback)
    : parsedValue;
};

const getMediaUrl = (media) => {
  if (!media) return "";
  const parsedMedia = parseMaybeJson(media, media);

  if (typeof parsedMedia === "string") return parsedMedia;
  if (Array.isArray(parsedMedia)) return getMediaUrl(parsedMedia[0]);

  return parsedMedia?.secure_url || parsedMedia?.url || "";
};

const getFormattedUserPermissions = (userValue) => {
  if (!userValue) return [];

  try {
    const parsedUser = typeof userValue === "string" ? JSON.parse(userValue) : userValue;
    const finalUser = typeof parsedUser === "string" ? JSON.parse(parsedUser) : parsedUser;

    return formatPermissions(finalUser?.permissions ?? []);
  } catch (error) {
    console.log("Failed to parse user permissions", error);
    return [];
  }
};

// Create the application context
export const AppContext = createContext();

// Custom hook for consuming the context
export const useAppContext = () => useContext(AppContext);

// Context provider component
export const AppContextProvider = ({ children }) => {
  // App-wide constants and hooks
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();

  // State variables
  // State variables
  const [products, setProducts] = useState([]);      // Product list
  const [userData, setUserData] = useState(false);   // Additional user data (if needed)
  const [isSeller, setIsSeller] = useState(true);    // Seller status
  const [cartItems, setCartItems] = useState([]);    // Cart items (array of objects with product details + quantity)
  const [cartId, setCartId] = useState(null);    
  const [user, setUser] = useState(null);            // User object
  const [loading, setLoading] = useState(true);      // User hydration state
  const [hasHydratedUser, setHasHydratedUser] = useState(false);
  const [shops, setShops] = useState([]);           // Shops list
  const [companyShops, setCompanyShops] = useState([]);           // Shops list
  const [selectedShop, setSelectedShop] = useState(''); // Currently selected shop
  const [selectedCompanyShop, setSelectedCompanyShop] = useState('');
  const [permissionList, setPermissionList] = useState([]);
  const [compareItems, setCompareItems] = useState([]);

  useEffect(() => {
    setPermissionList(getFormattedUserPermissions(user));
  }, [user]);

  // Fetch products (dummy data) on mount and initialize sample cart data
  // useEffect(() => {
  //   setProducts(productsDummyData);

  //   const sampleCartData = {};
  //   const quantities = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1];

  //   productsDummyData.slice(0, 24).forEach((product, index) => {
  //     sampleCartData[product._id] = {
  //       ...product,
  //       quantity: quantities[index] || 1,
  //     };
  //   });

  //   setCartItems(sampleCartData);
  // }, []);

  // Load user from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const storedUser = normalizeStoredValue(localStorage.getItem("user"), null);
      setUser(storedUser);

      if (storedUser) {
        setPermissionList(getFormattedUserPermissions(storedUser));
        
        // if (finalUser.permissions.length > 0) {
        //   const permissionData = finalUser.permissions.map(item => {
        //     const parts = item.split(".");
        //     return {
        //       id: Number(parts[0]),
        //       section: parts[1].toLowerCase(),
        //       action: parts[2].toLowerCase()
        //     };
        //   });

        //   setPermissionList(permissionData);
        // }
      }
    } catch (error) {
      console.log("Failed to parse user data", error);
      setUser(null);
    } finally {
      setHasHydratedUser(true);
      setLoading(false);
    }
  }, []);

  // console.log("user", user);


  // Sync user state to localStorage whenever it changes
  useEffect(() => {
    if (!hasHydratedUser) {
      return;
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(normalizeStoredValue(user, user)));
    } else {
      localStorage.removeItem("user");
    }
  }, [hasHydratedUser, user]);


  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompareItems(parsed.slice(0, MAX_COMPARE_ITEMS));
        }
      }
    } catch {
      setCompareItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (productId) => {
    if (compareItems.includes(productId)) return;
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast.error(`You can compare up to ${MAX_COMPARE_ITEMS} products only`);
      return;
    }
    setCompareItems((prev) => [...prev, productId]);
    toast.success("Added to compare");
  };

  const removeFromCompare = (productId) => {
    if (!compareItems.includes(productId)) return;
    setCompareItems((prev) => prev.filter((id) => id !== productId));
    toast.success("Removed from compare");
  };

  const toggleCompare = (productId) => {
    if (compareItems.includes(productId)) {
      removeFromCompare(productId);
    } else {
      addToCompare(productId);
    }
  };

  const clearCompare = () => {
    setCompareItems([]);
    toast.success("Compare list cleared");
  };

  const isInCompare = (productId) => compareItems.includes(productId);

  const parsedUser = parseMaybeJson(user, user);

  const fetchCartItems = async () => {
    try {
      // Parse user fresh inside the function to avoid stale closure
      let currentUser = null;
      try {
        currentUser = normalizeStoredValue(localStorage.getItem("user"), null);
      } catch (error) {
        console.log("Failed to parse user:", error);
        currentUser = null;
      }

      // _status matches CartController::index()'s simpleFilter condition key -
      // was previously misspelled "_statis" so the active-only filter was
      // silently never applied: every cart the user/session ever had
      // (including ones left behind by a failed clearCart() call after a
      // past order) was fetched and merged together, showing already-ordered
      // items back in the cart indefinitely.
      const params = {
        _page: 1,
        _perPage: 1000,
        _orderBy: "p_id",
        _order: "ASC",
        _status: "active"
      };

      // If user is logged in, use _user_id. Otherwise, use c_session_id
      if (currentUser?.id) {
        params._user_id = currentUser.id;
      } else {
        params._session_id = getSessionId();
      }

      const response = await CartService.Queries.getCartList(params);

      // console.log("get cart item app context00000000000000000000151", response?.data?.data);

      if (response.status === "success") {
        // Transform cart data to required format - loop through all carts
        const transformedCartItems = [];

        (response?.data?.data || []).forEach(cart => {
          // setCartId(cart.c_id);
          cart?.items?.forEach(item => {
            const variantSnapshot = parseMaybeJson(item?.ci_variant_snapshot, null);
            const variantImage = getMediaUrl(variantSnapshot?.image);
            const productImage = getMediaUrl(item?.ci_product_details?.image);
            const quantity = Number(item?.ci_qty || 0);
            const price = Number(item?.ci_price || 0);

            transformedCartItems.push({
              ci_id: item.ci_id,
              cart_id: cart.c_id,
              ci_product_id: item.ci_product_id,
              ci_product_variant_id: item.ci_product_variant_id,
              ci_type_id: item.ci_type_id,
              ci_qty: quantity,
              ci_price: price,
              ci_url: variantImage || productImage || '',
              ci_name: item?.ci_product_details?.name || '',
              ci_product_price_id: item.ci_product_price_id,
              ci_variant_snapshot: variantSnapshot,
              ci_variant_title: variantSnapshot?.title || variantSnapshot?.option_summary || '',
              ci_variant_sku: variantSnapshot?.sku || '',
              ci_currency: item.ci_product_details?.currency || 'BDT',
              ci_subtotal: price * quantity,
            });
          });
        });

        // setCartId(response?.data?.data[0]?.c_id);

        setCartItems(transformedCartItems);
      }
    } catch (error) {
      console.log("Error fetching cart items:", error);
    }
  };

  // Fetch cart items from database when user changes (logged in/out) or component mounts
  useEffect(() => {
    fetchCartItems();
  }, [user]);

  // Add an item to the cart (increments quantity)
  const addToCart = async (itemId, productData = null) => {
    try {
      // Call API to store cart in database
      const response = await CartService.Commands.storeCart(productData);

      if (response.data) {
        fetchCartItems();
        toast.success("Product added to cart");
      }
    } catch (error) {
      console.log("Error adding to cart:", error);
      toast.error("Failed to add product to cart");
    }
  };

  // Update the quantity of a cart item, or remove if quantity is 0
  const updateCartQuantity = async (cartItemOrProductId, quantity) => {
    try {
      const itemData = typeof cartItemOrProductId === "object"
        ? cartItemOrProductId
        : cartItems.find(item => item.ci_product_id === cartItemOrProductId);

      if (!itemData) {
        toast.error("Cart item not found");
        return;
      }

      const productData = {
        c_user_id: parsedUser?.id || null,
        c_session_id: parsedUser?.id ? null : getSessionId(),
        ci_product_id: itemData.ci_product_id,
        ci_type_id: itemData.ci_type_id,
        ci_qty: quantity,
        ci_price: itemData.ci_price,
        ci_url: itemData.ci_url || '',
        ci_name: itemData.ci_name,
        ci_subtotal: itemData.ci_price * quantity,
      }

      if (itemData.ci_product_variant_id) {
        productData.ci_product_variant_id = itemData.ci_product_variant_id;
      }

      if (itemData.ci_product_price_id) {
        productData.ci_product_price_id = itemData.ci_product_price_id;
      }

      const response = await CartService.Commands.storeCart(productData);

      if (response.data) {
        fetchCartItems();
        // toast.success("Product added to cart");
      }
    } catch (error) {
      console.log("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  };



  const removeCartItem = async (cartItem = null) => {
    try {
      // Call API to remove item from cart in database
      const response = await CartService.Commands.deleteCart(cartItem);

      // If API call is successful, update local state
      if (response.data) {
        fetchCartItems();
        toast.success("Product removed from cart");
      }
    } catch (error) {
      console.log("Error removing from cart:", error);
      toast.error("Failed to remove product from cart");
    }
  };




  // Get the total number of items in the cart
  const getCartCount = () =>
    cartItems.reduce((sum, item) => sum + (item.ci_qty > 0 ? item.ci_qty : 0), 0);

  // Get the total amount for all items in the cart
  const getCartAmount = () =>
    Math.floor(
      cartItems.reduce((sum, item) => {
        return item.ci_qty > 0 ? sum + parseFloat(item.ci_price) * item.ci_qty : sum;
      }, 0) * 100
    ) / 100;

  // Context value to be provided to consumers
  const value = {
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    setUserData,
    products,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    getCartCount,
    getCartAmount,
    user,
    parsedUser,
    setUser,
    loading,
    shops,
    setShops,
    selectedShop,
    setSelectedShop,
    companyShops,
    setCompanyShops,
    selectedCompanyShop,
    setSelectedCompanyShop,
    permissionList,
    compareItems,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    isInCompare,
  };

  // Render the provider with the value
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
