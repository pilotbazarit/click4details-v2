'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Play, CheckCircle, Car, Search, ShoppingCart } from 'lucide-react';

const HowToUse = () => {
    const videoTutorials = [
        {
            id: 1,
            title: "Getting Started with Click4Details",
            description: "Learn how to browse, search, and find your perfect car on our platform",
            videoId: "MOuUaB4h-k4",
            src: "https://www.youtube.com/embed/MOuUaB4h-k4"
        },
        {
            id: 2,
            title: "How to Buy a Car - Complete Guide",
            description: "Step-by-step guide to purchasing your dream car through Click4Details",
            videoId: "7K9Fyhg6_io",
            src: "https://www.youtube.com/embed/7K9Fyhg6_io"
        },
        {
            id: 3,
            title: "Advanced Features Tutorial",
            description: "Explore advanced features and tips to get the most out of Click4Details",
            videoId: "a9Uka5UxOpw",
            src: "https://www.youtube.com/embed/a9Uka5UxOpw"
        },
        {
            id: 4,
            title: "Getting Started with Click4Details",
            description: "Learn how to browse, search, and find your perfect car on our platform",
            videoId: "rqueFRUuUSA",
            src: "https://www.youtube.com/embed/rqueFRUuUSA"
        },
        {
            id: 5,
            title: "How to Buy a Car - Complete Guide",
            description: "Step-by-step guide to purchasing your dream car through Click4Details",
            videoId: "xreFNC-ZKBo",
            src: "https://www.youtube.com/embed/xreFNC-ZKBo"
        },
        {
            id: 6,
            title: "Advanced Features Tutorial",
            description: "Explore advanced features and tips to get the most out of Click4Details",
            videoId: "UofsXIjvjkc",
            src: "https://www.youtube.com/embed/UofsXIjvjkc"
        },
         {
            id: 7,
            title: "Getting Started with Click4Details",
            description: "Learn how to browse, search, and find your perfect car on our platform",
            videoId: "2EfnkonVi9Q",
            src: "https://www.youtube.com/embed/2EfnkonVi9Q"
        },
        // {
        //     id: 8,
        //     title: "How to Buy a Car - Complete Guide",
        //     description: "Step-by-step guide to purchasing your dream car through Click4Details",
        //     videoId: "UofsXIjvjkc",
        //     src: "https://www.youtube.com/embed/UofsXIjvjkc"
        // },
        {
            id: 9,
            title: "Advanced Features Tutorial",
            description: "Explore advanced features and tips to get the most out of Click4Details",
            videoId: "ne5ptPMjs6Q",
            src: "https://www.youtube.com/embed/ne5ptPMjs6Q"
        },
        {
            id: 10,
            title: "Advanced Features Tutorial",
            description: "Explore advanced features and tips to get the most out of Click4Details",
            videoId: "UTiahfY9qf4",
            src: "https://www.youtube.com/embed/UTiahfY9qf4"
        },
        {
            id: 11,
            title: "Advanced Features Tutorial",
            description: "Explore advanced features and tips to get the most out of Click4Details",
            videoId: "oy8KH-aCI6k",
            src: "https://www.youtube.com/embed/oy8KH-aCI6k"
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
                        How to Use Click4Details
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                        Your complete guide to finding and buying your dream car
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
