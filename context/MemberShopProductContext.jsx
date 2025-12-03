// MemberShopProductContext.jsx

'use client'
import VehicleService from '@/services/VehicleService';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

// Create the context
export const MemberShopProductContext = createContext();


export const useMemberShopProductContext = () => {
  return useContext(MemberShopProductContext)
}

// Context provider component
export const MemberShopProductContextProvider = ({ children }) => {

  // const { user } = useAppContext();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const router = useRouter();

  const getAllProductold = async (reset = false) => {
    try {
      setLoading(true);
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;

      if (userInfo) {
        const res = await VehicleService.Queries.getMemberShopVehicle({
          _page: currentPage,
          _perPage: 25,
          _order: 'desc',
          _orderBy: 'v_id'
        });

        if (res.status === "success") {
          const newProducts = res?.data?.data || [];

          setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);

          if (newProducts.length > 0) {
            setPage(prev => reset ? 2 : prev + 1);
          }

          setHasMore(newProducts.length === 12);
        }

      }
      // else {
      //   const res = await VehicleService.Queries.getVehiclesWithoutLogin({
      //     _page: currentPage,
      //     _perPage: 25,
      //   });

      //   if (res.status === "success") {
      //     const newProducts = res?.data?.data || [];

      //     setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);

      //     if (newProducts.length > 0) {
      //       setPage(prev => reset ? 2 : prev + 1);
      //     }

      //     setHasMore(newProducts.length === 12);
      //   }
      // }
    } catch (error) {
      console.log("get product error", error);
    } finally {
      setLoading(false);
    }
  };







  const getAllProduct = async (reset = false) => {
    try {
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;

       const res = await VehicleService.Queries.getMemberShopVehicle({
          _page: currentPage,
          _perPage: 25,
          _order: 'ASC',
          _orderBy: 'v_priority',
          _user_model: 'member',
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
    setUser,
  };

  return (
    <MemberShopProductContext.Provider value={value}>
      {children}
    </MemberShopProductContext.Provider>
  );
};
