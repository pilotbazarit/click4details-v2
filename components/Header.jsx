'use client'
import React, { useEffect, useState } from 'react';
import { usePathname } from "next/navigation";

const Header = () => {
    const [user, setUser] = useState();

    const pathname = usePathname();

    // console.log("Path Name::::", pathname);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        const userInfo = userData && JSON.parse(userData);
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);
    
    return (
        <div>
            <div className="flex items-center gap-2 justify-center py-2 lg:py-3 md:px-16 lg:px-32 border-b border-gray-300 text-gray-700 bg-gray-800">
                {/* {
                    !user && (
                        <h1 className='text-xl lg:text-4xl font-large font-bold text-white tracking-wider'>Pilot Bazar</h1>
                    )
                } */}
                
                {/* <h1 className="text-xl lg:text-4xl font-large font-bold text-white tracking-wider animate-ring">
                    📞 Hotline:&nbsp;
                    {
                        user ? (
                            <a href={`tel:${user?.phone}`} className="hover:text-blue-300 transition-colors">{user?.phone}</a>
                        ) : (
                            <a href="tel:+8801969944400" className="hover:text-blue-300 transition-colors">+8801969944400</a>
                        )
                    }
                </h1> */}


                <h1 className="text-xl lg:text-4xl font-large font-bold text-white tracking-wider animate-ring">
                    📞 Hotline:&nbsp;
                    {
                        user && pathname !== '/pb-home/' ? (
                            <a href={`tel:+880${user?.phone}`} className="hover:text-blue-300 transition-colors">+880{user?.phone}</a>
                        ) : (
                            <a href="tel:+8801969944400" className="hover:text-blue-300 transition-colors">+8801969944400</a>
                        )
                    }
                </h1>


                 
                {/* <h1 className="text-xl lg:text-4xl font-large font-bold text-white tracking-wider animate-pulse-glow">
                    Hotline:&nbsp;
                    {
                        user ? (
                            <a href={`tel:${user?.phone}`} className="hover:text-blue-300 transition-colors">{user?.phone}</a>
                        ) : (
                            <a href="tel:+8801969944400" className="hover:text-blue-300 transition-colors">+8801969944400</a>
                        )
                    }
                </h1> */}


                <style jsx>{`
                    @keyframes ring {
                        0% {
                            transform: rotate(0deg);
                        }
                        5% {
                            transform: rotate(10deg);
                        }
                        10% {
                            transform: rotate(-10deg);
                        }
                        15% {
                            transform: rotate(8deg);
                        }
                        20% {
                            transform: rotate(-8deg);
                        }
                        25% {
                            transform: rotate(5deg);
                        }
                        30% {
                            transform: rotate(-5deg);
                        }
                        35% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(0deg);
                        }
                    }
                    .animate-ring {
                        display: inline-block;
                        transform-origin: center;
                        animation: ring 5s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </div>
    )
}

export default Header
