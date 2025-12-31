import React, { useRef, useEffect, useCallback, useState } from "react";
import { useGeneralProductContext } from "@/context/GeneralProductContext";
import GeneralProductCard from "./GeneralProductCard";

const GeneralProduct = () => {
  const { products, productLoading, loading, hasMore, getAllProduct } = useGeneralProductContext();
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



  // width check for responsive design
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getBreakpoint = (w) => {
    if (w < 640) return 'Base (mobile)'
    if (w < 768) return 'sm'
    if (w < 1024) return 'md'
    if (w < 1280) return 'lg'
    if (w < 1536) return 'xl'
    if (w < 1920) return '2xl'
    if (w < 2560) return '3xl'
    return '4xl+'
  }


  return (
    <>
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
          max-w-screen-5xl "
        >
          {products.map((product, index) => {
            if (index === products.length - 1) {
              return (
                <div ref={lastProductRef} key={index}>
                  <GeneralProductCard product={product} className="pb-20" />
                </div>
              );
            }
            return <GeneralProductCard key={index} product={product} />;
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
    </>
  );
};

export default GeneralProduct;
