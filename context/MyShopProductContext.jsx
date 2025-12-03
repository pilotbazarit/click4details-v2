// MyShopProductContext.jsx

'use client'
import VehicleService from '@/services/VehicleService';
import GeneralProductService from '@/services/GeneralProductService';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAppContext } from './AppContext';

// Create the context
export const MyShopProductContext = createContext();


export const useMyShopProductContext = () => {
  return useContext(MyShopProductContext)
}

// Context provider component
export const MyShopProductContextProvider = ({ children }) => {

  const { selectedShop } = useAppContext();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const router = useRouter();
  const [selectedProductType, setSelectedProductType] = useState('vehicle');


  const getAllProduct = async (reset = false) => {
    try {
      if (!selectedShop) return;
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;


      const res = await VehicleService.Queries.getVehiclesWithLogin({
        _page: currentPage,
        _perPage: 25,
        _shop_id: selectedShop?.s_id,
        _order: 'desc',
        _orderBy: 'v_id',
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


  console.log("Productsss:", products);

  const getAllGeneralProduct = async (reset = false) => {
    try {
      if (!selectedShop) return;
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;

      const res = await GeneralProductService.Queries.getGeneralProducts({
        // _page: currentPage,
        // _perPage: 25,
        // _shop_id: selectedShop?.s_id,
        // _order: 'ASC',
        // _orderBy: 'p_id',
        // _status: 'active'
        _page: currentPage,
        _perPage: 25,
        _order: 'ASC',
        _orderBy: 'v_priority',
        _shop_id: selectedShop?.s_id,
        _status: 'active',
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
      console.log("get general product error", error);
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
      if (selectedProductType === 'vehicle') {
        getAllProduct(true);
      } else if (selectedProductType === 'general') {
        getAllGeneralProduct(true);
      }
    }
  }, [loading, user, selectedShop, selectedProductType]);

  const value = {
    products,
    setProducts,
    loading,
    hasMore,
    getAllProduct,
    getAllGeneralProduct,
    selectedProductType,
    setSelectedProductType,
  };

  return (
    <MyShopProductContext.Provider value={value}>
      {children}
    </MyShopProductContext.Provider>
  );
};
