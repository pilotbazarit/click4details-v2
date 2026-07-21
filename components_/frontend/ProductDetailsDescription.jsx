'use client'

import React, { useState } from 'react'
// import { usePathname } from "next/navigation";

const ProductDetailsDescription = ({ productDetails, basePath }) => {
    const descriptionTitle = basePath == '/product/my-shop' ? "Description (User)" : "Description (PB)";
    const descriptionTabs = [
        { key: "description", label: descriptionTitle },
        ...(basePath == '/product' ? [
            { key: "special", label: "Special Description (PB)" },
            { key: "warranty", label: "Warranty" },
        ] : []),
    ];
    const [activeDescriptionTab, setActiveDescriptionTab] = useState("description");
    const visibleDescriptionTab = descriptionTabs.some((tab) => tab.key === activeDescriptionTab)
        ? activeDescriptionTab
        : "description";
    // console.log("user", basePath);

    // const pathname = usePathname();

    //   const basePath =
    //     "/" +
    //     pathname
    //         .split("/")
    //         .filter(Boolean) // খালি string বাদ দেবে
    //         .slice(0, -1) // শেষের ID বাদ দেবে
    //         .join("/");


    return (
        <div>
            <div className="space-y-6">
                <div className="border rounded-lg shadow-sm mt-4 overflow-hidden">
                    <div className="flex flex-wrap gap-2 border rounded-lg border-blue-200 bg-white p-2" role="tablist">
                        {descriptionTabs.map((tab) => {
                            const isActive = visibleDescriptionTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveDescriptionTab(tab.key)}
                                    className={
                                        isActive
                                            ? "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                                            : "rounded-md px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                                    }
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {/* Description */}
                <div className={visibleDescriptionTab === "description" ? "border rounded shadow-sm p-4" : "hidden"}>
                    {
                        basePath == '/product/my-shop' ? (
                            <h2 className="ext-md font-medium text-blue-700 mb-4 border-b pb-2"> Description (User)</h2>
                        ) : (
                            <h2 className="ext-md font-medium text-blue-700 mb-4 border-b pb-2"> Description (PB)</h2>
                        )
                    }

                    {/* <h2 className="text-md font-medium text-blue-700 mb-4 border-b pb-2">Description (User)</h2> */}

                    <div className="text-sm font-small space-y-2 leading-normal">
                        {
                            basePath == '/product/my-shop' ? (
                                <p className="">{productDetails?.v_user_description}</p>
                            ) : (
                                <p className="">{productDetails?.v_description}</p>
                            )
                        }
                    </div>
                </div>


                {
                    basePath == '/product' && (
                        <>
                            {/* SEO Description */}
                            <div className={visibleDescriptionTab === "special" ? "border rounded-lg shadow-sm p-4 border-blue-200" : "hidden"}>
                                <h2 className="text-md font-medium text-blue-700 mb-4 border-b pb-2">Special Description (PB)</h2>

                                <div className="text-sm font-small space-y-2 leading-normal">
                                    {/* <p className="">{productDetails?.v_metadata?.vm_description}</p> */}
                                    <div className="font-bold">আমাদের সার্ভিস সমূহঃ</div>
                                    <p>
                                        ৫০%-৬০% দ্রুত ব্যাংক লোনের সুবিধা। ব্যবহৃত গাড়ি এনালাইসিস সেন্টারে চেক করার সুবিধা।
                                        রিকন্ডিশন গাড়ি অকশন সিট ভেরিফাই ও ট্রান্সলেট এর সুবিধা। সবচেয়ে দ্রুত বিআরটিএ নিবন্ধন/মালিকানা পরিবর্তনের।
                                        লাইফটাইম যে কোনো সার্ভিসিং সবচেয়ে কম দামে করে দেওয়া। জাপান অকশন থেকে পছন্দ করে গাড়ি ক্রয়ের সুযোগ।
                                        গাড়ি ক্রয়ের সঠিক পরামর্শ এবং তথ্য প্রদান।
                                    </p>

                                    <div className="mt-4 font-bold">Social Media:</div>

                                    <p>
                                        Fb Page Click4Details Automobiles : https://rb.gy/f7srjcFb Page Click4Details : https://rb.gy/psidwuFb
                                        Group : https://rb.gy/elefyfYoutube: https ://rb.gy/k1abln Fb Shop : https://rb.gy/nlo9xyInstagram : pilot_bazar
                                        \To Experience This Vehicle Please Visit Our Showroom: \ Click4Details Automobiles Please Visit
                                        Website: https://click4details.com/ 1/A, Road: 138, Lake Side, Gulshan-1, Dhaka-1212. Google Maps
                                        find us by : Click4Details Ltd. We Are Open Every Day (10:00 AM to 10:00 PM)
                                    </p>

                                    <div className="mt-4 font-bold">𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐬𝐨 𝐦𝐮𝐜𝐡</div>
                                </div>
                            </div>

                            {/* Warranty */}
                            <div className={visibleDescriptionTab === "warranty" ? "border rounded shadow-sm p-4" : "hidden"}>
                                <h2 className="text-md font-medium text-blue-700 mb-4 border-b pb-2">Warranty </h2>

                                <div className="text-sm font-small space-y-2 leading-normal">
                                    <div className="font-bold">আমাদের সার্ভিস সমূহঃ</div>
                                    <p>
                                        ৫০%-৬০% দ্রুত ব্যাংক লোনের সুবিধা। ব্যবহৃত গাড়ি এনালাইসিস সেন্টারে চেক করার সুবিধা।
                                        রিকন্ডিশন গাড়ি অকশন সিট ভেরিফাই ও ট্রান্সলেট এর সুবিধা। সবচেয়ে দ্রুত বিআরটিএ নিবন্ধন/মালিকানা পরিবর্তনের।
                                        লাইফটাইম যে কোনো সার্ভিসিং সবচেয়ে কম দামে করে দেওয়া। জাপান অকশন থেকে পছন্দ করে গাড়ি ক্রয়ের সুযোগ।
                                        গাড়ি ক্রয়ের সঠিক পরামর্শ এবং তথ্য প্রদান।
                                    </p>

                                    <div className="mt-4 font-bold">Social Media:</div>

                                    <p>
                                        Fb Page Click4Details : https://rb.gy/f7srjcFb Page Click4Details : https://rb.gy/psidwuFb
                                        Group : https://rb.gy/elefyfYoutube: https ://rb.gy/k1abln Fb Shop : https://rb.gy/nlo9xyInstagram : pilot_bazar
                                        \To Experience This Vehicle Please Visit Our Showroom: \ Click4Details Automobiles Please Visit
                                        Website: https://click4details.com/ 1/A, Road: 138, Lake Side, Gulshan-1, Dhaka-1212. Google Maps
                                        find us by : Clcick4Details Ltd. We Are Open Every Day (10:00 AM to 10:00 PM)
                                    </p>

                                    <div className="mt-4 font-bold">𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐬𝐨 𝐦𝐮𝐜𝐡</div>
                                </div>

                            </div>
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default ProductDetailsDescription
