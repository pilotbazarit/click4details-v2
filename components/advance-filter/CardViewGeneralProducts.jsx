import React, { useRef, useCallback } from "react";
import { useGeneralProductFilterContext } from "@/context/GeneralProductFilterContextProvider";
import GeneralProductCard from "@/components/GeneralProductCard";

const CardViewGeneralProducts = ({ filterFields }) => {
    const { products, loading, hasMore, getAllGeneralProduct } = useGeneralProductFilterContext();
    const observerRef = useRef();

    const lastProductRef = useCallback(
        (node) => {
            if (loading) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    getAllGeneralProduct(filterFields);
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [loading, hasMore, getAllGeneralProduct]
    );

    return (
        <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-5 gap-2 mt-6 pb-14 w-full mx-auto">
                {products && products.length > 0 && products.map((product, index) => {
                    if (index === products.length - 1) {
                        return (
                            <div ref={lastProductRef} key={product.p_id || index}>
                                <GeneralProductCard product={product} />
                            </div>
                        );
                    }
                    return <GeneralProductCard key={product.p_id || index} product={product} />;
                })}

                {loading && Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="animate-pulse bg-gray-200 h-48 rounded-xl" />
                ))}
            </div>

            {!loading && !hasMore && products.length === 0 && (
                <p className="text-gray-400 text-sm py-10">কোনো পণ্য পাওয়া যায়নি।</p>
            )}

            {!hasMore && products.length > 0 && (
                <p className="text-gray-400 text-sm pb-10">আর কোনো পণ্য নেই।</p>
            )}
        </div>
    );
};

export default CardViewGeneralProducts;
