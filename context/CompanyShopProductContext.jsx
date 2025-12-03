// CompanyShopProductContext.jsx.jsx

'use client'
import VehicleService from '@/services/VehicleService';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAppContext } from './AppContext';

// Create the context
export const CompanyShopProductContext = createContext();


export const useCompanyShopProductContext = () => {
  return useContext(CompanyShopProductContext)
}

// Context provider component
export const CompanyShopProductContextProvider = ({ children }) => {

  const { selectedCompanyShop } = useAppContext();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const router = useRouter();


  const getAllProduct = async (reset = false) => {
    try {
      if (!selectedCompanyShop) return;
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;


      const res = await VehicleService.Queries.getVehiclesWithLogin({
        _page: currentPage,
        _perPage: 25,
        _shop_id: selectedCompanyShop?.shop?.s_id,
        _order: 'ASC',
        _orderBy: 'v_priority',
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
  }, [loading, user, selectedCompanyShop]);

  const value = {
    products,
    setProducts,
    loading,
    hasMore,
    getAllProduct,
  };

  return (
    <CompanyShopProductContext.Provider value={value}>
      {children}
    </CompanyShopProductContext.Provider>
  );
};
