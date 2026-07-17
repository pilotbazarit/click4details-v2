import React from 'react'
// import { usePathname } from "next/navigation";

const GeneralProductDetailsDescription = ({ productDetails, basePath }) => {
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
                {/* Description */}
                <div className="border rounded shadow-sm p-4 mt-4">
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
                                <p className="">{productDetails?.p_description?.user}</p>
                            ) : (
                                <p className="">{productDetails?.p_description?.pbl}</p>
                            )
                        }
                    </div>
                </div>


                {/* Description */}
                <div className="border rounded shadow-sm p-4 mt-4">
                    {
                        basePath == '/product/my-shop' ? (
                            <h2 className="ext-md font-medium text-blue-700 mb-4 border-b pb-2"> Description (User)</h2>
                        ) : (
                            <h2 className="ext-md font-medium text-blue-700 mb-4 border-b pb-2">Special Description</h2>
                        )
                    }

                    {/* <h2 className="text-md font-medium text-blue-700 mb-4 border-b pb-2">Description (User)</h2> */}

                    <div className="text-sm font-small space-y-2 leading-normal">
                        {
                            basePath == '/product/my-shop' ? (
                                <p className="">{productDetails?.p_description?.user}</p>
                            ) : (
                                <p className="">{productDetails?.p_description?.meta}</p>
                            )
                        }
                    </div>
                </div>


                {
                    basePath == '/product' && (
                        <>
                            {/* SEO Description */}
                            <div className="border rounded shadow-sm p-4">
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
                                        Fb Page click4details : https://rb.gy/f7srjcFb Page Click4Details : https://rb.gy/psidwuFb
                                        Group : https://rb.gy/elefyfYoutube: https ://rb.gy/k1abln Fb Shop : https://rb.gy/nlo9xyInstagram : click4details
                                        \To Experience This Vehicle Please Visit Our Showroom: \ Click4Details Automobiles Please Visit
                                        Website: https://click4details.com/ 1/A, Road: 138, Lake Side, Gulshan-1, Dhaka-1212. Google Maps
                                        find us by : Click4Details Ltd. We Are Open Every Day (10:00 AM to 10:00 PM)
                                    </p>

                                    <div className="mt-4 font-bold">𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐬𝐨 𝐦𝐮𝐜𝐡</div>
                                </div>
                            </div>

                            {/* Warranty */}
                            <div className="border rounded shadow-sm p-4">
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
                                        Group : https://rb.gy/elefyfYoutube: https ://rb.gy/k1abln Fb Shop : https://rb.gy/nlo9xyInstagram : click4details
                                        \To Experience This Vehicle Please Visit Our Showroom: \ Click4Details Automobiles Please Visit
                                        Website: https://click4details.com/ 1/A, Road: 138, Lake Side, Gulshan-1, Dhaka-1212. Google Maps
                                        find us by : Click4Details Ltd. We Are Open Every Day (10:00 AM to 10:00 PM)
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

export default GeneralProductDetailsDescription;
