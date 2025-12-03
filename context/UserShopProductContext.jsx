// MyShopProductContext.jsx

'use client'
import VehicleService from '@/services/VehicleService';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

// Create the context
export const UserShopProductContext = createContext();


export const useUserShopProductContext = () => {
  return useContext(UserShopProductContext)
}

// Context provider component
export const UserShopProductContextProvider = ({ children }) => {

  // const { user } = useAppContext();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const router = useRouter();



  const getAllProduct = async (reset = false) => {
    try {
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;


      const res = await VehicleService.Queries.getUserPartnerVehicle({
        _page: currentPage,
        _perPage: 25,
        // _shop_id: user?.user_shop_id,
        _order: 'ASC',
        _orderBy: 'v_priority',
        _user_model: 'user',
        _status: 'active'
      });


      if (res.status === "success") {
        const newProducts = res?.data?.data || [];

        setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);

        if (newProducts.length > 0) {
          setPage(prev => reset ? 2 : prev + 1);
        }

        setHasMore(newProducts.length === 25);
      }
    } catch (error) {
      console.log("get product error", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    const userData = localStorage.getItem("user");
    const userInfo = userData && JSON.parse(userData);

    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      router.push("/");
    }
    setLoading(false);
  }, []);

  // Only run when user loading is complete
  useEffect(() => {
    if (!loading) {
      getAllProduct(true);
    }
  }, [loading, user]);

  const value = {
    products,
    setProducts,
    loading,
    hasMore,
    getAllProduct,
    user,
    setUser
  };

  return (
    <UserShopProductContext.Provider value={value}>
      {children}
    </UserShopProductContext.Provider>
  );
};
