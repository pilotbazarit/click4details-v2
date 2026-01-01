'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AboutUs = () => {
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

                            <div className='mt-4 text-gray-600 text-xl'>
                                <p>Click4Details Ltd is Bangladesh's trustworthy, quality-controlled, monitored online marketplace and multipurpose business web and app. It is also a totally free social platform on which people can interact with each other. In addition to business support, this app provides various free social services. Besides Click4Details Ltd sells and buys cars, apartments and land.</p>
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


                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
};

export default AboutUs;
