import React, { useRef, useEffect, useCallback, useState } from "react";
import ProductCard from "./ProductCard";
import GeneralProductCard from "./GeneralProductCard";
import ProductCardSkeleton from "./ProductSkeleton";
import { useMyShopProductContext } from "@/context/MyShopProductContext";
import { useAppContext } from "@/context/AppContext";
import ShopService from "@/services/ShopService";
import MyShopFilter from "./MyShopFilter";
import GeneralProduct from "./GeneralProduct";
import Link from 'next/link';

const MyShopProducts = () => {
  const { products, loading, hasMore, getAllProduct, getAllGeneralProduct, selectedProductType } = useMyShopProductContext();
  const observerRef = useRef();
  const [loadingNewData, setLoadingNewData] = useState(false);

  const { shops, setShops, user, selectedShop, setSelectedShop } = useAppContext();

  let parsedUser = null;
  try {
    parsedUser = user ? (typeof user === 'string' ? JSON.parse(user) : user) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
  }


  // console.log("user:::", parsedUser);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await ShopService.Queries.getShops(
          {
            order: "desc",
            orderBy: "md_id",
            _user_id: parsedUser?.id,
            _page: 1,
            _perPage: 1000,
          }
        );

        setShops(response?.data?.data);

        setSelectedShop(response?.data?.data[0]);

      } catch (error) {
        console.log("Error fetching shops:", error);
      }
    };
    if (parsedUser) {
      fetchShops();
    }
  }, [setShops, user]);

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
          if (selectedProductType === 'vehicle') {
            await getAllProduct();
          } else if (selectedProductType === 'general') {
            await getAllGeneralProduct();
          }
          setLoadingNewData(false);
        }
      }, {
        root: null, // Use the viewport
        rootMargin: "0px",
        threshold: 0.1 // Trigger a bit before it's fully in view
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, getAllProduct, getAllGeneralProduct, selectedProductType]
  );



  return (
    <div className="flex flex-col items-start pt-4">
      <div className="w-[100%] px-4 mb-6">
        <MyShopFilter />
      </div>

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
        {/* Always show this card as first item */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center space-y-4">
            {/* Refresh Button */}
            <button
              onClick={() => {
                if (selectedProductType === 'vehicle') {
                  getAllProduct();
                } else if (selectedProductType === 'general') {
                  getAllGeneralProduct();
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-blue-600 font-medium rounded-full border-2 border-gray-200 hover:bg-blue-50 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            {/* Upload Button */}
            <button 
              className="w-full 
                px-6 
                py-3 
                text-blue-600 
                font-semibold 
                rounded-full 
                border-2 
                border-gray-300 
                hover:bg-gray-50 
                transition-colors 
                flex items-center 
                justify-center 
                gap-2"
              >
              <span className="text-xl">+</span>
                <Link href={`/dashboard/products/vehicle/create`} className="block">Upload Your Products</Link>            
            </button>

            {/* Message */}
            <div className="text-center pt-2">
              <p className="text-gray-700 text-sm leading-relaxed">
                You haven't added any vehicles yet
                <br />
                or something went wrong.
              </p>
            </div>
          </div>
        </div>

        {/* Rest of the products */}
        {products.map((product, index) => {
          if (index === products.length - 1) {
            return (
              <div ref={lastProductRef} key={index}>
                {selectedProductType === 'vehicle' ? (

                  <ProductCard product={product} parsedUser={parsedUser} className="pb-20" />
                ) : (
                  // <h1 key={index}>General Product</h1>
                  <GeneralProductCard product={product} />
                )}
              </div>
            );
          }
          return selectedProductType === 'vehicle' ? (
            <ProductCard key={index} parsedUser={parsedUser} product={product} />
          ) : (
            // <h1 key={index}>General Product</h1>
            <GeneralProductCard key={index}  product={product} />
          );
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

export default MyShopProducts;
