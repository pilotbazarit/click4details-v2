'use client'
import GeneralProductService from '@/services/GeneralProductService';
import { createContext, useContext, useState } from 'react';

export const GeneralProductFilterContext = createContext();

export const useGeneralProductFilterContext = () => useContext(GeneralProductFilterContext);

export const GeneralProductFilterContextProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const getAllGeneralProduct = async (filterFields = {}, reset = false) => {
        setLoading(true);
        try {
            if (reset) {
                setProducts([]);
                setPage(1);
            }

            const currentPage = reset ? 1 : page;

            const params = {
                _page: currentPage,
                _perPage: 25,
                _status: 'active',
                ...filterFields,
            };

            const res = await GeneralProductService.Queries.getGeneralProducts(params);

            if (res?.status === 'success') {
                const newProducts = res?.data?.data || [];
                setTotal(res?.data?.total || 0);
                setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);
                if (newProducts.length > 0) {
                    setPage(prev => reset ? 2 : prev + 1);
                    setHasMore(newProducts.length === 25);
                } else {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
                setTotal(0);
            }
        } catch {
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GeneralProductFilterContext.Provider value={{ products, loading, hasMore, total, getAllGeneralProduct }}>
            {children}
        </GeneralProductFilterContext.Provider>
    );
};
