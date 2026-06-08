'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Play, CheckCircle, Car, Search, ShoppingCart } from 'lucide-react';

const HowToUse = () => {
    const videoTutorials = [
         {
            id: 21,
            title: "১ ক্লিকের ম্যাজিক! | শোরুম ম্যানেজমেন্ট ১ ক্লিকে | Click4Details",
            description: "Click4Details-এ এক ক্লিকে শোরুম ম্যানেজমেন্টের সুবিধাগুলো জানুন। প্রোডাক্ট, শপ, টিম এবং দৈনন্দিন কাজ দ্রুত ও সহজভাবে পরিচালনা করুন।",
            videoId: "0MEBcdKJ8-E",
            src: "https://www.youtube.com/embed/0MEBcdKJ8-E"
        },
        {
            id: 22,
            title: "Click4Details অ্যাপ কী এবং কেন ব্যবহার করবেন?",
            description: "Click4Details অ্যাপের মূল সুবিধা, ব্যবহারযোগ্যতা এবং ব্যবসা পরিচালনায় এর প্রয়োজনীয়তা সম্পর্কে জানুন। গাড়ি ও শোরুম ম্যানেজমেন্ট সহজ করতে কেন এটি ব্যবহার করবেন তা দেখুন।",
            videoId: "7K9Fyhg6_io",
            src: "https://www.youtube.com/embed/7K9Fyhg6_io"
        },
        {
            id: 1,
            title: "লগইন, রেজিস্ট্রেশন ও পাসওয়ার্ড পরিবর্তনের করুন | Click4Details",
            description: "Click4Details-এ লগইন, রেজিস্ট্রেশন এবং পাসওয়ার্ড পরিবর্তনের সম্পূর্ণ গাইড। আপনার অ্যাকাউন্ট নিরাপদ রাখুন এবং সহজেই পরিচালনা করুন।",
            videoId: "NF1I0p3WV_4",
            src: "https://www.youtube.com/embed/NF1I0p3WV_4"
        },
        {
            id: 2,
            title: "দ্রুত বিক্রি করতে চান? ফিক্সড এবং সঠিক প্রাইসিং কেন গুরুত্বপূর্ণ তা জানুন | Click4Details",
            description: "Click4Details-এ দ্রুত বিক্রি করতে ফিক্সড এবং সঠিক প্রাইসিং কেন গুরুত্বপূর্ণ তা জানুন। আপনার গাড়ির সঠিক মূল্য নির্ধারণ করে বিক্রয় প্রক্রিয়া সহজ করুন এবং দ্রুত বিক",
            videoId: "-ixjjdM7_Js",
            src: "https://www.youtube.com/embed/-ixjjdM7_Js"
        },
        {
            id: 3,
            title: "পার্টনার হলে কি কি সুবিধা পাবেন | Click4Details ",
            description: "Click4Details-এ পার্টনার হলে কি কি সুবিধা পাবেন তা জানুন। আপনার ব্যবসা বৃদ্ধির জন্য সহজ এবং কার্যকর সমাধানগুলি পেতে পারেন।",
            videoId: "cKZ0ggw1V-A",
            src: "https://www.youtube.com/embed/cKZ0ggw1V-A"
        },
        {
            id: 4,
            title: "প্রোডাক্টের দাম বা প্রাইস আপডেট করার নিয়ম | Click4Details",
            description: "Click4Details-এ প্রোডাক্টের দাম বা প্রাইস আপডেট করার নিয়ম জানুন। আপনার পণ্যের মূল্য সঠিকভাবে নির্ধারণ করে বিক্রয় প্রক্রিয়া সহজ করুন।",
            videoId: "XIT-qGd_AiA",
            src: "https://www.youtube.com/embed/XIT-qGd_AiA"
        },
        {
            id: 5,
            title: "প্রোডাক্টের তথ্য এডিট করার  নিয়ম | Click4Details",
            description: "Click4Details-এ প্রোডাক্টের তথ্য এডিট করার নিয়ম জানুন। আপনার পণ্যের তথ্য সঠিকভাবে নির্ধারণ করে বিক্রয় প্রক্রিয়া সহজ করুন।",
            videoId: "-jPRlWFbll0",
            src: "https://www.youtube.com/embed/-jPRlWFbll0"
        },
        {
            id: 6,
            title: "দ্রুত এবং সহজে প্রোডাক্ট কিভাবে শেয়ার করবেন | Click4Details",
            description: "Click4Details-এ দ্রুত এবং সহজে প্রোডাক্ট শেয়ার করার নিয়ম জানুন।",
            videoId: "3K88q9Mqfls",
            src: "https://www.youtube.com/embed/3K88q9Mqfls"
        },
         {
            id: 7,
            title: "Sold, Booked, Available আপডেট করব কিভাবে | Click4Details",
            description: "Sold, Booked, Available আপডেট করার নিয়ম জানুন। আপনার প্রোডাক্টের স্ট্যাটাস সঠিকভাবে নির্ধারণ করে বিক্রয় প্রক্রিয়া সহজ করুন।",
            videoId: "vhme9eAsuWw",
            src: "https://www.youtube.com/embed/vhme9eAsuWw"
        },
        {
            id: 8,
            title: "প্রোডাক্টের দাম বা প্রাইস আপডেট করার নিয়ম  | Click4Details",
            description: "Click4Details-এ প্রোডাক্টের দাম বা প্রাইস আপডেট করার নিয়ম জানুন।",
            videoId: "0ndMhvB12X4",
            src: "https://www.youtube.com/embed/0ndMhvB12X4"
        },
        {
            id: 9,
            title: "প্রোডাক্টের আউটলেট পরিবর্তন করার নিয়ম | Click4Details",
            description: "Click4Details-এ প্রোডাক্টের আউটলেট পরিবর্তন করার নিয়ম জানুন।",
            videoId: "_COOEFpEfL8",
            src: "https://www.youtube.com/embed/_COOEFpEfL8"
        },
        {
            id: 10,
            title: "প্রোডাক্ট ডিলিট করার নিয়ম | Click4Details ",
            description: "Click4Details-এ প্রোডাক্ট ডিলিট করার নিয়ম জানুন। আপনার পণ্যের তথ্য সঠিকভাবে নির্ধারণ করে বিক্রয় প্রক্রিয়া সহজ করুন।",
            videoId: "fzhKg6Zt23U",
            src: "https://www.youtube.com/embed/fzhKg6Zt23U"
        },
        {
            id: 11,
            title: "প্রোডাক্ট এডিট করার নিয়ম | Click4Details",
            description: "Click4Details-এ প্রোডাক্ট এডিট করার নিয়ম জানুন।",
            videoId: "-jPRlWFbll0",
            src: "https://www.youtube.com/embed/-jPRlWFbll0"
        },

        {
            id: 12,
            title: "গাড়ির প্রফেশনাল Quotation তৈরি করার নিয়ম | Click4Details",
            description: "Click4Details-এ গাড়ির জন্য প্রফেশনাল Quotation তৈরি করার সহজ নিয়ম জানুন। গ্রাহকের কাছে দাম, তথ্য এবং প্রয়োজনীয় বিস্তারিত সুন্দরভাবে উপস্থাপন করুন।",
            videoId: "nXc50JJn6A4",
            src: "https://www.youtube.com/embed/nXc50JJn6A4"
        },
        {
            id: 13,
            title: "গাড়ির ডেলিভারি Challan তৈরি করার নিয়ম | Click4Details",
            description: "Click4Details-এ গাড়ির ডেলিভারি Challan তৈরি করার নিয়ম জানুন। ডেলিভারির সময় প্রয়োজনীয় তথ্য যোগ করে পেশাদারভাবে রেকর্ড সংরক্ষণ করুন।",
            videoId: "5nq4Y_p1B4Q",
            src: "https://www.youtube.com/embed/5nq4Y_p1B4Q"
        },
        {
            id: 14,
            title: "একাধিক শপ কিভাবে তৈরী করব | Click4Details",
            description: "Click4Details-এ একাধিক শপ তৈরি করার ধাপগুলো জানুন। আপনার ব্যবসার বিভিন্ন শাখা বা আউটলেট সহজে আলাদা করে পরিচালনা করুন।",
            videoId: "DB-o7WcPVw8",
            src: "https://www.youtube.com/embed/DB-o7WcPVw8"
        },
        {
            id: 15,
            title: "সেলসমেন ও ম্যানেজার কোম্পানি শপে অ্যাড করব কিভাবে | Click4Details",
            description: "Click4Details-এ কোম্পানি শপে সেলসমেন ও ম্যানেজার অ্যাড করার নিয়ম জানুন। টিম মেম্বারদের দায়িত্ব ভাগ করে শপ পরিচালনা সহজ করুন।",
            videoId: "w1-SRuPwERo",
            src: "https://www.youtube.com/embed/w1-SRuPwERo"
        },
        {
            id: 16,
            title: "কিভাবে দ্রুত এবং সহজে প্রোডাক্ট শেয়ার করবেন | Click4Details",
            description: "Click4Details-এ দ্রুত এবং সহজে প্রোডাক্ট শেয়ার করার নিয়ম জানুন। গ্রাহক বা সোশ্যাল প্ল্যাটফর্মে পণ্যের তথ্য সহজে পৌঁছে দিন।",
            videoId: "3K88q9Mqfls",
            src: "https://www.youtube.com/embed/3K88q9Mqfls"
        },
        {
            id: 17,
            title: "পাসওয়ার্ড ভূলে গেলে বা কিভাবে পরিবর্তন করব | Click4Details",
            description: "Click4Details-এ পাসওয়ার্ড ভুলে গেলে কীভাবে পুনরুদ্ধার করবেন এবং প্রয়োজন হলে নতুন পাসওয়ার্ড সেট করবেন তা জানুন।",
            videoId: "Yj1pIin4G0Q",
            src: "https://www.youtube.com/embed/Yj1pIin4G0Q"
        },
        {
            id: 18,
            title: "নতুন অ্যাকাউন্ট কিভাবে খুলব | Click4Details",
            description: "Click4Details-এ নতুন অ্যাকাউন্ট খোলার সহজ ধাপগুলো জানুন। প্রয়োজনীয় তথ্য দিয়ে দ্রুত রেজিস্ট্রেশন সম্পন্ন করুন।",
            videoId: "IwDJoGGFAqs",
            src: "https://www.youtube.com/embed/IwDJoGGFAqs"
        },
        {
            id: 19,
            title: "লগইন করার সহজ নিয়ম | Click4Details",
            description: "Click4Details-এ লগইন করার সহজ নিয়ম জানুন। আপনার অ্যাকাউন্টে নিরাপদে প্রবেশ করে প্রয়োজনীয় ফিচার ব্যবহার করুন।",
            videoId: "lS8Z7OhqAYI",
            src: "https://www.youtube.com/embed/lS8Z7OhqAYI"
        },
        {
            id: 20,
            title: "গাড়ির আমদানী খরচ ও দাম হিসাব করার নিয়ম | Click4Details",
            description: "Click4Details-এ গাড়ির আমদানী খরচ ও বিক্রয় মূল্য হিসাব করার নিয়ম জানুন। খরচ, চার্জ এবং প্রাইসিং পরিষ্কারভাবে নির্ধারণ করে ব্যবসার সিদ্ধান্ত সহজ করুন।",
            videoId: "0U_dOU235IU",
            src: "https://www.youtube.com/embed/0U_dOU235IU"
        }
    ];

    const steps = [
        {
            icon: <Search className="w-10 h-10 text-blue-600" />,
            title: "Search for Your Car",
            description: "Browse through thousands of verified car listings with detailed specifications"
        },
        {
            icon: <Car className="w-10 h-10 text-blue-600" />,
            title: "View Details",
            description: "Check high-quality images, specifications, and pricing information"
        },
        {
            icon: <CheckCircle className="w-10 h-10 text-blue-600" />,
            title: "Contact Seller",
            description: "Connect directly with verified sellers and schedule inspections"
        },
        {
            icon: <ShoppingCart className="w-10 h-10 text-blue-600" />,
            title: "Complete Purchase",
            description: "Finalize your purchase with secure payment options and documentation"
        }
    ];

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Click4Details ব্যবহার করার পদ্ধতি
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                        যেকোনো অসুবিধায় আমাদেরকে কল দিন: +8809638660077
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

                    {/* Step by Step Guide */}
                    {/* <section>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                Simple Steps to Get Started
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Follow these easy steps to find and purchase your perfect car
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-full">
                                            {step.icon}
                                        </div>
                                        <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                            {index + 1}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section> */}

                    {/* Video Tutorials Section */}
                    <section>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                Video Tutorials
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Watch our comprehensive video guides to master the platform
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {videoTutorials.map((video) => (
                                <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                    <div className="relative aspect-video bg-gray-900">
                                        <iframe
                                            className="w-full h-full border-0"
                                            src={`${video.src}?rel=0&modestbranding=1`}
                                            title={video.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                        ></iframe>
                                    </div>
                                    <div className="px-4 py-3">
                                        <div className="flex items-start gap-2">
                                            <Play className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                            <h3 className="text-sm sm:text-base font-semibold text-gray-800 leading-snug">
                                                {video.title}
                                            </h3>
                                        </div>
                                    </div>
                                    {/* <div className="p-6">
                                        <div className="flex items-start space-x-3 mb-3">
                                            <Play className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {video.title}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600">
                                            {video.description}
                                        </p>
                                    </div> */}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ or Additional Tips Section */}
                    {/* <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            Quick Tips
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Use Advanced Filters</h3>
                                    <p className="text-gray-600">Narrow down your search using price, brand, model, and year filters</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Save Your Favorites</h3>
                                    <p className="text-gray-600">Create an account to save listings and get notified about new cars</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Verify Before Purchase</h3>
                                    <p className="text-gray-600">Always inspect the car in person and verify documents before buying</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Contact Support</h3>
                                    <p className="text-gray-600">Our customer support team is always ready to help you with any questions</p>
                                </div>
                            </div>
                        </div>
                    </section> */}

                    {/* CTA Section */}
                    {/* <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 md:p-12 text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Find Your Dream Car?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Browse thousands of verified listings and connect with trusted sellers
                        </p>
                        <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors duration-300 shadow-lg">
                            Start Browsing Cars
                        </button>
                    </section> */}

                </div>
            </div>

            <Footer />
        </>
    );
};

export default HowToUse;
