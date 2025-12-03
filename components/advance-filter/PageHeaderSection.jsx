import React from "react";
import { useAdvanceFilterProductContext } from "@/context/AdvanceFilterProductContextProvider";

const PageHeaderSection = () => {
    const { total } = useAdvanceFilterProductContext();

    return (
        <>
            <div className="flex flex-col items-center justify-center md:px-10 pt-8 relative">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="w-40 h-40 bg-orange-100 rounded-full blur-2xl opacity-60 absolute -top-10 -left-10"></div>
                    <div className="w-32 h-32 bg-orange-200 rounded-full blur-2xl opacity-40 absolute top-10 right-0"></div>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold z-10 tracking-tight flex items-center gap-3" style={{ color: "#116fa5" }}>
                    <span className="inline-block text-orange-600">
                        <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                    </span>
                    Filter Products
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mt-3 z-10"></div>
                <p className="mt-4 text-gray-600 text-center max-w-2xl z-10">
                    {total > 0 ? `${total} products found` : ""}
                </p>
            </div>
        </>
    );
}
export default PageHeaderSection;

