import React, { useRef, useEffect, useCallback, useState } from "react";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductSkeleton";
import { useAppContext } from "@/context/AppContext";
import ShopService from "@/services/ShopService";
import { useCompanyShopProductContext } from "@/context/CompanyShopProductContext";
import Link from "next/link";
import { hasPermission } from "@/lib/utils";

const CompanyShopProducts = () => {
  const { products, loading, hasMore, getAllProduct } = useCompanyShopProductContext();
  const observerRef = useRef();
  const [loadingNewData, setLoadingNewData] = useState(false);


  const { setCompanyShops, user, setSelectedCompanyShop, selectedCompanyShop, permissionList } = useAppContext();

  let parsedUser = null;
  try {
    parsedUser = user ? (typeof user === 'string' ? JSON.parse(user) : user) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
  }



  useEffect(() => {
    const fetchCompanyShops = async () => {
      try {
        const response = await ShopService.Queries.getCompanyShops(parsedUser?.id);


        // console.log("company shops", response.data);
        if(response.status == 'success'){
          setCompanyShops(response?.data);

          setSelectedCompanyShop(response?.data[0]);
        }
      } catch (error) {
        console.log("Error fetching shops:", error);
      }
    };
    if (parsedUser){
      fetchCompanyShops();
    }
  }, [setCompanyShops, user]);

  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      // observerRef.current = new IntersectionObserver((entries) => {
      //   if (entries[0].isIntersecting && hasMore) {
      //     getAllProduct(); // fetch next page
      //   }
      // });

      observerRef.current = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLoadingNewData(true);
          await getAllProduct();
          setLoadingNewData(false);
        }
      }, {
        root: null, // Use the viewport
        rootMargin: "0px",
        threshold: 0.1 // Trigger a bit before it's fully in view
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, getAllProduct]
  );

  const companyShopId = selectedCompanyShop?.shop?.s_id;

  
  const hasCompanyShopProductCreatePermission = hasPermission(
    permissionList,
    Number(companyShopId),
    "Vehicle",
    "Create"
  );

  // const hasCompanyShopProductCreatePermission = false;

  return (
    <div className="flex flex-col items-center pt-4">
      {/* <h1>Company Shop</h1> */}
      <div className="
        grid 
        grid-cols-1          
        sm:grid-cols-2     
        md:grid-cols-2       
        lg:grid-cols-3      
        xl:grid-cols-4      
        2xl:grid-cols-4
        3xl:grid-cols-5    
        4xl:grid-cols-5   
        gap-2 
        mt-6 
        pb-14 
        w-full 
        px-2
        max-w-screen-5xl"
      >
        <div className="min-h-[300px] rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <button
              type="button"
              onClick={getAllProduct}
              className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 px-6 py-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <div className="group relative w-full max-w-[240px]">
              {hasCompanyShopProductCreatePermission ? (
                <Link
                  href="/dashboard/products/vehicle/create"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-gray-300 px-6 py-4 text-base font-semibold text-blue-600 transition-colors hover:bg-gray-50"
                >
                  <span className="text-xl leading-none">+</span>
                  <span>Upload Your Products</span>
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-6 py-4 text-base font-semibold text-gray-400"
                  >
                    <span className="text-xl leading-none">+</span>
                    <span>Upload Your Products</span>
                  </button>
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100">
                    You don&apos;t have permission
                  </span>
                </>
              )}
            </div>

            <div className="pt-1 text-center">
              <p className="text-sm leading-7 text-gray-700">
                You haven&apos;t added any vehicles yet
                <br />
                or something went wrong.
              </p>
            </div>
          </div>
        </div>

        {products.map((product, index) => {
          if (index === products.length - 1) {
            return (
              <div ref={lastProductRef} key={index}>
                <ProductCard product={product} parsedUser={parsedUser} className="pb-20" />
              </div>
            );
          }
          return <ProductCard key={index} parsedUser={parsedUser} product={product} />;
        })}

      </div>
      {/* Footer section with loading indicator */}
      <div className="w-full flex justify-center pb-10 min-h-[50px]">
        {loadingNewData ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500">Loading more products...</span>
          </div>
        ) : !hasMore ? (
          <p className="text-gray-400 text-sm">No more products to load.</p>
        ) : null}
      </div>
    </div>
  );
};

export default CompanyShopProducts;
