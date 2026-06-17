"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GeneralCategorySection from "@/components/advance-filter/GeneralCategorySection";
import GeneralProductFiltersSection from "@/components/advance-filter/GeneralProductFiltersSection";
import CardViewGeneralProducts from "@/components/advance-filter/CardViewGeneralProducts";
import { GeneralProductFilterContextProvider, useGeneralProductFilterContext } from "@/context/GeneralProductFilterContextProvider";
import FilterProductService from "@/services/FilterProductService";
import { BRAND_MD_CODE, USER_AVAILABILITY_MD_CODE, CONSTANTS_MD_CODE } from "@/lib/constant";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";

const INITIAL_FILTER = {};

const GeneralProductsInner = () => {
    const { getAllGeneralProduct, total, loading } = useGeneralProductFilterContext();
    const searchParams = useSearchParams();

    const [filterFields, setFilterFields] = useState(INITIAL_FILTER);

    // Category hierarchy data
    const [categoryData, setCategoryData] = useState([]);
    const [subcategoryData, setSubcategoryData] = useState([]);
    const [childCategoryData, setChildCategoryData] = useState([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [isSubcategoryLoading, setIsSubcategoryLoading] = useState(false);
    const [isChildCategoryLoading, setIsChildCategoryLoading] = useState(false);

    // Other filter data
    const [locationData, setLocationData] = useState([]);
    const [brandData, setBrandData] = useState([]);
    const [availabilityData, setAvailabilityData] = useState([]);
    const [conditionData, setConditionData] = useState([]);
    const [isFiltersLoading, setIsFiltersLoading] = useState(false);

    const [hasSearched, setHasSearched] = useState(false);

    // Load all filter data on mount
    useEffect(() => {
        const loadData = async () => {
            setIsCategoryLoading(true);
            setIsFiltersLoading(true);
            try {
                const [cats, locs, brands, avail, conds] = await Promise.all([
                    FilterProductService.Queries.getCategoryOptions(),
                    FilterProductService.Queries.getLocationOptions(),
                    FilterProductService.Queries.getMasterDataOptions(BRAND_MD_CODE),
                    FilterProductService.Queries.getMasterDataOptions(USER_AVAILABILITY_MD_CODE),
                    FilterProductService.Queries.getMasterDataOptions(CONSTANTS_MD_CODE),
                ]);
                setCategoryData(cats || []);
                setLocationData(locs || []);
                setBrandData(brands || []);
                setAvailabilityData(avail || []);
                setConditionData(conds || []);
            } catch {
                // silently ignore
            } finally {
                setIsCategoryLoading(false);
                setIsFiltersLoading(false);
            }
        };
        loadData();
    }, []);

    // Load subcategories when category changes
    useEffect(() => {
        if (!filterFields.category) {
            setSubcategoryData([]);
            setChildCategoryData([]);
            return;
        }
        setIsSubcategoryLoading(true);
        FilterProductService.Queries.getSubcategoryOptions(filterFields.category)
            .then(opts => setSubcategoryData(opts || []))
            .catch(() => setSubcategoryData([]))
            .finally(() => setIsSubcategoryLoading(false));
    }, [filterFields.category]);

    // Load child categories when subcategory changes
    useEffect(() => {
        if (!filterFields.subcategory) {
            setChildCategoryData([]);
            return;
        }
        setIsChildCategoryLoading(true);
        FilterProductService.Queries.getSubcategoryOptions(filterFields.subcategory)
            .then(opts => setChildCategoryData(opts || []))
            .catch(() => setChildCategoryData([]))
            .finally(() => setIsChildCategoryLoading(false));
    }, [filterFields.subcategory]);

    // Pre-fill filters from URL params and auto-search
    useEffect(() => {
        const catId         = searchParams.get("category_id");
        const title         = searchParams.get("_title");
        const priceMin      = searchParams.get("_price_min");
        const priceMax      = searchParams.get("_price_max");
        const brandId       = searchParams.get("_brand_id");
        const conditionId   = searchParams.get("_condition_id");
        const availId       = searchParams.get("_availability_id");
        const locationId    = searchParams.get("_location_id");

        if (catId && !hasSearched) {
            const numCatId = Number(catId);
            const preFilter = {
                category:          numCatId,
                ...(title        && { _title:           title }),
                ...(priceMin     && { _price_min:       Number(priceMin) }),
                ...(priceMax     && { _price_max:       Number(priceMax) }),
                ...(brandId      && { _brand_id:        Number(brandId) }),
                ...(conditionId  && { _condition_id:    Number(conditionId) }),
                ...(availId      && { _availability_id: Number(availId) }),
                ...(locationId   && { _location_id:     Number(locationId) }),
            };
            setFilterFields(preFilter);

            const searchParams_ = { _pCat_id: numCatId, _status: 'active' };
            if (title)       searchParams_._title           = title;
            if (priceMin)    searchParams_._price_min       = Number(priceMin);
            if (priceMax)    searchParams_._price_max       = Number(priceMax);
            if (brandId)     searchParams_._brand_id        = Number(brandId);
            if (conditionId) searchParams_._condition_id    = Number(conditionId);
            if (availId)     searchParams_._availability_id = Number(availId);
            if (locationId)  searchParams_._location_id     = Number(locationId);

            getAllGeneralProduct(searchParams_, true);
            setHasSearched(true);
        }
    }, [searchParams]);

    // Build API params from current filter state — deepest selected level wins
    const buildSearchParams = useCallback(() => {
        const params = { _status: 'active' };

        if (filterFields._title?.trim())      params._title           = filterFields._title.trim();
        if (filterFields._price_min)          params._price_min       = filterFields._price_min;
        if (filterFields._price_max)          params._price_max       = filterFields._price_max;
        if (filterFields._location_id)        params._location_id     = filterFields._location_id;
        if (filterFields._brand_id)           params._brand_id        = filterFields._brand_id;
        if (filterFields._availability_id)    params._availability_id = filterFields._availability_id;
        if (filterFields._condition_id)       params._condition_id    = filterFields._condition_id;

        // Use deepest selected level; _pCat_id fetches the category + all its children
        if (filterFields.child_category) {
            params._category_id = filterFields.child_category;
        } else if (filterFields.subcategory) {
            params._pCat_id = filterFields.subcategory;
        } else if (filterFields.category) {
            params._pCat_id = filterFields.category;
        }

        return params;
    }, [filterFields]);

    const handleSearch = () => {
        getAllGeneralProduct(buildSearchParams(), true);
        setHasSearched(true);
    };

    const handleReset = () => {
        setFilterFields(INITIAL_FILTER);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-xl font-bold text-gray-800">পণ্য খুঁজুন</h1>
                    {hasSearched && (
                        <p className="text-sm text-gray-500 mt-1">
                            {loading ? "খোঁজা হচ্ছে..." : `মোট ${total} টি পণ্য পাওয়া গেছে`}
                        </p>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-start">
                    {/* Filter Sidebar */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                            <h2 className="font-semibold text-gray-700 text-sm border-b pb-2">ফিল্টার</h2>

                            {/* 3-Level Category Hierarchy */}
                            <GeneralCategorySection
                                categoryData={categoryData}
                                subcategoryData={subcategoryData}
                                childCategoryData={childCategoryData}
                                filterFields={filterFields}
                                setFilterFields={setFilterFields}
                                isCategoryLoading={isCategoryLoading}
                                isSubcategoryLoading={isSubcategoryLoading}
                                isChildCategoryLoading={isChildCategoryLoading}
                            />

                            {/* Name, Price Range */}
                            <GeneralProductFiltersSection
                                filterFields={filterFields}
                                setFilterFields={setFilterFields}
                            />

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#0167a1] hover:bg-[#015a8c] text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
                                >
                                    <Search size={15} />
                                    খুঁজুন
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    title="রিসেট"
                                    className="flex items-center justify-center border border-gray-300 hover:border-gray-400 text-gray-600 px-3 py-2.5 rounded-lg transition-colors"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 min-w-0">
                        {!hasSearched ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Search size={40} className="mb-3 opacity-30" />
                                <p className="text-sm">ক্যাটাগরি বেছে নিয়ে খুঁজুন বোতামে ক্লিক করুন</p>
                            </div>
                        ) : (
                            <CardViewGeneralProducts filterFields={buildSearchParams()} />
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

const GeneralProductsFilterPage = () => (
    <Suspense>
        <GeneralProductFilterContextProvider>
            <GeneralProductsInner />
        </GeneralProductFilterContextProvider>
    </Suspense>
);

export default GeneralProductsFilterPage;
