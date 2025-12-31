import React, { useRef, useEffect, useCallback, useState } from "react";
import ProductCard from "./ProductCard";
import { useMemberShopProductContext } from "@/context/MemberShopProductContext";

const MemberShopProducts = () => {
  const { products, loading, hasMore, getAllProduct, user } = useMemberShopProductContext();
  const observerRef = useRef();
  const [loadingNewData, setLoadingNewData] = useState(false);

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


  let parsedUser = null;
  try {
    parsedUser = user ? (typeof user === 'string' ? JSON.parse(user) : user) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
  }

  return (
    <div className="flex flex-col items-center pt-4">
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
        max-w-screen-5xl
        min-h-screen
        items-center"
      >
        {
          products.length === 0 && !loading ? (
            <div className="col-span-5 text-center text-gray-500">No products found.</div>
          ) :
            products.map((product, index) => {
              if (index === products.length - 1) {
                return (
                  <div ref={lastProductRef} key={index}>
                    <ProductCard product={product} parsedUser={parsedUser} className="pb-20" />
                  </div>
                );
              }
              return <ProductCard key={index} parsedUser={parsedUser} product={product} />;
            })
        }

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

export default MemberShopProducts;
