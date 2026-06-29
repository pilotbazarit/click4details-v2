'use client'
import VehicleService from '@/services/VehicleService';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import GeneralProductService from '@/services/GeneralProductService';

import { parseStoredUser } from "@/lib/parseStoredUser";

// Create the context
export const GeneralProductContext = createContext();

export const useGeneralProductContext = () => useContext(GeneralProductContext);

// Context provider component
export const GeneralProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const [categoryId, setCategoryId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    stock: "all",
    minPrice: "",
    maxPrice: "",
    sort: "latest",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const getAllProduct = async (reset = false, catId = null, nextFilters = filters) => {
    try {
      // Reset state if needed
      if (reset) {
        setProducts([]);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;

      // Build API parameters
      const apiParams = {
        _page: currentPage,
        _perPage: 25,
        _order: nextFilters?.sort === 'oldest' ? 'asc' : 'desc',
        _orderBy: 'p_id',
        _status: 'active'
      };

      // Add category_id if available (use parameter or state)
      const finalCatId = catId !== null ? catId : categoryId;
      if (finalCatId) {
        apiParams._pCat_id = finalCatId;
        apiParams._is_saleBy_pbl = 1;
      }

      if (nextFilters?.search?.trim()) {
        apiParams._title = nextFilters.search.trim();
      }

      // Fetch products without login
      const res = await GeneralProductService.Queries.getGeneralProducts(apiParams);

      // console.log("res:::", res);

      if (res?.status === "success") {
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

  // Get category_id from URL
  useEffect(() => {
    const categoryIdFromUrl = searchParams.get('category_id');
    setCategoryId(categoryIdFromUrl);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const userInfo = parseStoredUser(localStorage.getItem("user"));
    // if (userInfo) {
    //   router.push("/pb-home");
    // }
    setLoading(false);
  }, []);

  // Only run when user loading is complete or category changes
  useEffect(() => {
    if (!loading) {
      getAllProduct(true, categoryId, filters);
    }
  }, [loading, user, categoryId]);

  const applyFilters = (nextFilters = filters) => {
    setFilters(nextFilters);
    getAllProduct(true, categoryId, nextFilters);
  };

  const resetFilters = () => {
    const nextFilters = {
      search: "",
      stock: "all",
      minPrice: "",
      maxPrice: "",
      sort: "latest",
    };
    setFilters(nextFilters);
    getAllProduct(true, categoryId, nextFilters);
  };

  const value = {
    products,
    setProducts,
    loading,
    hasMore,
    getAllProduct,
    categoryId,
    filters,
    setFilters,
    applyFilters,
    resetFilters,
  };

  return (
    <GeneralProductContext.Provider value={value}>
      {children}
    </GeneralProductContext.Provider>
  );
};
