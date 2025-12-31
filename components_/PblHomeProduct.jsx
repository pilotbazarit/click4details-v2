import React, { useRef, useEffect, useCallback, useState } from "react";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductSkeleton";
import { usePblHomeProductContext } from "@/context/PblHomeProductContext";

const PblHomeProduct = () => {
  const { products, loading, hasMore, getAllProduct } = usePblHomeProductContext();
  const observerRef = useRef();
  const [loadingNewData, setLoadingNewData] = useState(false);

  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

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
        max-w-screen-5xl"
      >
        {products.map((product, index) => {
          if (index === products.length - 1) {
            return (
              <div ref={lastProductRef} key={index}>
                <ProductCard product={product} className="pb-20" />
              </div>
            );
          }
          return <ProductCard key={index} product={product} />;
        })}

        {/* {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))} */}
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

export default PblHomeProduct;
