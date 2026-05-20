'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

const AboutUs = () => {
    // PDF ফাইল ওপেন করার ফাংশন
    const openPDF = () => {
        // আপনার PDF ফাইলের পাথ দিন
        window.open('/chairman-bio.pdf', '_blank');
    };

    return (
        <>
            <Navbar />

            {/* Main Section */}
            <div className="bg-gray-50">
                <div className="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8 py-12">

                    {/* Contact Form Section */}
                    <div className="grid grid-cols-1 gap-10 bg-white p-8 rounded-2xl shadow-lg">
                        <div className="flex flex-col items-center justify-center md:px-10 pt-8 relative">






                            <h1 className="text-3xl md:text-4xl font-extrabold z-10 tracking-tight flex items-center gap-3" style={{ color: "#116fa5" }}>
                                <span className="inline-block text-orange-600">
                                    {/* <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg> */}
                                </span>
                                About Us
                            </h1>
                            <div className="w-36 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mt-3 z-10"></div>

                            <div className='mt-4 text-gray-600 text-xl text-center'>
                                <p>Thiw Website is Bangladesh's trustworthy, quality-controlled, monitored online marketplace and multipurpose business web and app. It is also a totally free social platform on which people can interact with each other. In addition to business support, this app provides various free social services. Besides Click4details sells and buys cars, apartments and land.</p>
                            </div>

                            {/* Vieo Section */}
                            <div className="w-full border rounded shadow-sm p-4 mt-8">
                                <div className="w-full aspect-video">
                                    <iframe
                                        className="w-full h-full rounded"
                                        src="https://www.youtube.com/embed/_eOsa9E7ATE?si=V_PslnciJCcb2qpY"
                                        title="YouTube video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>


                            
                            {/* Chairman Section */}
                            <div className="w-full mt-16">
                                {/* <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: "#116fa5" }}>
                                    Our Chairman
                                </h2>
                                 */}
                                <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-blue-50 to-orange-50 p-8 rounded-2xl">
                                    {/* Chairman Image */}
                                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl">
                                            <Image
                                                src="/sir.jpeg" // আপনার চেয়ারম্যানের ইমেজ পাথ দিন
                                                alt="Chairman"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Chairman Info */}
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                                            Pilot Kabir (Ahsanul Kabir)
                                        </h3>
                                        <p className="text-xl text-orange-600 font-semibold mb-4">
                                            Chairman, Click4Details 
                                        </p>
                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                           সিলেট ক্যাডেট কলেজ থেকে পাস করে পাইলট কবির ১৯৯৮ সালে বাংলাদেশ বিমান বাহিনীতে যোগদান করেন। তিনি একজন ফাইটার পাইলট এবং ফ্লাইং ইনস্ট্রাক্টর ছিলেন। তিনি বিমান বাহিনী এবং জাতিসংঘের মিশনে বিভিন্ন গুরুত্বপূর্ণ পদে কর্মরত ছিলেন। পরবর্তীতে তিনি রিজেন্ট এয়ারওয়েজে পাইলট হিসেবে কাজ করেন। বর্তমানে তিনি পাইলট বাজার গ্রুপের চেয়ারম্যান।
                                        </p>
                                        
                                        {/* Bio Button */}
                                        <button
                                            onClick={openPDF}
                                            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                        >
                                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                                            <svg 
                                                className="w-5 h-5" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                                />
                                            </svg>
                                            See Chairman's Bio
                                            <svg 
                                                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>


                         
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
};

export default AboutUs;