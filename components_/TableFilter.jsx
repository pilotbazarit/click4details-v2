import React, { useEffect } from 'react'
import { Input } from "@/components/ui/input";

const TableFilter = ({ query, setQuery, setCurrentPage, fetchSearchResults, itemsPerPage, setItemsPerPage, placeholder = 'Search...', onClearSearch }) => {

    //  console.log("query:::::", query);


    useEffect(() => {
        if(query && query.trim() !== '') {
            const timer = setTimeout(() => {
                fetchSearchResults()
            }, 500)

            return () => clearTimeout(timer)
        }
    }, [query])

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">

            {/* Rows per page dropdown (right) */}
            <div className="flex items-center gap-2">
                <label htmlFor="rowsPerPage" className="text-sm text-gray-700">
                    Show
                </label>
                <select
                    id="rowsPerPage"
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page when items per page changes
                    }}
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
                <span className="text-sm text-gray-700">entries</span>
            </div>
            {/* Search Input (left) */}
            <div className="w-full md:w-1/3 relative">
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pr-10"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setCurrentPage(1);
                            // Call the onClearSearch callback if provided
                            if (onClearSearch) {
                                onClearSearch();
                            }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Clear search"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}
            </div>


        </div>
    )
}

export default TableFilter