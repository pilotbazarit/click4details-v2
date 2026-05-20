import React, { useRef } from 'react';
import { useMyShopProductContext } from '@/context/MyShopProductContext';
import { ArrowDownAZ } from 'lucide-react';

const MyShopFilter = () => {
  const { selectedProductType, setSelectedProductType } = useMyShopProductContext();
  const menuRef = useRef(null);

  const handleProductTypeChange = (e) => {
    setSelectedProductType(e.target.value);

    if (menuRef.current) {
      menuRef.current.open = false;
    }
  };

  return (
    <div className="relative inline-block">
      <details ref={menuRef} className="group">
        <summary className="list-none [&::-webkit-details-marker]:hidden inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-blue-400 hover:text-blue-600">
            {/* <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter Products</span> */}
            <ArrowDownAZ className="h-4 w-6"/>
          {/* <svg className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg> */}
        </summary>

        <div className="absolute right-0 z-30 mt-2 w-64 max-w-[85vw] rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
          <label htmlFor="product-type-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Product Type
          </label>
          <div className="relative">
            <select
              id="product-type-filter"
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={selectedProductType}
              onChange={handleProductTypeChange}
            >
              <option value="vehicle">Vehicles</option>
              <option value="general">General Products</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                {/* <ArrowDownAZ className="h-4 w-4"/> */}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};

export default MyShopFilter;
