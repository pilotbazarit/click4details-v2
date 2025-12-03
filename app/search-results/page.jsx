"use client";
import { Suspense } from 'react';
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import SearchService from "@/services/SearchService";
import Loading from "@/components/Loading";

const SearchResultsContent = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchParamsState, setSearchParamsState] = useState({
    userId: null,
    source: null,
    shopId: null
  });

  // Get all params from URL
  const queryParam = searchParams.get('query');
  const userIdParam = searchParams.get('user_id');
  const sourceParam = searchParams.get('source');
  const shopIdParam = searchParams.get('_shop_id');

  // Update search params state when URL params change
  useEffect(() => {
    setSearchParamsState({
      userId: userIdParam,
      source: sourceParam,
      shopId: shopIdParam
    });
  }, [userIdParam, sourceParam, shopIdParam]);

  // Listen for custom event when search is triggered from Navbar (when already on search-results page)
  useEffect(() => {
    const handleSearchQueryChanged = (event) => {
      const url = new URL(event.detail.url, window.location.origin);
      const newQuery = url.searchParams.get('query');
      const newUserId = url.searchParams.get('user_id');
      const newSource = url.searchParams.get('source');
      const newShopId = url.searchParams.get('_shop_id');
      
      if (newQuery && newQuery !== searchQuery) {
        // Update query and reset state
        setSearchQuery(newQuery);
        setProducts([]);
        setPage(1);
        setHasMore(true);
        // Update search params state from the new URL
        setSearchParamsState({
          userId: newUserId,
          source: newSource,
          shopId: newShopId
        });
      }
    };

    window.addEventListener('searchQueryChanged', handleSearchQueryChanged);
    return () => {
      window.removeEventListener('searchQueryChanged', handleSearchQueryChanged);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (queryParam && queryParam !== searchQuery) {
      setSearchQuery(queryParam);
      setProducts([]);
      setPage(1);
      setHasMore(true);
    }
  }, [queryParam, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      setLoading(true);

      const params = { query: searchQuery, page: page };
      // Use state params (which update when custom event fires) or fallback to URL params
      const userId = searchParamsState.userId || userIdParam;
      const source = searchParamsState.source || sourceParam;
      const shopId = searchParamsState.shopId || shopIdParam;
      
      if (userId) {
        params.user_id = userId;
      }
      if (source) {
        params.source = source;
      }
      if (shopId) {
        params._shop_id = shopId;
      }

      SearchService.Queries.searchProducts(params)
        .then(response => {
          const newProducts = response?.data || [];
          // Reset products on new search (page 1), append on pagination (page > 1)
          setProducts(prevProducts => page === 1 ? newProducts : [...prevProducts, ...newProducts]);
          setHasMore(newProducts.length > 0);
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
        });
    }
  }, [searchQuery, page, searchParamsState, userIdParam, sourceParam, shopIdParam]);

  useEffect(() => {
    let timeoutId;

    const handleScroll = () => {
      // Debounce scroll events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Check if we're near the bottom of the page
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Load more when user is within 100px of the bottom
        if (scrollTop + windowHeight >= documentHeight - 600 && hasMore && !loading) {
          setPage(prevPage => prevPage + 1);
        }
      }, 600); // 100ms debounce
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [hasMore, loading]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center pt-12 mb-6 w-full">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Search Results for: <span className="text-orange-600">{searchQuery}</span></h1>
          <p className="text-lg text-gray-600">Discover products matching your search criteria.</p>
          <div className="w-24 h-1 bg-orange-600 rounded-full mt-4"></div>
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
          {products.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>

        {/* Loading indicator at bottom */}
        {loading && (
          <div className="w-full flex justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="text-gray-600">Loading more products...</span>
            </div>
          </div>
        )}

        {/* No more results indicator */}
        {!hasMore && products.length > 0 && (
          <div className="w-full text-center py-8 my-4 bg-gray-100 rounded-lg shadow-md">
            <p className="text-gray-700 text-xl font-bold">No more results found.</p>
            <p className="text-gray-500 text-md mt-2">You've reached the end of the search results.</p>
          </div>
        )}

        {/* No results found */}
        {!hasMore && products.length === 0 && !loading && (
          <div className="w-full text-center py-12 my-4 bg-gray-100 rounded-lg shadow-md">
            <p className="text-gray-700 text-xl font-bold">No products found.</p>
            <p className="text-gray-500 text-md mt-2">Try adjusting your search terms or browse our categories.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

const SearchResults = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchResults;
