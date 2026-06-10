"use client";
import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, Check, ChevronsUpDown } from 'lucide-react';
import { useAppContext } from "@/context/AppContext";
import Link from 'next/link';
import { hasPermission } from '@/lib/utils';

const CompanyShopDropdown = () => {
    const { companyShops, selectedCompanyShop, setSelectedCompanyShop, shops, selectedShop, setSelectedShop, permissionList } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [openCollapsible, setOpenCollapsible] = useState(null);

    const handleSelect = (item) => {
        setSelectedCompanyShop(item);
        setSelectedShop(item?.shop);
    };

    let companyShopId = selectedCompanyShop?.shop?.s_id;
    let priceAction = "Create"

    const hasCompanyShopProductCreatePermission = hasPermission(permissionList, companyShopId, "Vehicle", priceAction);

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button className="flex items-center justify-between gap-2 w-48 appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-2 text-sm leading-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <span className="truncate">{selectedCompanyShop ? selectedCompanyShop?.shop?.s_title : 'Select a shop'}</span>
                    <ChevronsUpDown className="h-4 w-4 text-gray-500" />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    sideOffset={5}
                    className="z-[9999] rounded bg-white p-2 shadow-lg border border-gray-200 w-56"
                >
                    <div className="flex flex-col gap-1">
                        {companyShops.map((companyShop, index) => (
                            <Collapsible.Root
                                key={index}
                                open={openCollapsible === companyShop?.shop?.s_id}
                                onOpenChange={() => setOpenCollapsible(openCollapsible === companyShop?.shop.s_id ? null : companyShop?.shop.s_id)}
                            >
                                <div className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
                                    <button
                                        onClick={() => handleSelect(companyShop)}
                                        className="flex-grow text-left flex items-center"
                                    >
                                        <span className={`truncate ${selectedCompanyShop && selectedCompanyShop?.shop?.s_id === companyShop?.shop?.s_id ? 'font-bold' : ''}`}>{companyShop?.shop?.s_title}</span>
                                    </button>
                                    {selectedCompanyShop && selectedCompanyShop?.shop?.s_id === companyShop?.shop?.s_id && <Check className="h-4 w-4 mr-2" />}
                                    <Collapsible.Trigger asChild>
                                        <button
                                            onClick={() => handleSelect(companyShop)}
                                            className="p-1"
                                        >
                                            <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                                        </button>
                                    </Collapsible.Trigger>
                                </div>

                                <Collapsible.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                                    <div className="pl-6 pr-2 py-2 bg-gray-50">
                                        <ul className="flex flex-col gap-2 text-xs">
                                            <li className="group relative rounded p-1 hover:bg-gray-200">
                                                {hasCompanyShopProductCreatePermission ? (
                                                    <Link href={`/dashboard/products/vehicle/create`} className="block">
                                                        Product Upload
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled
                                                            title="You don't have permission"
                                                            className="block w-full cursor-not-allowed text-left text-gray-400"
                                                        >
                                                            Product Upload sd
                                                        </button>
                                                        {/* <span className="pointer-events-none absolute left-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100">
                                                            You don&apos;t have permission
                                                        </span> */}
                                                    </>
                                                )}
                                            </li>
                                        </ul>
                                    </div>
                                </Collapsible.Content>
                            </Collapsible.Root>
                        ))}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};

export default CompanyShopDropdown;
