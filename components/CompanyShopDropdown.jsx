"use client";
import React, { useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, Check, ChevronsUpDown, Search } from 'lucide-react';
import { useAppContext } from "@/context/AppContext";
import Link from 'next/link';
import { hasPermission } from '@/lib/utils';

const CompanyShopDropdown = () => {
    const { companyShops, selectedCompanyShop, setSelectedCompanyShop, shops, selectedShop, setSelectedShop, permissionList } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [openCollapsible, setOpenCollapsible] = useState(null);
    const [search, setSearch] = useState("");

    const handleSelect = (item) => {
        setSelectedCompanyShop(item);
        setSelectedShop(item?.shop);
    };

    const filteredCompanyShops = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return companyShops || [];
        return (companyShops || []).filter((companyShop) => {
            const phone = companyShop?.shop?.user?.phone || "";
            return companyShop?.shop?.s_title?.toLowerCase().includes(term) || String(phone).includes(term);
        });
    }, [companyShops, search]);

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
                        {companyShops && companyShops.length > 3 && (
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
                        {filteredCompanyShops.length === 0 && (
                            <p className="px-3 py-2 text-xs text-gray-400">No shops found</p>
                        )}
                        {filteredCompanyShops.map((companyShop, index) => (
                            <Collapsible.Root
                                key={index}
                                open={openCollapsible === companyShop?.shop?.s_id}
                                onOpenChange={() => setOpenCollapsible(openCollapsible === companyShop?.shop.s_id ? null : companyShop?.shop.s_id)}
                            >
                                <div className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
                                    <button
                                        onClick={() => handleSelect(companyShop)}
                                        className="flex-grow text-left flex flex-col items-start"
                                    >
                                        <span className={`truncate ${selectedCompanyShop && selectedCompanyShop?.shop?.s_id === companyShop?.shop?.s_id ? 'font-bold' : ''}`}>{companyShop?.shop?.s_title}</span>
                                        {companyShop?.shop?.user?.phone && (
                                            <span className="text-[11px] text-gray-400">{companyShop.shop.user.phone}</span>
                                        )}
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
