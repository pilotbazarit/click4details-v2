'use client'
import VehicleService from '@/services/VehicleService';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";


// Create the context
export const AdvanceFilterProductContext = createContext();

export const useAdvanceFilterProductContext = () => useContext(AdvanceFilterProductContext);

// Context provider component
export const AdvanceFilterProductContextProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [user, setUser] = useState(null);
    
    const router = useRouter();

    
    const getAllProduct = async (filterFields = {}, reset = false) => {
        setLoading(true);
        try {
            // Reset state if needed
            if (reset) {
                setProducts([]);
                setPage(1);
            }
    
            const currentPage = reset ? 1 : page;
    
            const params = {
                _page: currentPage,
                _perPage: 25,
                ...filterFields,
            };

            // Fetch products with filters
            const res = await VehicleService.Queries.getAdvanceFilterProducts(params);

            if (res.status === "success") {
                const newProducts = res?.data?.data || [];
                setTotal(res?.data?.total || 0);

                setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);

                if (newProducts.length > 0) {
                    setPage(prev => reset ? 2 : prev + 1);
                    setHasMore(newProducts.length === 25); // Set hasMore based on page size
                } else {
                    setHasMore(false); // No more products to fetch
                }
            } else {
                setHasMore(false);
                setTotal(0);
            }
        } catch (error) {
            console.log("get product error", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const userData = localStorage.getItem("user");
        const userInfo = userData && JSON.parse(userData);

        if (!userInfo) {
            router.push("/pb-home");
        }
        setUser(userInfo);
        setLoading(false);
    }, []);

    
    const value = {
        products,
        loading,
        hasMore,
        total,
        getAllProduct,
    };

    if (loading) {
        // return <div>Loading authentication...</div>;
    }

    return (
        <AdvanceFilterProductContext.Provider value={value}>
            {children}
        </AdvanceFilterProductContext.Provider>
    );
};