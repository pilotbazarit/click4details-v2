// PblHomeProductContext.jsx

'use client'
import VehicleService from '@/services/VehicleService';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";

// Create the context
export const PblHomeProductContext = createContext();


export const usePblHomeProductContext = () => {
  return useContext(PblHomeProductContext)
}

const getStoredUser = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;

  try {
    const parsedUser = JSON.parse(userData);
    return typeof parsedUser === "string" ? JSON.parse(parsedUser) : parsedUser;
  } catch (error) {
    console.log("Failed to parse stored user", error);
    return null;
  }
};

// Context provider component
export const PblHomeProductContextProvider = ({ children }) => {

  // const { user } = useAppContext();

  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get("_category_id") || "";
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const lastLoadedCategoryIdRef = useRef(null);




  const getAllProduct = useCallback(async (reset = false) => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setHasMore(true);
        pageRef.current = 1;
      }

      const currentPage = reset ? 1 : pageRef.current;
      const params = {
        _page: currentPage,
        _perPage: 25,
        _order: 'ASC',
        _orderBy: 'v_priority',
        _status: 'active'
      };

      if (categoryIdFromUrl) {
        params._category_id = categoryIdFromUrl;
      }

      // Fetch products without login
      // const res = await VehicleService.Queries.getVehiclesWithLogin({
      //   _page: currentPage,
      //   _perPage: 25,
      //   _shop_id: user?.pbl_shop_id,
      //   _order: 'desc',
      //   _orderBy: 'v_id'
      // });

      const res = await VehicleService.Queries.getVehiclesWithoutLogin(params);

      if (res.status === "success") {
        const newProducts = res?.data?.data || [];

        setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);

        if (newProducts.length > 0) {
          pageRef.current = currentPage + 1;
        }

        setHasMore(newProducts.length === 25);
      }
    } catch (error) {
      console.log("get product error", error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [categoryIdFromUrl]);

  useEffect(() => {
    const userInfo = getStoredUser();

    if (userInfo) {
      setUser(userInfo);
    } else {
      router.push("/");
    }

    if (lastLoadedCategoryIdRef.current !== categoryIdFromUrl) {
      lastLoadedCategoryIdRef.current = categoryIdFromUrl;
      getAllProduct(true);
    }
  }, [categoryIdFromUrl, getAllProduct, router]);

  const value = {
    products,
    setProducts,
    loading,
    hasMore,
    getAllProduct,
  };

  return (
    <PblHomeProductContext.Provider value={value}>
      {children}
    </PblHomeProductContext.Provider>
  );
};
