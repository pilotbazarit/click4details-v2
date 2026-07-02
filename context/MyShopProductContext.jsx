// MyShopProductContext.jsx

'use client'
import VehicleService from '@/services/VehicleService';
import GeneralProductService from '@/services/GeneralProductService';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from './AppContext';
import { parseStoredUser } from "@/lib/parseStoredUser";

// Create the context
export const MyShopProductContext = createContext();


export const useMyShopProductContext = () => {
  return useContext(MyShopProductContext)
}

// Context provider component
export const MyShopProductContextProvider = ({ children }) => {

  const { selectedShop, user: appUser, loading: appUserLoading } = useAppContext();
  const searchParams = useSearchParams();
  const vehicleCategoryIdFromUrl = searchParams.get("_category_id") || "";

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const router = useRouter();
  const [selectedProductType, setSelectedProductType] = useState('vehicle');
  const [categoryId, setCategoryId] = useState(null);


  const getAllProduct = async (reset = false) => {
    try {
      if (!selectedShop) return;
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;
      const params = {
        _page: currentPage,
        _perPage: 25,
        _shop_id: selectedShop?.s_id,
        _order: 'desc',
        _orderBy: 'v_id',
        _status: 'active'
      };

      if (vehicleCategoryIdFromUrl) {
        params._category_id = vehicleCategoryIdFromUrl;
      }

      const res = await VehicleService.Queries.getVehiclesWithLogin(params);


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


  // console.log("Productsss:", products);

  const getAllGeneralProduct = async (reset = false, catId = null) => {
    try {
      if (!selectedShop) return;
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;
      const finalCatId = catId !== null ? catId : categoryId;

      const apiParams = {
        // _page: currentPage,
        // _perPage: 25,
        // _shop_id: selectedShop?.s_id,
        // _order: 'ASC',
        // _orderBy: 'p_id',
        // _status: 'active'
        _page: currentPage,
        _perPage: 25,
        _order: 'asc',
        _orderBy: 'p_id',
        _shop_id: selectedShop?.s_id,
        _status: 'active',
      };

      if (finalCatId) {
        apiParams._pCat_id = finalCatId;
      }

      const res = await GeneralProductService.Queries.getGeneralProducts(apiParams);

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
    if (appUserLoading) {
      return;
    }

    setLoading(true);
    const userInfo = parseStoredUser(appUser) || parseStoredUser(localStorage.getItem("user"));

    if (userInfo) {
      setUser(userInfo);
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [appUser, appUserLoading, router]);

  useEffect(() => {
    const productTypeFromUrl = String(searchParams.get('product_type') || "").toLowerCase();
    const categoryIdFromUrl = searchParams.get('category_id');

    if (productTypeFromUrl === "general" || productTypeFromUrl === "gproduct") {
      setSelectedProductType('general');
    } else if (productTypeFromUrl === "vehicle") {
      setSelectedProductType('vehicle');
    }

    setCategoryId(categoryIdFromUrl);
  }, [searchParams]);

  // Only run when user loading is complete
  useEffect(() => {
    if (!loading) {
      if (selectedProductType === 'vehicle') {
        getAllProduct(true);
      } else if (selectedProductType === 'general') {
        getAllGeneralProduct(true, categoryId);
      }
    }
  }, [loading, user, selectedShop, selectedProductType, categoryId, vehicleCategoryIdFromUrl]);

  const value = {
    products,
    setProducts,
    loading,
    hasMore,
    getAllProduct,
    getAllGeneralProduct,
    selectedProductType,
    setSelectedProductType,
    categoryId,
  };

  return (
    <MyShopProductContext.Provider value={value}>
      {children}
    </MyShopProductContext.Provider>
  );
};
