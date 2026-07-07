"use client";
import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, Check, ChevronsUpDown, Plug, LogOut, Store } from 'lucide-react';
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
    const productType = String(searchParams.get('product_type') || '').toLowerCase();
    const uploadProductHref = productType === 'general'
        ? '/dashboard/products/general-product/create/'
        : '/dashboard/products/vehicle/create';

    const handleSelect = (shop) => {
        setSelectedShop(shop);
    };

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
                        {shops && shops.length > 0 && shops.map((shop) => (
                            <Collapsible.Root
                                key={shop.s_id}
                                open={openCollapsible === shop.s_id}
                                onOpenChange={() => setOpenCollapsible(openCollapsible === shop.s_id ? null : shop.s_id)}
                            >
                                <div className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
                                    <button
                                        onClick={() => handleSelect(shop)}
                                        className="flex-grow text-left flex items-center"
                                    >
                                        <span className={`truncate ${selectedShop && selectedShop.s_id === shop.s_id ? 'font-bold' : ''}`}>{shop.s_title}</span>
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
