'use client';

import { productsDummyData } from "@/assets/assets";
import CartService from "@/services/CartService";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSessionId } from "@/lib/utils";
import { formatPermissions } from "@/helpers/functions";

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
  const [user, setUser] = useState(null);            // User object
  const [loading, setLoading] = useState(false);     // Loading state
  const [shops, setShops] = useState([]);           // Shops list
  const [companyShops, setCompanyShops] = useState([]);           // Shops list
  const [selectedShop, setSelectedShop] = useState(''); // Currently selected shop
  const [selectedCompanyShop, setSelectedCompanyShop] = useState('');
  const [permissionList, setPermissionList] = useState([]); // Currently selected shop

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
    setLoading(true);
    try {
      const userString = localStorage.getItem("user");
      setUser(userString ? JSON.parse(userString) : null);

      if (userString) {
        const parsedUser = typeof userString === "string" ? JSON.parse(userString) : userString;

        const finalUser = typeof parsedUser === "string" ? JSON.parse(parsedUser) : parsedUser;

        if(finalUser.permissions.length > 0){
          const formattedPermissions = formatPermissions(finalUser?.permissions);
          setPermissionList(formattedPermissions);
        }
        
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
      setLoading(false);
    }
  }, []);

  // console.log("user", user);


  // Sync user state to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);


  let parsedUser = null;
  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
  }

  // console.log("cartItems cart page", cartItems);
  // console.log("user Info", parsedUser?.id);


  //  c_session_id: parsedUser?.id ? null : getSessionId(),

  const fetchCartItems = async () => {
    try {
      const params = {
        _page: 1,
        _perPage: 1000,
        _oderBy: "p_id",
        _order: "ASC",
        _statis: "active"
      };

      // If user is logged in, use _user_id. Otherwise, use c_session_id
      if (parsedUser?.id) {
        params._user_id = parsedUser.id;
      } else {
        params._session_id = getSessionId();
      }

      const response = await CartService.Queries.getCartList(params);

      if (response.status === "success") {
        // Set cart items from database
        // console.log("response.data.data");
        // console.log(response.data.data);

        // Transform cart data to required format - loop through all carts
        const transformedCartItems = [];

        response?.data?.data?.forEach(cart => {
          cart?.items?.forEach(item => {
            transformedCartItems.push({
              ci_product_id: item.ci_product_id,
              ci_type_id: item.ci_type_id,
              ci_qty: item.ci_qty,
              ci_price: item.ci_price,
              ci_url: item?.ci_product_details?.image || '',
              ci_name: item?.ci_product_details?.name || 'product name'
            });
          });
        });

        setCartItems(transformedCartItems);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  // Fetch cart items from database when user changes (logged in/out) or component mounts
  useEffect(() => {
    fetchCartItems();
  }, [user]);

  // Add an item to the cart (increments quantity)
  const addToCart = async (itemId, productData = null) => {
    try {
      // Prepare cart data for API
      // const cartData = {
      //   product_id: itemId,
      //   quantity: 1,
      // };

      // Call API to store cart in database
      const response = await CartService.Commands.storeCart(productData);

      // If API call is successful, update local state
      if (response.data) {
        // setCartItems((prev) => {
        //   // Check if item already exists in cart
        //   const existingItemIndex = prev.findIndex((item) => item.p_id === itemId || item._id === itemId);


        //   if (existingItemIndex !== -1) {
        //     // If item already exists, increment quantity
        //     const updatedCart = [...prev];
        //     updatedCart[existingItemIndex] = {
        //       ...updatedCart[existingItemIndex],
        //       quantity: updatedCart[existingItemIndex].quantity + 1,
        //     };
        //     return updatedCart;
        //   } else {
        //     // If new item, find product details from products array
        //     const product = productData || products.find((p) => p.p_id === itemId || p._id === itemId);
        //     if (!product) return prev; // If product not found, don't add

        //     // Add new item to cart
        //     return [
        //       ...prev,
        //       {
        //         ...product,
        //         quantity: 1,
        //       },
        //     ];
        //   }
        // });

        fetchCartItems();

        // Show toast message once after state update
        toast.success("Product added to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart");
    }
  };

  // Update the quantity of a cart item, or remove if quantity is 0
  const updateCartQuantity = async (itemId, quantity) => {
    try {
      const itemData = cartItems.find(item => item.ci_product_id === itemId);

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

      const response = await CartService.Commands.storeCart(productData);

      if (response.data) {
        fetchCartItems();
        // toast.success("Product added to cart");
      }


      // if (quantity === 0) {
      //   // Prepare data for delete API
      //   const deleteData = {
      //     product_id: itemId,
      //   };

      //   // Call API to remove item from cart in database
      //   const response = await CartService.Commands.deleteCart(deleteData);

      //   // If API call is successful, update local state
      //   if (response.data) {
      //     setCartItems((prev) => {
      //       // Remove item if quantity is 0
      //       return prev.filter((item) => item.p_id !== itemId && item._id !== itemId);
      //     });
      //     toast.success("Product removed from cart");
      //   }
      // } else {
      //   // Prepare data for update API
      //   const updateData = {
      //     product_id: itemId,
      //     quantity: quantity,
      //   };

      //   // Call API to update cart in database
      //   // const response = await CartService.Commands.updateCart(itemId, updateData);

      //   // If API call is successful, update local state
      //   // if (response.data) {
      //   //   setCartItems((prev) => {
      //   //     // Update quantity of existing item
      //   //     return prev.map((item) => {
      //   //       if (item.p_id === itemId || item._id === itemId) {
      //   //         return { ...item, quantity };
      //   //       }
      //   //       return item;
      //   //     });
      //   //   });
      //   //   toast.success("Cart updated successfully");
      //   // }
      // }
    } catch (error) {
      console.error("Error updating cart:", error);
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
      console.error("Error removing from cart:", error);
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
    permissionList
  };

  // Render the provider with the value
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};