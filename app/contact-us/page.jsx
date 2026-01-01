'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useForm } from 'react-hook-form';

const ContactUs = () => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm({ mode: "onSubmit" });


    const onSubmit = data => {
        // send to API or reset form here
    };

    return (
        <>
            <Navbar />

            {/* Main Section */}
            <div className="bg-gray-50">
                <div className="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8 py-12">
                    {/* Contact Form Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-8 rounded-2xl shadow-lg">

                        {/* Left Side – Contact Info */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-blue-600">Contact Us</h2>
                            <p className="text-gray-600">
                                We'd love to hear from you! Fill out the form and we’ll get back to you as soon as possible.
                            </p>

                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <strong>📍 Address:</strong>
                                    <p>Plot 1A, Road 138, Gulshan 1, Dhaka, Bangladesh</p>
                                </div>
                                <div>
                                    <strong>📞 Phone:</strong>
                                    <p>+8801969944400</p>
                                </div>
                                <div>
                                    <strong>✉️ Email:</strong>
                                    <p>click4details.importer@gmail.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side – Contact Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    {...register("name", { required: "Name is required" })}
                                    type="text"
                                    className="mt-1 block w-full border rounded-xl p-3 shadow-sm focus:ring-blue-500 focus:border-orange-500"
                                    placeholder="Your name"
                                />
                                {errors.name && (
                                    <p role="alert" className="text-red-600 text-sm">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    type="email"
                                    className="mt-1 block w-full border rounded-xl p-3 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="you@example.com"
                                />
                                {errors.email && (
                                    <p role="alert" className="text-red-600 text-sm">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Subject
                                </label>
                                <input
                                    {...register("subject", { required: "Subject is required" })}
                                    type="text"
                                    className="mt-1 block w-full border rounded-xl p-3 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Enter subject"
                                />
                                {errors.subject && (
                                    <p role="alert" className="text-red-600 text-sm">
                                        {errors.subject.message}
                                    </p>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Message
                                </label>
                                <textarea
                                    {...register("message", { required: "Message is required" })}
                                    rows="5"
                                    className="mt-1 block w-full border rounded-xl p-3 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Write your message..."
                                />
                                {errors.message && (
                                    <p role="alert" className="text-red-600 text-sm">
                                        {errors.message.message}
                                    </p>
                                )}
                            </div>

                            

                            {/* Submit */}
                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition duration-300"
                                >
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Google Map Section */}
                    <div className="min-h-[400px] bg-white p-4 rounded-2xl shadow-lg overflow-hidden">
                        <iframe
                            title="Google Map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3870.5230735672085!2d90.4158914384046!3d23.77772101270631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7ccce4f35ed%3A0xbfbc34ce3cc83e58!2z4Kaq4Ka-4KaH4Kay4KafIOCmrOCmvuCmnOCmvuCmsCDgpo_gprLgpp_gpr_gpqHgpr8u!5e0!3m2!1sbn!2sbd!4v1744176359244!5m2!1sbn!2sbd"
                            width="100%"
                            height="600"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-[600px] rounded-xl"
                        ></iframe>
                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
};

export default ContactUs;
