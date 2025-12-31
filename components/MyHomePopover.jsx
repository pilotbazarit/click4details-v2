import React from 'react'
import * as Popover from "@radix-ui/react-popover";
import { LayoutDashboard, LogOut, ShoppingCart, User, UserPen } from 'lucide-react';
import LoginService from '@/services/LoginService';
import { useAppContext } from '@/context/AppContext';
import { usePathname } from "next/navigation";
import Link from 'next/link';
// import { Cross2Icon } from "@radix-ui/react-icons";

const MyHomePopover = ({ setLogout }) => {
    const { router, user, setUser } = useAppContext();

    const pathname = usePathname();

    const isActiveMyShop = pathname === '/my-shop/' || pathname === '/pb-home';
    const isActiveMemberShop = pathname === '/member-shop/' || pathname === '/member-shop';
    const isActiveCompanyShop = pathname === '/company-shop/' || pathname === '/company-shop';
    const isActiveUserShop = pathname === '/user-shop/' || pathname === '/user-shop';
    const isActiveProfile = pathname === '/profile/' || pathname === '/profile';


    let parsedUser = null;
    try {
        parsedUser = user ? (typeof user === 'string' ? JSON.parse(user) : user) : null;
    } catch (error) {
        console.error("Failed to parse user data:", error);
    }

    // const setLogout = async () => {
    //     try {
    //         await LoginService.Commands.logout();
    //     } catch (error) {
    //         console.error('Logout API error:', error);
    //         console.error('Error details:', {
    //             message: error?.message,
    //             status: error?.response?.status,
    //             data: error?.response?.data,
    //             request: error?.request
    //         });
    //         // Continue with logout even if API call fails
    //     } finally {
    //         // Always clean up local storage and redirect
    //         localStorage.removeItem("user");
    //         localStorage.removeItem("token");
    //         localStorage.removeItem("auth_token");
    //         setUser(null);
    //         router.push("/");
    //     }
    // };


    // console.log("user in popover:", parsedUser?.user_mode);

    return (
        <div>
            <Popover.Root>
                <Popover.Trigger asChild>
                    <button className="flex items-center gap-2 border px-4 py-1.5 rounded-full text-sm hover:bg-gray-100 transition">
                        <User className="h-4 w-4" />
                        <span>
                            {(() => {
                                try {
                                    const parsedUser = JSON.parse(user);
                                    return parsedUser?.name || "Login";
                                } catch {
                                    return "Login";
                                }
                            })()}
                        </span>
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        sideOffset={5}
                        className="rounded bg-white p-4 shadow-lg border border-gray-200 w-48 z-[9999]"
                    >
                        <div className="flex flex-col gap-2">
                            <ul className="flex flex-col text-sm text-gray-700">
                                {/* Top Menu Items */}

                                <li className={`${isActiveProfile ? "border-l-4 md:border-l-[6px] bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-150`}>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 hover:text-gray-900 transition"
                                    >
                                        <UserPen className="h-4 w-4" />
                                        Profile
                                    </Link>
                                </li>

                                <li className={`${isActiveMyShop ? "border-l-4 md:border-l-[6px] bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-150`}>
                                    <Link
                                        href="/my-shop"
                                        className="flex items-center gap-2 hover:text-gray-900 transition"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        My Shop
                                    </Link>
                                </li>

                                <li className={`${isActiveCompanyShop ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                                    <Link
                                        href="/company-shop"
                                        className="flex items-center gap-2 hover:text-gray-900 transition"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Company Shop
                                    </Link>
                                </li>

                                {
                                    (parsedUser?.user_mode === 'supreme' || parsedUser?.user_mode === 'pbl' || parsedUser?.user_mode === 'admin') && (
                                        <>
                                            <li className={`${isActiveMemberShop ? "border-l-4 md:border-l-[6px] bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-150`}>
                                                <Link
                                                    href="/member-shop"
                                                    className="flex items-center gap-2 hover:text-gray-900 transition"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    Member Shop
                                                </Link>
                                            </li>



                                            <li className={`${isActiveUserShop ? "border-l-4 md:border-l-[6px] bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-150`}>
                                                <Link
                                                    href="/user-shop"
                                                    className="flex items-center gap-2 hover:text-gray-900 transition"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    User Shop
                                                </Link>
                                            </li>
                                        </>
                                    )
                                }

                                <li className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-150">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 hover:text-gray-900 transition"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </li>




                                {/* <li className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-150">
                                    <button
                                        className="flex items-center gap-2 hover:text-gray-900 transition"
                                        onClick={() => router.push("/dashboard")}
                                    >
                                        <UserPen className="h-4 w-4" />
                                        Change Password
                                    </button>
                                </li> */}





                                {/* Divider */}
                                <hr className="my-2 border-t border-gray-200 mt-2" />

                                {/* Footer Item */}
                                <li className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors duration-150">

                                    <button
                                        className="flex items-center gap-2 hover:text-gray-900 transition"
                                        onClick={() => setLogout()}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                    {/* <span>Log out</span> */}
                                </li>
                            </ul>

                        </div>
                        <Popover.Arrow className="fill-blue" />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

        </div>
    )
}

export default MyHomePopover