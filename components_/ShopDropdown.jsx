"use client";
import React, { useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, Check, ChevronsUpDown, Plug, LogOut, Search, Store } from 'lucide-react';
import { useAppContext } from "@/context/AppContext";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ShopModal from './modals/ShopModal';
import ManageShopModal from './modals/ManageShopModal';

const ShopDropdown = () => {
    const { shops, selectedShop, setSelectedShop } = useAppContext();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenManageModal, setIsOpenManageModal] = useState(false);
    const [isOpenNewShopModal, setIsOpenNewShopModal] = useState(false);
    const [openCollapsible, setOpenCollapsible] = useState(null);
    const [search, setSearch] = useState("");
    const productType = String(searchParams.get('product_type') || '').toLowerCase();
    const uploadProductHref = productType === 'general'
        ? '/dashboard/products/general-product/create/'
        : '/dashboard/products/vehicle/create';

    const handleSelect = (shop) => {
        setSelectedShop(shop);
    };

    const filteredShops = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return shops || [];
        return (shops || []).filter((shop) => {
            const phone = shop?.user?.phone || shop?.s_user_phone || "";
            return shop.s_title?.toLowerCase().includes(term) || String(phone).includes(term);
        });
    }, [shops, search]);

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button className="flex items-center justify-between gap-2 w-48 appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-2 text-sm leading-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <span className="truncate">{selectedShop ? selectedShop.s_title : 'Select a shop'}</span>
                    <ChevronsUpDown className="h-4 w-4 text-gray-500" />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    sideOffset={5}
                    className="z-[9999] rounded bg-white p-2 shadow-lg border border-gray-200 w-56"
                >
                    <div className="flex flex-col gap-1">
                        {shops && shops.length > 3 && (
                            <div className="relative mb-1">
                                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search shop or phone"
                                    className="w-full rounded border border-gray-200 py-1.5 pl-7 pr-2 text-xs outline-none focus:border-indigo-400"
                                />
                            </div>
                        )}
                        {filteredShops.length === 0 && (
                            <p className="px-3 py-2 text-xs text-gray-400">No shops found</p>
                        )}
                        {filteredShops.map((shop) => (
                            <Collapsible.Root
                                key={shop.s_id}
                                open={openCollapsible === shop.s_id}
                                onOpenChange={() => setOpenCollapsible(openCollapsible === shop.s_id ? null : shop.s_id)}
                            >
                                <div className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
                                    <button
                                        onClick={() => handleSelect(shop)}
                                        className="flex-grow text-left flex flex-col items-start"
                                    >
                                        <span className={`truncate ${selectedShop && selectedShop.s_id === shop.s_id ? 'font-bold' : ''}`}>{shop.s_title}</span>
                                        {(shop?.user?.phone || shop?.s_user_phone) && (
                                            <span className="text-[11px] text-gray-400">{shop?.user?.phone || shop?.s_user_phone}</span>
                                        )}
                                    </button>
                                    {selectedShop && selectedShop.s_id === shop.s_id && <Check className="h-4 w-4 mr-2" />}
                                    <Collapsible.Trigger asChild>
                                        <button
                                            onClick={() => handleSelect(shop)}
                                            className="p-1"
                                        >
                                            <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                                        </button>
                                    </Collapsible.Trigger>
                                </div>

                                <Collapsible.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                                    <div className="pl-6 pr-2 py-2 bg-gray-50">
                                        <ul className="flex flex-col gap-2 text-xs">
                                            <li className="hover:bg-gray-200 rounded p-1">
                                                <button
                                                    className="block"
                                                    onClick={() => setIsOpenManageModal(true)}
                                                >
                                                    Manage Shop
                                                </button>
                                            </li>
                                            <li className="hover:bg-gray-200 rounded p-1">
                                                <Link href={uploadProductHref} className="block">Product Upload</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </Collapsible.Content>
                            </Collapsible.Root>
                        ))}



                        <div className="border-t border-gray-200 mt-2 pt-2">
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/dashboard/shop"
                                    className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 transition"
                                >
                                    <Store className="h-4 w-4 text-blue-600" />
                                    <span>Shop Create / Edit</span>
                                </Link>

                            </div>
                        </div>

                        {/* <div className="pt-2 mt-2 border-t border-gray-200">
                            <button
                                // onClick={}
                                // onClick={() => setIsOpenNewShopModal(true)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                            >
                                Create a new shop
                            </button>
                        </div> */}
                    </div>
                </Popover.Content>
            </Popover.Portal>


            <ManageShopModal open={isOpenManageModal} setOpen={setIsOpenManageModal} />
            <ShopModal open={isOpenNewShopModal} setOpen={setIsOpenNewShopModal} />

        </Popover.Root>
    );
};

export default ShopDropdown;
