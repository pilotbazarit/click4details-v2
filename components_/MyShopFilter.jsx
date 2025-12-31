import React from 'react'
import { useMyShopProductContext } from '@/context/MyShopProductContext';


const MyShopFilter = () => {
    const { selectedProductType, setSelectedProductType, setPage } = useMyShopProductContext();

    const handleProductTypeChange = (e) => {
        setSelectedProductType(e.target.value);
        // setPage(1);
    };


    return (
        <div>
            {/* <div className="w-[100%] px-4 mb-6"> */}
                <div className="relative group">
                    {/* Gradient background on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>

                    {/* Main card */}
                    <div className="relative flex flex-col items-center bg-white rounded-xl shadow-lg border border-gray-100 p-5 transition-all duration-300 group-hover:shadow-xl">
                        {/* Icon and Label */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </div>
                            <label className="text-base font-bold text-gray-800">
                                Filter Products
                            </label>
                        </div>

                        {/* Select dropdown */}
                        <div className="relative w-[30%]">
                            <select
                                className="w-full appearance-none bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-11 text-gray-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-400 transition-all duration-200 cursor-pointer shadow-sm"
                                value={selectedProductType}
                                onChange={handleProductTypeChange}
                            >
                                <option value="vehicle">🚗 Vehicles</option>
                                <option value="general">🛒 General Products</option>
                            </select>

                            {/* Custom dropdown arrow */}
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1.5">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Bottom accent line */}
                        <div className="w-[30%] mt-3 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </div>
            {/* </div> */}
        </div>
    )
}

export default MyShopFilter;
