'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Play, Youtube } from 'lucide-react';

const HowToUse = () => {
    const getYouTubeVideoId = (url) => {
        if (!url) return '';
        const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/);
        return match ? match[1] : '';
    };

    const [selectedVideo, setSelectedVideo] = useState(null);

    const tutorialSections = [
        {
            title: 'Hot Topic',
            items: [
                { title: 'এক ক্লিকের ম্যাজিক', href: 'https://youtu.be/N80vNsXT5R4' },
                { title: '১ ক্লিকের ম্যাজিক! | শোরুম ম্যানেজমেন্ট ১ ক্লিকে', href: 'https://youtu.be/0MEBcdKJ8-E' },
                { title: 'ইনভেস্টমেন্ট ছাড়া ব্যবসা ! দারুন ব্যাপার', href: 'https://www.youtube.com/shorts/UofsXIjvjkc' },
                { title: 'সরাসরি Importer থেকে গাড়ি কিনুন', href: 'https://youtu.be/KZmZ6vyn5ww' },
                { title: 'দ্রুত বিক্রি করতে চান? ফিক্সড এবং সঠিক প্রাইসিং কেন গুরুত্বপূর্ণ তা জানুন', href: 'https://www.youtube.com/shorts/-ixjjdM7_Js' },
                { title: 'দ্রুত এবং সহজে প্রোডাক্ট কিভাবে Share করবেন', href: 'https://www.youtube.com/shorts/3K88q9Mqfls' },
                { title: 'পার্টনার হলে কি কি সুবিধা পাবেন', href: 'https://www.youtube.com/shorts/cKZ0ggw1V-A' },
                { title: 'কিভাবে প্রোডাক্ট স্টক পেজ থেকে My Shop এ কপি করে বিক্রি বৃদ্ধি করব ?', href: 'https://youtube.com/shorts/2EfnkonVi9Q' },
            ],
        },
        {
            title: 'Manager ও Accounts',
            items: [
                { title: 'গাড়ী Purchase এর হিসাব রাখার নিয়ম', href: 'https://youtu.be/6YGR8r2VnOA' },
                { title: 'সেল / মানি রিসিট তৈরি করার নিয়ম', href: 'https://youtube.com/shorts/OWCQWDbV-pg' },
                { title: 'গাড়ির প্রফেশনাল Quotation তৈরি করার নিয়ম', href: 'https://youtube.com/shorts/nXc50JJn6A4' },
                { title: 'গাড়ির ডেলিভারি Challan তৈরি করার নিয়ম', href: 'https://youtube.com/shorts/5nq4Y_p1B4Q' },
                { title: 'প্রফেশনাল Bank Docs তৈরি করার নিয়ম', href: 'https://youtube.com/shorts/tGRXaXnAG_Q' },
                { title: 'মুহুর্তেই Quotation, Delivery Challan এবং Money Receipt তৈরি করুন', href: 'https://youtu.be/gj1hbbyl7k8' },
                { title: 'গাড়ির Stock List তৈরি ও শেয়ার করার নিয়ম', href: 'https://youtu.be/eX20X3EaDZo' },
                { title: 'প্রোডাক্ট বা গাড়ীর Details এডিট করার নিয়ম', href: 'https://youtube.com/shorts/KBoGkZiZqTM' },
            ],
        },
        {
            title: 'Shop Management',
            items: [
                { title: 'কিভাবে একাধিক Shop কিভাবে তৈরী করব', href: 'https://www.youtube.com/shorts/DB-o7WcPVw8' },
                { title: 'Click4Details অ্যাপে টিম মেম্বারদের রোল ও পারমিশন সেট করার সহজ নিয়ম', href: 'https://www.youtube.com/shorts/w1-SRuPwERo' },
            ],
        },
        {
            title: 'Edit and Update',
            items: [
                { title: 'প্রোডাক্ট Edit করার নিয়ম | Click4Details', href: 'https://www.youtube.com/shorts/-jPRlWFbll0' },
                { title: 'প্রোডাক্টের দাম বা Price আপডেট করার নিয়ম', href: 'https://www.youtube.com/shorts/0ndMhvB12X4' },
                { title: 'Sold, Booked, Available আপডেট করব কিভাবে', href: 'https://www.youtube.com/shorts/vhme9eAsuWw' },
                { title: 'প্রোডাক্টের Outlet পরিবর্তন করার নিয়ম', href: 'https://www.youtube.com/shorts/_COOEFpEfL8' },
                { title: 'প্রোডাক্ট Delete করার নিয়ম', href: 'https://www.youtube.com/shorts/fzhKg6Zt23U' },
                { title: 'প্রোডাক্টের Location আপডেট করার নিয়ম', href: 'https://youtube.com/shorts/PC-uGwNNG2c' },
                { title: 'Product Image ও তথ্য ডাউনলোড করার নিয়ম', href: 'https://youtube.com/shorts/UTiahfY9qf4' },
                { title: 'Company Shop এ Share Option ব্যবহার করার নিয়ম', href: 'https://youtube.com/shorts/ne5ptPMjs6Q' },
            ],
        },
        {
            title: 'App Account',
            items: [
                { title: 'Password ভূলে গেলে বা কিভাবে পরিবর্তন করব', href: 'https://www.youtube.com/shorts/Yj1pIin4G0Q' },
                { title: 'নতুন অ্যাকাউন্ট কিভাবে খুলব', href: 'https://www.youtube.com/shorts/IwDJoGGFAqs' },
                { title: 'Login করার সহজ নিয়ম | Click4Details', href: 'https://www.youtube.com/shorts/lS8Z7OhqAYI' },
                { title: 'Login, Registration ও Password পরিবর্তনের করুন', href: 'https://www.youtube.com/shorts/NF1I0p3WV_4' },
            ],
        },
    ];

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* <div className="mb-6 flex justify-center">
                        <a
                            href="https://www.youtube.com/watch?v=6YGR8r2VnOA"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Watch tutorial video on YouTube"
                            className="inline-flex items-center gap-3 rounded-full bg-red-600 px-5 py-3 text-white shadow-lg transition hover:scale-105 hover:bg-red-500"
                        >
                            <Youtube className="h-7 w-7" />
                            <span className="text-base font-semibold tracking-wide">How to Use</span>
                        </a>
                    </div> */}
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
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center gap-3 rounded-full bg-blue-100 px-4 py-2 text-blue-700 font-semibold mb-4">
                                <Youtube className="w-5 h-5" />
                                Video Tutorials
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                Click4Details Learning Hub
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                প্রয়োজনের অনুযায়ী দ্রুত ভিডিও দেখে শিখুন—শোরুম, স্টক, Quotation, Account, Shop Management এবং Account Setup সবকিছু এক জায়গায়।
                            </p>
                        </div>

                        <div className="space-y-8">
                            {tutorialSections.map((section) => (
                                <div key={section.title} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-5 py-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                                            <Youtube className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                                    </div>

                                    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                                        {section.items.map((item) => {
                                            const videoId = getYouTubeVideoId(item.href);
                                            const thumbnailUrl = videoId
                                                ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                                                : 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80';

                                            return (
                                                <div
                                                    key={`${section.title}-${item.title}`}
                                                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedVideo({ title: item.title, videoId })}
                                                        className="block w-full text-left"
                                                    >
                                                        <div className="relative overflow-hidden">
                                                            <img
                                                                src={thumbnailUrl}
                                                                alt={item.title}
                                                                className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                                                                loading="lazy"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                                                            <div className="absolute left-4 top-4 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                                                Video
                                                            </div>
                                                            <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg">
                                                                <Play className="ml-1 h-6 w-6 fill-current text-red-600" />
                                                            </div>
                                                        </div>
                                                    </button>

                                                    <div className="flex flex-1 flex-col p-4">
                                                        <p className="text-base font-semibold leading-relaxed text-gray-800 group-hover:text-blue-700">
                                                            {item.title}
                                                        </p>

                                                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 text-sm font-semibold text-blue-700">
                                                            <a
                                                                href={item.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 hover:text-blue-900"
                                                            >
                                                                <span>Watch on YouTube</span>
                                                                <span aria-hidden="true">→</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
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

            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <h3 className="truncate text-base font-bold text-gray-800 sm:text-lg">
                                {selectedVideo.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedVideo(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-xl font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                                aria-label="Close video"
                            >
                                ×
                            </button>
                        </div>

                        <div className="bg-black">
                            <iframe
                                className="aspect-video w-full"
                                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                                title={selectedVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                referrerPolicy="strict-origin-when-cross-origin"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default HowToUse;
