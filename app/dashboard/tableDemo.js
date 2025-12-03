"use client";
import React, { useEffect, useState } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import TableFilter from "@/components/TableFilter";

const Shop = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = () => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            {loading ? (
                <Loading />
            ) : (
                <div className="w-full md:p-10 p-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">All Shops</h2>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            + Add Shop
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">

                        {/* Rows per page dropdown (right) */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="rowsPerPage" className="text-sm text-gray-700">
                                Show
                            </label>
                            <select
                                id="rowsPerPage"
                                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                    // You'll later handle this in state
                                }}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                            <span className="text-sm text-gray-700">entries</span>
                        </div>
                        {/* Search Input (left) */}
                        <div className="w-full md:w-1/3">
                            <Input
                                type="text"
                                placeholder="Search shop..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>


                    </div>

                    <div className="flex flex-col items-center w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                        <Table className="w-full border border-gray-300">
                            <TableHeader>
                                <TableRow className="border-b border-gray-300">
                                    <TableHead className="border-r border-gray-300 w-[100px]">Invoice</TableHead>
                                    <TableHead className="border-r border-gray-300">Status</TableHead>
                                    <TableHead className="border-r border-gray-300">Method</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-b border-gray-200">
                                    <TableCell className="border-r border-gray-200 font-medium">INV001</TableCell>
                                    <TableCell className="border-r border-gray-200">Paid</TableCell>
                                    <TableCell className="border-r border-gray-200">Credit Card</TableCell>
                                    <TableCell className="text-right">$250.00</TableCell>
                                </TableRow>
                                <TableRow className="border-b border-gray-200">
                                    <TableCell className="border-r border-gray-200 font-medium">INV002</TableCell>
                                    <TableCell className="border-r border-gray-200">Unpaid</TableCell>
                                    <TableCell className="border-r border-gray-200">Bank Transfer</TableCell>
                                    <TableCell className="text-right">$150.00</TableCell>
                                </TableRow>
                                <TableRow className="border-b border-gray-200">
                                    <TableCell className="border-r border-gray-200 font-medium">INV003</TableCell>
                                    <TableCell className="border-r border-gray-200">Pending</TableCell>
                                    <TableCell className="border-r border-gray-200">Cash</TableCell>
                                    <TableCell className="text-right">$100.00</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <div className="flex justify-between items-center w-full px-4 py-3 border-t border-gray-200 bg-white">
                            <span className="text-sm text-gray-600">
                                Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">50</span> results
                            </span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="text-sm px-3">
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    <Button size="sm" className="bg-blue-600 text-white px-3 text-sm">1</Button>
                                    <Button variant="outline" size="sm" className="px-3 text-sm">2</Button>
                                    <Button variant="outline" size="sm" className="px-3 text-sm">3</Button>
                                    <span className="px-2 text-sm text-gray-500">...</span>
                                    <Button variant="outline" size="sm" className="px-3 text-sm">10</Button>
                                </div>
                                <Button variant="outline" size="sm" className="text-sm px-3">
                                    Next
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Shop;
