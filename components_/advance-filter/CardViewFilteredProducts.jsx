import React, { useRef, useEffect, useCallback } from "react";
import { useAdvanceFilterProductContext } from "@/context/AdvanceFilterProductContextProvider";
import ProductCard from "../ProductCard";


const CardViewFilteredProducts = ({filterFields}) => {

    const { products, loading, hasMore, getAllProduct } = useAdvanceFilterProductContext();
    const observerRef = useRef();
    
    const lastProductRef = useCallback (
        (node) => {
            if (loading) {
                return;
            }
          
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
    
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    getAllProduct(filterFields); // fetch next page
                }
            });
    
            if (node) {
                observerRef.current.observe(node);
            }
        },
        [loading, hasMore, getAllProduct]
    );
    
    return (
        <div className="flex flex-col items-center">
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
                xl:px-16 2xl:px-18 3xl:px-20 4xl:px-24
                max-w-screen-3xl mx-auto"
            >
                {
                    products && products.length > 0 && products.map((product, index) => {
                        if (index === products.length - 1) {
                            return (
                                <div ref={lastProductRef} key={index}>
                                    <ProductCard product={product} />
                                </div>
                            );
                        }
                        return <ProductCard key={index} product={product} />;
                    })
                }
    
                {/* Loader or Skeletons */}
                {
                    loading && Array.from({ length: 4 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="animate-pulse bg-gray-200 h-48 rounded"></div>
                    ))
                }
            </div>

            {!hasMore && (
                <p className="text-gray-400 text-sm pb-10">No more products to load.</p>
            )}
        </div>
    );
};

export default CardViewFilteredProducts;