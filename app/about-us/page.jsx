'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Noto_Sans_Bengali } from 'next/font/google';

const notoSansBengali = Noto_Sans_Bengali({
    subsets: ['bengali', 'latin'],
    display: 'swap',
});



const freeBenefits = [
    'প্রোডাক্ট আপলোড',
    'মার্কেটিং',
    'সফটওয়্যার সাপোর্ট',
    'সফটওয়্যার ডেভেলপমেন্ট',
    'সফটওয়্যার মেইনটেনেন্স',
    'হোস্টিং সার্ভিস',
    'ডমিন সার্ভিস',
    'আপনার প্রোডাক্টের ম্যানেজমেন্ট',
    'শপ ম্যানেজমেন্ট',
    'প্রোডাক্টের দেশজুড়ে ডিস্ট্রিবিউশন',
    'বিক্রি বৃদ্ধি',
    'আরও কত কী',
    'সব ফ্রি, সব ফ্রি',
];


/* ─────────────────────────────────────────────
   Shared header component — same color, same
   alignment, same font-size for every section
   ───────────────────────────────────────────── */
const SectionHeader = ({ children, id }) => (
    <div id={id} className="mx-auto mt-20 w-full max-w-4xl scroll-mt-28 text-center">
        {/* <span className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
            {eyebrow}
        </span> */}
        <h2
            className="mt-3 text-2xl font-extrabold leading-tight text-[#116FA5] sm:text-4xl"
        >
            {children}
        </h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-[#116FA5] to-orange-400" />
    </div>
);

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
            <div className={`${notoSansBengali.className} bg-gray-50 text-gray-600`}>

                <div className="max-w-7xl mx-auto space-y-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                    {/* Modern Hero Section */}
                    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B5D8A] via-[#116FA5] to-[#0D3B5B] px-6 py-7 text-center text-white shadow-xl sm:px-6 lg:py-10">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
                        <div className="relative mx-auto max-w-4xl">
                            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                                Click For Details • Smart Automotive Business System
                            </span>
                            <h1 className="mt-6 text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                                আপনার গাড়ির ব্যবসাকে করুন আরও সহজ, স্মার্ট ও দ্রুত
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-blue-50 sm:text-xl">
                                স্টক, কাস্টমার, মার্কেটিং এবং বিক্রির পুরো প্রক্রিয়াকে একটি ডিজিটাল সিস্টেমে পরিচালনা করুন।
                            </p>
                            {/* <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <a href="#solutions" className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-orange-600">
                                    Solutions দেখুন
                                </a>
                                <a href="#video" className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/20">
                                    ভিডিও দেখুন
                                </a>
                            </div> */}
                        </div>
                    </section>

                    {/* Section Navigation */}
                    <nav className="sticky top-0 z-20 rounded-2xl border border-slate-200 bg-white/90 px-3 py-3 shadow-sm backdrop-blur">
                        <div className="flex gap-2 overflow-x-auto whitespace-nowrap text-sm font-semibold text-slate-600">
                            <a href="#intro" className="rounded-full px-4 py-2 transition hover:bg-blue-50 hover:text-[#116FA5]">ভূমিকা</a>
                            <a href="#solutions" className="rounded-full px-4 py-2 transition hover:bg-blue-50 hover:text-[#116FA5]">Solutions</a>
                            <a href="#challenges" className="rounded-full px-4 py-2 transition hover:bg-blue-50 hover:text-[#116FA5]">Challenges</a>
                            <a href="#partners" className="rounded-full px-4 py-2 transition hover:bg-blue-50 hover:text-[#116FA5]">Partners</a>
                            <a href="#chairman" className="rounded-full px-4 py-2 transition hover:bg-blue-50 hover:text-[#116FA5]">Chairman</a>
                        </div>
                    </nav>

                    {/* Contact Form Section */}
                    <div className="grid grid-cols-1 gap-10 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] sm:p-8 lg:p-12">
                        <div className="flex flex-col items-start w-full md:px-10 pt-8 relative">


                            {/* Video Section */}
                            <section id="video" className="w-full scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                                <div className="mb-5">
                                    {/* <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">Watch &amp; Learn</p> */}
                                    <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                                        Click For Details কীভাবে কাজ করে
                                    </h2>
                                    <p className="mt-2 text-base leading-7 text-gray-600">
                                        আমাদের ডিজিটাল বিজনেস সিস্টেমের গুরুত্বপূর্ণ সুবিধাগুলো সংক্ষেপে দেখুন।
                                    </p>
                                </div>
                                <div className="w-full aspect-video">
                                    <iframe
                                        className="w-full h-full rounded"
                                        src="https://www.youtube.com/embed/N80vNsXT5R4?si=6XEcge33AkKb2Llp"
                                        title="YouTube video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </section>

                            {/* ─── ভূমিকা ─── */}
                            <SectionHeader id="intro">ভূমিকা</SectionHeader>

                            <div className='w-full mt-4 text-gray-600 text-xl text-start'>
                                <p>
                                    আপনার গাড়ির ব্যবসা কে আপনি যদি এনালগ সিস্টেম থেকে ডিজিটাল সিস্টেমে <br />
                                    আনতে পারেন তাহলে আপনি আপনার গাড়ির ব্যবসাকে করতে পারবেন <br />
                                    আরও সহজ স্মার্ট ও দ্রুত <br />
                                    পারসোনাল টাইম ও রিলাক্স টাইম বৃদ্ধি <br />
                                    আর সে সাথে যদি সহজে ব্যবসা বৃদ্ধি হয় তাহলে তো কথাই নেই । <br />
                                    পাইলট বাজার লিমিটেডের Click For Details এপ নিয়ে আসল সেই সমাধান। এটি <br />
                                    বাংলাদেশের গাড়ি ব্যবসায়ীদের জন্য একটি সম্পূর্ণ ডিজিটাল বিজনেস সিস্টেম।
                                </p>
                            </div>

                            {/* ─── এই সফটয়ারটি কাদের জন্য ─── */}
                            <SectionHeader id="audiences">এই সফটওয়্যারটি কাদের জন্য</SectionHeader>

                            <div className='w-full mt-4 text-gray-600 text-xl text-start'>
                                <p>
                                    ✅ Importer <br />
                                    ✅ Exporter <br />
                                    ✅ Showroom <br />
                                    ✅ Company Sales Team: All Owners, Partner, Manager, Accounts, Sales Person <br />
                                    ✅ Dealer <br />
                                    ✅ Retailer <br />
                                    ✅ Media <br />
                                    ✅ Customer <br />
                                </p>
                            </div>

                            {/* ─── এই সফটয়ারটি নিয়ে আমার লাভ কি? ─── */}
                            <SectionHeader>এই সফটওয়্যারটি নিয়ে আমার লাভ কি?</SectionHeader>

                            <div className='w-full mt-4 text-gray-600 text-xl text-start'>
                                <p>আমরা মুলত দিচ্ছি 4 x Powerful Business Solution</p>

                                <div className='mt-4'>
                                    <b>Solution One: (User &amp; Member)</b>

                                    <ul className='list-disc pl-6 mt-2'>
                                        <li>Software</li>
                                    </ul>
                                </div>

                                <div className='mt-4'>
                                    <b>Solution Two: (Partner)</b>

                                    <ul className='list-disc pl-6 mt-2'>
                                        <li>Software</li>
                                        <li>Marketing Growth Support</li>
                                    </ul>
                                </div>

                                <div className='mt-4'>
                                    <b>Solution Three: (Special Partner)</b>

                                    <ul className='list-disc pl-6 mt-2'>
                                        <li>Software</li>
                                        <li>Marketing Growth Support</li>
                                        <li>Push Sale Support<span className="text-gray-600">*</span></li>
                                    </ul>
                                </div>

                                <div className='mt-4'>
                                    <b>Solution Four: (Dealer, Field Agent, Marketing Team, Sales Team (Partner) )</b>

                                    <ul className='list-disc pl-6 mt-2'>
                                        <li>Software</li>
                                    </ul>
                                </div>
                            </div>

                            {/* ─── Solution One ─── */}
                            <SectionHeader id="solutions">First Challenge</SectionHeader>
                            {/* <SectionHeader id="solutions">Solution One</SectionHeader> */}

                            <div className="w-full mt-4 text-gray-600 text-xl text-start">
                                <h3
                                    className="text-2xl sm:text-3xl font-bold underline underline-offset-4 text-center"
                                    style={{ color: '#116fa5' }}
                                >
                                    Software (User, Member, Partner)
                                </h3>

                                <div className="mt-8 text-gray-600 text-xl sm:text-2xl leading-relaxed">
                                    <p>এই ২০২৬ সালে আপনি কি চান না আপনার</p>

                                    <ul className="mt-6 list-disc space-y-5 pl-8 sm:pl-14">
                                        <li>
                                            <span className="font-bold underline underline-offset-4">
                                                Customer Management:
                                            </span>{" "}
                                            কাস্টমার হ্যান্ডলিং, কোম্পানির মার্কেটিং, গাড়ী বিক্রির প্রসেস,
                                            আপনার গাড়ির তথ্য ছবি পাঠানো থেকে আগের চেয়ে অনেক সহজ?
                                        </li>
                                        <li>
                                            <span className="font-bold underline underline-offset-4">
                                                Stock Management:
                                            </span>{" "}
                                            আপনার গাড়ীর স্টক ম্যানেজমেন্ট, হিসাব নিকাশ আপডেটে রাখা — সবকিছু
                                            হোক আরো সহজ ও ডিজিটাল?
                                        </li>
                                        <li>
                                            <span className="font-bold underline underline-offset-4">
                                                Information Management:
                                            </span>{" "}
                                            আপনার মালিক পক্ষ, স্টাফ, ম্যানেজার, সেলসম্যান সবাই সকল তথ্য সকল আপডেট একসাথে জানুক?
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <SectionHeader id="solutions">Solution One</SectionHeader>

                            <div className="w-full mt-4 text-gray-600 text-xl text-start">
                                <h3
                                    className="text-2xl sm:text-3xl font-bold underline underline-offset-4 text-center"
                                    style={{ color: '#116fa5' }}
                                >
                                    আপনার সমস্যার সহজ সমাধান — Click4Details!
                                </h3>

                                <div className="mt-8 text-gray-600 text-xl sm:text-2xl leading-relaxed">
                                    <p>আপনার প্রয়োজনীয় সমাধান পেতে আজই ব্যবহার করুন আমাদের Click4Details সফটওয়্যার ও অ্যাপ।</p>

                                    <ul className="mt-6 list-disc space-y-5 pl-8 sm:pl-14">
                                        <li>
                                            Click4Details অ্যাপ ও সফটওয়্যার ব্যবহার করুন
                                        </li>
                                        <li>
                                            যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন
                                        </li>

                                        <li>
                                            আপনার সমস্যার সমাধানে আমরা আপনাকে সহযোগিতা করব
                                        </li>
                                        <li>
                                            সবচেয়ে গুরুত্বপূর্ণ বিষয়—Click4Details সফটওয়্যার ও অ্যাপ সম্পূর্ণ বিনামূল্যে!
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* ─── Second Challenge ─── */}
                            <SectionHeader>Second Challenge</SectionHeader>


                            <div className="w-full mt-4 text-gray-600 text-xl text-start">


                                <div className="mt-8 text-gray-600 text-xl sm:text-2xl leading-relaxed">
                                    <p>এই ২০২৬ সালে আপনি কি চান না আপনার</p>

                                    <ul className="mt-6 list-disc space-y-5 pl-8 sm:pl-14">
                                        <li>
                                            আপনি কি চাননা আপনার গাড়ীর মার্কেটিং বাড়ুক?
                                        </li>
                                        <li>
                                            বিক্রির সম্ভাবনা বাড়ুক আগের চেয়ে আরো আরো বেশি ?
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* ─── Our Challenges ─── */}
                            {/* <SectionHeader id="challenges">Our Challenges</SectionHeader> */}

                            <div className='w-full mt-6 text-gray-600 text-xl text-start'>
                                <p>
                                    <span className="font-bold pb-2">Only Exporter, Only Importer, B2B / Whole Seller, Factory Owners Challengesঃ</span> <br />
                                    ✅ ডিলার আছে, কিন্তু সীমিত <br />
                                    ✅ শুধু মাত্র কিছু ডিলারের উপড় নির্ভরশীল থাকতে হচ্ছে।  কিন্তু তারা শুধু আমার গাড়ী বিক্রি করছেনা । তারা কাস্টমারকে অন্য ডিলারের গাড়ীও সাজেস্ট করছে। <br />
                                    ✅ডিলাররা বেশি লাভের আশায় আমার গাড়ী বিক্রি করছেনা <br />
                                    ✅ আমি বি টু সি/ Retail সেল চাই কিন্তু বি টু সির ঝামেলা বা খরচ চাইনা। বিটুসি বিটুবির মত করে করতে চাই । <br />
                                </p>

                                <p>
                                    <span className="font-bold pb-2">Importer with Showroom Challengesঃ</span> <br />
                                    ✅ আমার গাড়ি আছে, কিন্তু স্পেসিফিক সেই গাড়ীর কাস্টমার আমি পাচ্ছিনা <br />
                                    ✅ আমার কাস্টমার আছে, কিন্তু আমার এই গাড়ীটা চাচ্ছেনা <br />
                                    ✅ আমি রিটেলের পাশাপাশি বিটুবি করে আমার সেল আরো বাড়াতে চাই <br />
                                </p>

                                <p>
                                    <span className="font-bold pb-2">Common Challenges:</span> <br />
                                    ✅মার্কেটিং খরচ বাড়ছে, বিক্রি বাড়ছে না, বিক্রিত মাধ্যম বাড়াতে পারছিনা <br />
                                    ✅অনলাইনে সাধারন ধারনা থাকার কারনে অনলাইনে সবাই বিক্রি করছে আমার বিক্রি বাড়ছেনা <br />
                                </p>
                            </div>

                            {/* ─── Solution Two ─── */}
                            <SectionHeader>Solution Two</SectionHeader>


                            <div className='w-full mt-4 text-gray-600 text-xl text-start'>

                                <h3
                                    className="text-2xl sm:text-3xl font-bold underline underline-offset-4 text-center"
                                    style={{ color: '#116fa5' }}
                                >
                                    Software &amp; Marketing Growth Support (Partnership)
                                </h3>

                                <p className='mt-4'>
                                    আপনার স্টক দেখতে পারবে <br />
                                    ✅ শত শত ডিলার ও রিটেইলার <br />
                                    ✅ সরাসরি দেশের সকল কাস্টমার <br />
                                    ✅ দামের নিয়ন্ত্রণ আপনার হাতে, ডিলারের হাতে নয় <br />
                                    ✅ বিটুবি ডিল এরমত ঝামেলা ছাড়া বিটু সি ডিল <br />
                                    ✅অ্যাডভান্সড সেলস বৃদ্ধি <br />
                                    ✅ পাইকারি বিক্রি বৃদ্ধি <br />
                                </p>
                            </div>

                            {/* ─── সবার সাথে ডিল করতে ভয় পাচ্ছেন? ─── */}
                            <SectionHeader>সবার সাথে ডিল করতে ভয় পাচ্ছেন?</SectionHeader>

                            <div className='w-full mt-4 text-gray-600 text-xl text-start'>
                                <p>
                                    শর্তসাপেক্ষে আমরা সেই কন্ট্রোল্ড রিস্কে নিয়ে আপনার তাদের কাছে মার্কেটিঙের ব্যবস্থা করে দিব।
                                </p>
                            </div>

                            {/* ─── ফলাফল ─── */}
                            <SectionHeader>ফলাফল</SectionHeader>

                            <div className='w-full mt-4 text-gray-600 text-xl text-start'>
                                <p>
                                    গাড়ীর প্রচার বৃদ্ধি হবে। গাড়ী বিক্রির সম্ভাবনা বাড়বে।
                                </p>
                            </div>

                            {/* ─── Third Solution ─── */}
                            <SectionHeader>Third Challenge</SectionHeader>


                            <div className="w-full mt-4 text-gray-600 text-xl text-start">


                                <div className="mt-8 text-gray-600 text-xl sm:text-2xl leading-relaxed">
                                    <ul className="mt-6 list-disc space-y-5 pl-8 sm:pl-14">
                                        <li>
                                            গাড়ি বিক্রি হচ্ছে না?
                                        </li>
                                        <li>
                                            কাস্টমার গাড়ি দেখছে, কথা বলছে—কিন্তু শেষ পর্যন্ত অন্যের গাড়ি কিনছে?
                                        </li>

                                        <li>
                                            চিন্তা নেই! আপনার গাড়িটি অনলাইনে আরও বেশি কাস্টমারের কাছে পৌঁছে দিন এবং সবার আগে বিক্রির সুযোগ তৈরি করুন।
                                        </li>
                                        <li>
                                            আপনার গাড়ি অনলাইনে প্রচার করুন, সঠিক কাস্টমারের কাছে পৌঁছান এবং দ্রুত বিক্রির সম্ভাবনা বাড়ান।
                                        </li>
                                    </ul>
                                    {/* <p className="mt-4 text-center">আর অপেক্ষা নয়! আজই Click4Details ব্যবহার করুন।</p> */}
                                    <div className="mt-6 text-gray-600 text-xl sm:text-2xl leading-relaxed">
                                        <span className='text-gray-800 text-2xl'>আর অপেক্ষা নয়! এখনই আমাদের সাথে যোগাযোগ করুন :</span><br />
                                        ✅ আপনার গাড়ি অনলাইনে প্রচার করুন<br />
                                        ✅ আরও কাস্টমারের কাছে পৌঁছান<br />
                                        ✅ বিক্রির সম্ভাবনা বাড়ান<br />
                                    </div>
                                </div>
                            </div>

                            <SectionHeader>Solution Three</SectionHeader>

                            <div className="w-full mt-4 text-gray-600 text-xl text-start">
                                <h3
                                    className="text-2xl sm:text-3xl font-bold underline underline-offset-4 text-center"
                                    style={{ color: '#116fa5' }}
                                >
                                    Software, Marketing Growth &amp; Push Sale Support (Special Partnership)
                                </h3>

                                <div className="mt-8 text-gray-600 text-xl sm:text-2xl leading-relaxed">
                                    <p>বিশেষ দুটি শর্ত সাপেক্ষে বিক্রি বৃদ্ধির জন্য আমাদের টিম কাজ করবে</p>

                                    <p className='font-bold underline underline-offset-4 mt-2 text-red-500'>বিশেষ শর্ত একঃ সঠিক বিটুবি প্রাইসঃ</p>

                                    <ul className="mt-4 list-disc space-y-2 pl-8 sm:pl-14">

                                        <li>
                                            আমাদের কাজ আপনার গাড়ীর মার্কেটিং করা।
                                        </li>
                                        <li>
                                            কিন্তু বিক্রি নির্ভর করবে আপানার সঠিক হোলসেল দাম নির্বাচনের উপর।
                                        </li>
                                    </ul>

                                    {/* <p>বিশেষ শর্ত দুইঃ এভেইলেবিলিটি আপডেট রাখাঃ </p> */}
                                    <p className='font-bold underline underline-offset-4 mt-2 text-red-500 mt-2'>বিশেষ শর্ত দুইঃ এভেইলেবিলিটি আপডেট রাখাঃ</p>

                                    <ul className="mt-4 list-disc space-y-2 pl-8 sm:pl-14">
                                        <li>
                                            রিটেলে একটি গাড়ী বিক্রি করতে অনেক সময় ও  Effort লাগে। কোন কোন ক্ষেত্রে ১ থেকে ১৫ দিন সময় লাগে। পাঁচ বারের বেশি কাস্টমারে সাথে কথা বলা ও ২ বার থেকে ৩ বার বেশি বসা লাগে।
                                        </li>
                                        <li>
                                            ফাইনালি কাস্টমার যখন ডিলের টেবিলে বসে তখন ১০ টা এভেলেবেল গাড়ীর ভালো দিক খারাপ দিক বুঝিয়ে তারপর একটা কিনতে রাজি করাতে হয়।
                                        </li>
                                        <li>
                                            তারপর দরদাম করতে সময় ও এফোর্ট নস্ট হয়।
                                        </li>
                                        <li>
                                            তারপর কাস্টমার যখন রাজি হয় তখন দ্রুত এবং সাথে সাথে বায়না নিতে হয়। এখন বায়না নেবার পর যদি যদি জানা যায় গাড়িটা নেই। ভুল করে আপডেট করা হয়নি।
                                        </li>

                                        ❌ Customer Trust কমে যায় <br />
                                        ❌ Sales Team-এর Effort নষ্ট হয় <br />
                                        ❌ Future Sales Opportunity ক্ষতিগ্রস্ত হয়।  <br />
                                        ❌ সিস্টেমের প্রতি ফিল্ড এজেন্ট আস্থা হারায়। <br />
                                        ❌ আপনার গাড়ী পরবর্তিতে আমরা বিক্রি করতে নিরুৎসাই হই।  <br />
                                        ❌ রেটিং খারাপ হয়।  <br />

                                    </ul>
                                </div>
                            </div>


                            <div className="w-full mt-4 text-gray-600 text-xl text-start mt-2 mb-2">
                                <div className="text-xl sm:text-2xl leading-relaxed">
                                    <p className='font-bold underline underline-offset-4 mt-2 text-red-500 mb-2'>এই ফল পেতে হলে ধৈর্য ধরতে হবে</p>
                                    <p>এই সিস্টেম একদিনে ডেভেলপ করেনা।</p>
                                    <p className="font-bold">৩ মাস থেকে ১ বছর লাগবে</p>
                                    <p>তাই এই এক বছর ফল না পেলেও দাম এবং এভেলেবিলিটি আপডেট রাখতে হবে</p>

                                    <div className="mt-8">
                                        <p className="font-bold underline underline-offset-4">আমি এই ধৈর্য ধরতে পারবোনা</p>
                                        <p className="font-bold text-gray-600 underline underline-offset-4">
                                            কাল থেকে আমার গাড়ী বিক্রি চাই
                                        </p>
                                    </div>

                                    <div className="mt-8">
                                        <p className="font-bold text-red-500 underline underline-offset-4">আমার আলোঃ ১</p>
                                        <p>আপনি যদি গাড়ীর হোল সেল প্রাইস দেন বা বাজারদর থেকে কম দেন</p>
                                        <p>আপনার গাড়ী যদি কাস্টমার চায়</p>
                                        <p>তাহলে কালকে থেকেই আপনার গাড়ী বিক্রি হবে</p>
                                    </div>

                                    <div className="mt-8">
                                        <p className="font-bold text-red-500 underline underline-offset-4">আমার আলোঃ ২</p>
                                        <p>আমাদের দ্বারা গাড়ী বিক্রি করতে আপনাকে কোন কাজ করতে হচ্ছেনা</p>
                                        <p>
                                            <span className="font-bold underline underline-offset-4">সফটওয়্যার ব্যবহারঃ</span>{" "}
                                            আপনি আপনার কোম্পানির কাছেই সফটওয়্যার ব্যবহার করবেন।
                                        </p>
                                        <p>
                                            <span className="font-bold underline underline-offset-4">বিটুবি প্রাইস সঠিক ভাবে দিনঃ</span>{" "}
                                            শুধু বিটুবি প্রাইস কম করে লিখবেন।
                                        </p>
                                        <p>
                                            <span className="font-bold underline underline-offset-4">এভেলেবিলিটি দিনঃ</span>{" "}
                                            এভেলেবিলিটি ঠিক রাখবেন।
                                        </p>
                                        <p className="font-bold text-gray-600">
                                            সব কিছু অটোমেটিক হবে। এখানে কোন এফোর্ট দিতে হবেনা ।
                                        </p>
                                        <p className="font-bold text-gray-600">
                                            আপনার মত স্টক আছে তাদের মধ্যে একজন কি এই কাজ করতে পারবে না?
                                        </p>
                                    </div>

                                    <div className="mt-8">
                                        <p className="font-bold text-red-500 underline underline-offset-4">মনে রাখবেনঃ</p>
                                        <p>আমাদের কাজ আপনার গাড়ীর মার্কেটিং করা</p>
                                        <p className="font-bold text-gray-600">
                                            কিন্তু বিক্রি নির্ভর করবে আপনার দামের উপর
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── আমাদের পার্টনার হওয়ার শর্ত ─── */}
                            <SectionHeader id="partners">আমাদের পার্টনার হওয়ার শর্ত</SectionHeader>

                            <div className="w-full mt-4 text-gray-600 text-xl text-start">
                                <div className="mt-4 text-xl sm:text-2xl leading-loose">
                                    <p>আমরা শুধু সৎ ব্যবসায়ীদের সাথে কাজ করতে চাই</p>
                                    <p className="mt-6">তাই আমাদের চারটি মূলনীতি:</p>

                                    <div className="mt-7 space-y-7">
                                        <div>
                                            <h3 className="font-bold">১. Crystal Clear Information</h3>
                                            <p className="mt-4">তথ্য গোপন করা যাবে না</p>
                                        </div>

                                        <div>
                                            <h3 className="font-bold">২. Commitment</h3>
                                            <p className="mt-4">যা বলবেন তাই দিতে হবে।</p>
                                        </div>

                                        <div>
                                            <h3 className="font-bold">৩. Fair Return Policy</h3>
                                            <p className="mt-4">কমিটমেন্ট অনুযায়ী না হলে দায়িত্ব নিতে হবে।</p>
                                        </div>

                                        <div>
                                            <h3 className="font-bold">৪. Fair Pricing</h3>
                                            <p className="mt-4">সঠিক ও প্রতিযোগিতামূলক মূল্য দিতে হবে।</p>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* ─── Forth Challenge ─── */}
                            <SectionHeader>Forth Challenge</SectionHeader>

                            <div className="w-full mt-4 text-gray-600 text-xl text-start">
                                <div className="mt-8 text-gray-600 text-xl sm:text-2xl leading-relaxed">

                                    <ul className="mt-6 list-disc space-y-5 pl-8 sm:pl-14">
                                        <li>
                                            <strong className="text-gray-800">
                                                পুঁজি নেই, কিন্তু গাড়ির ব্যবসা করতে চান?
                                            </strong>
                                        </li>

                                        <li>
                                            শোরুমে গাড়ি কম, কিন্তু কাস্টমার আছে অনেক?
                                            কাস্টমারের চাহিদা অনুযায়ী গাড়ি না থাকায় কাঙ্ক্ষিত গাড়ি বিক্রি করতে পারছেন না?
                                        </li>

                                        <li>
                                            <strong className="text-gray-800">
                                                চিন্তা নেই!
                                            </strong>{" "}
                                            শোরুমে বেশি গাড়ি মজুত না রেখেও আপনার গাড়ির ব্যবসা বাড়ানোর সুযোগ তৈরি করুন।
                                        </li>

                                        <li>
                                            কাস্টমারের চাহিদা অনুযায়ী গাড়ি খুঁজে বের করুন এবং
                                            গাড়ির মালিক বা বিক্রেতার গাড়ির সাথে কাস্টমারকে ম্যাচ করে
                                            বিক্রির সুযোগ তৈরি করুন।
                                        </li>

                                        <li>
                                            নিজের শোরুমে গাড়ি না থাকলেও কাস্টমার হারাবেন না।
                                            কম পুঁজিতে আরও বেশি গাড়ি বিক্রির সুযোগ তৈরি করুন।
                                        </li>
                                    </ul>

                                    {/* Call To Action */}
                                    <div className="mt-8 rounded-xl bg-gray-50 p-5 sm:p-6">
                                        <p className="text-gray-800 text-2xl sm:text-3xl font-semibold mb-4">
                                            আজই শুরু করুন!
                                        </p>

                                        <p className="text-gray-700 text-xl sm:text-2xl mb-4">
                                            Click4Details-এর মাধ্যমে আপনার কাস্টমারের চাহিদার সাথে
                                            সঠিক গাড়ি ম্যাচ করুন এবং আপনার ব্যবসার পরিধি বাড়ান।
                                        </p>

                                        <div className="space-y-2 text-xl sm:text-2xl">
                                            <p>✅ কাস্টমারের চাহিদা অনুযায়ী গাড়ি খুঁজুন</p>
                                            <p>✅ গাড়ির মালিক ও বিক্রেতার গাড়ি খুঁজে নিন</p>
                                            <p>✅ কাস্টমার ও গাড়ির মধ্যে ম্যাচ তৈরি করুন</p>
                                            <p>✅ নিজের গাড়ি কম থাকলেও বিক্রির সুযোগ তৈরি করুন</p>
                                            <p>✅ কম পুঁজিতে ব্যবসা বাড়ানোর সুযোগ নিন</p>
                                        </div>

                                        <p className="mt-6 text-gray-800 text-xl sm:text-2xl font-semibold">
                                            📞 এখনই আমাদের সাথে যোগাযোগ করুন +8809638660077 এবং Click4Details ব্যবহার শুরু করুন।
                                        </p>
                                    </div>

                                </div>
                            </div>


                            <SectionHeader>Solution Four</SectionHeader>

                            <div className="w-full mt-4 text-gray-600 text-xl text-start">
                                <h3
                                    className="text-2xl sm:text-3xl font-bold underline underline-offset-4 text-center"
                                    style={{ color: '#116fa5' }}
                                >
                                    Dealership And Field Agent Partnership
                                </h3>

                                <div className="mt-6 text-[17px] sm:text-[19px] md:text-[21px] font-medium leading-[1.5]">

                                    <div className="mt-6">
                                        <h3 className="font-bold underline underline-offset-4">
                                            Field Dealer: Only Showroom (শুধু শোরুম) কিন্তু Importer নয়
                                        </h3>

                                        <div className="mt-4 space-y-1.5">
                                            <p>
                                                <span className="font-bold underline underline-offset-4">ঝুঁকির যুক্তি:</span>{" "}
                                                শোরুমে গাড়ি কম থাকলেও চিন্তা নেই, বড় ইম্পোর্টারের হাজার হাজার গাড়ি থেকে অ্যাপে গাড়ির বিক্রি করতে পারবেন। আপনার গাড়ীর বাহিরে গাড়ী বিক্রি করতে পারবেন।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">কাস্টমার ফেরত যাবে না:</span>{" "}
                                                কাস্টমার এসে পছন্দের গাড়ি না পেয়ে ঘুরে যাবে না, অ্যাপ থেকে অন্য গাড়ি পছন্দ করিয়ে অনস্পট বুকিং নেওয়া যাবে।
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="font-bold underline underline-offset-4">
                                            Field Dealer: Used Car Showroom (পুরাতন গাড়ির শোরুম)
                                        </h3>

                                        <div className="mt-4 space-y-1.5">
                                            <p>
                                                <span className="font-bold underline underline-offset-4">নতুন গাড়ী বিক্রিঃ</span>{" "}
                                                পুরাতন গাড়ীর পাশাপাশি বিক্রি করতে পারবেন নতুন গাড়ী। যে টাইপের গাড়ি আপনার কাছে নাই কাস্টমার সেই গাড়ী চাইলে আপনি তাকে সে টাইপের রিকমেন্ডেশন গাড়ী বিক্রি করতে পারবেন।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">প্রয়োজনীয় গাড়ীর দাম জানার সুবিধাঃ</span>{" "}
                                                শোরুমে গাড়ি ক্রয় বা এক্সেঞ্জ করতে এলে অ্যাপে নতুন গাড়ীর সঠিক বাজারদর দেখে ঝটপট সঠিক দাম হিসাব করে ডিল ফাইনাল করা যাবে।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">ফ্রি মার্কেটিং ও বিক্রির ঝুঁকি:</span>{" "}
                                                যদি আপনি আমাদের গ্রুপ পার্টনার হন। শর্ত সাপেক্ষে এক সাথে ব্যবসা করে আমরা আপনার গাড়ী বিক্রি করে দেব।
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="font-bold underline underline-offset-4">
                                            General Field Agent
                                        </h3>

                                        <div className="mt-4 space-y-1.5">
                                            <p>
                                                <span className="font-bold underline underline-offset-4">পুঁজি ছাড়া ব্যবসা:</span>{" "}
                                                পকেটে এক টাকাও ইনভেস্টমেন্ট বা পুঁজি লাগবে না, তাও লাখ টাকার গাড়ির বড় ব্যবসা করা যাবে।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">এক্সট্রা ইনকাম:</span>{" "}
                                                অনেক গাড়ি বিক্রি করার সময় নিজের মতো প্রফিট বা লাভ যোগ করে পকেটে এক্সট্রা কমিশন নেওয়ার সুযোগ।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">বিশাল লাইভ স্টক:</span>{" "}
                                                বড় বড় ইম্পোর্টারদের সব গাড়ি সরাসরি আপনার মোবাইলের অ্যাপে লাইভ দেখা যাবে।এবং আপনি সেল করতে পারবেন । গাড়ীর অভাব হবেনা।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">স্টক ক্লোন ম্যাজিক:</span>{" *"}
                                                শোরুমে গাড়ি না থাকলে আপনার বড় স্টক থেকে গাড়ি দেখে পছন্দ হলে নিজের শপে এনে কাস্টমারকে দেখিয়ে বিক্রি করা যাবে।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">গোপনীয়তা রক্ষা:</span>{" "}
                                                গাড়ির আসল কেনা দাম বা লিংক কাস্টমার দেখতে পাবে না, আপনার ব্যবসার সিক্রেসি বজায় থাকবে।
                                            </p>

                                            <p>
                                                <span className="font-bold underline underline-offset-4">নিশ্চিন্ত ডেলিভারি:</span>{" "}
                                                কাস্টমার রাজি হলে জাস্ট আমাদের কল দেবেন; গাড়ি পৌঁছে যাবে কাস্টমারের কাছে আর কমিশন আপনার পকেটে।
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="font-bold underline underline-offset-4">
                                            Company Field Agent
                                        </h3>

                                        <div className="mt-4 space-y-1.5">
                                            <p>
                                                <span className="font-bold underline underline-offset-4">শোরুমের পিছনে আর ঘুরতে হবেনা:</span>{" "}
                                                আপনি নিজেই বিক্রি করতে পারবেন গাড়ী। শোরুম বা ডিলারের কাছে আর যেতে হবেনা। আপনার লোন ফাইল আর কমতি থাকবেনা।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">ব্যবসায়ী পার্টনার:</span>{" "}
                                                আপনি আমাদের হবেন পার্টনার। আমাদের কাছ থেকে পাবেন লাভের অংশ ও ভেন্ডর কমিসনের অংশ।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">নেটওয়ার্ক বৃদ্ধি:</span>{" "}
                                                আমাদের সাথে সরাসরি কানেক্ট হয়ে ব্যাংকের কার লোন এর সংখ্যা বাড়ানো যাবে আগের চেয়ে বেশি।
                                            </p>
                                            <p>
                                                <span className="font-bold underline underline-offset-4">সহজে গাড়ি খোঁজা:</span>{" *"}
                                                লোন নিতে আসা ক্লায়েন্টের বাজেট ও পছন্দ অনুযায়ী গাড়ি খুঁজে দেওয়া সহজ হবে।
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Final Slide ─── */}
                            <SectionHeader>তারপরও যদি আপনার গাড়ির বিক্রি না বাড়ে, তাহলে কী করবেন?</SectionHeader>

                            <div className="w-full mt-4 text-gray-600 text-xl text-start">
                                <div className="space-y-5 text-xl font-medium leading-relaxed">

                                    <p className="font-bold underline underline-offset-4">বিক্রি না বাড়লেও</p>
                                    <p>আমার কোম্পানি ডিজিটাইজেশন তো হচ্ছে।</p>
                                    <p>আমার জীবন সহজ হচ্ছে।</p>

                                    <p className="font-bold underline underline-offset-4">মাত্র দুটি শর্ত মানলে</p>
                                    <p>গাড়ি বিক্রির একটি মাধ্যম বাড়লে অসুবিধা কি?</p>

                                    <p className="font-bold underline underline-offset-4">সুতরাং</p>
                                    <p>ক্লিক ফর ডিটেইলস আমার খুব দরকার</p>
                                    <p>আমার কোম্পানির সবাইকে অবশ্যই ব্যবহার করতে বলব</p>

                                    <p className="font-bold text-red-600 underline underline-offset-4">Click4Details ব্যবহার করার সময় কিছু সতর্কতা :</p>

                                    <div className="mt-7 text-left text-[17px] sm:text-[19px] md:text-[21px] font-medium leading-relaxed">
                                        <div>
                                            <h3 className="font-bold text-gray-600 underline underline-offset-4">
                                                প্রাইস পরিবর্তনে খুব সতর্কতা অবলম্বন করতে হবে:
                                            </h3>
                                            <ul className="mt-2 list-disc space-y-2 pl-7">
                                                <li>
                                                    আপনি প্রাইস পরিবর্তন করলে সারা বাংলাদেশে, আপনার কোম্পানির সকল সদস্যের কাছে, ডিলার মিডিয়া সবার কাছে প্রাইস পরিবর্তন হয়ে যাবে।
                                                </li>
                                                <li>
                                                    ভুল দামে কাস্টমার অর্ডার করে দিলে আর আপনি গাড়ি ঐ দামে দিতে না পারলে আমাদের কাস্টমার আপনার ধারণা মিথ্যে দেবে।
                                                </li>
                                                <li>
                                                    প্রাইস পরিবর্তনের মাধ্যমে ভুলভাবে কাজ করা যাবে। এবং পারমিশন সাপেক্ষে দেওয়া যাবে।
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="mt-5">
                                            <h3 className="font-bold text-gray-600 underline underline-offset-4">
                                                গাড়ি  শোরুমে আসার পর খুব সতর্কতা অবলম্বন করতে হবে:
                                            </h3>
                                            <ul className="mt-2 list-disc space-y-2 pl-7">
                                                <li>
                                                    কিন্তু মার্কেটিং এবং ডিলারা আপনার গাড়ীর তথ্য অনুযায়ী কাস্টমারের কাছে গাড়ি বিক্রি করবে।
                                                </li>
                                                <li>
                                                    সাধারণ অবস্থার গাড়ির তথ্য যদি ভুল থাকে গাড়ি ডেলিভারি হলেও কাস্টমার গাড়ী ফেরত দিয়ে দিবে। কিন্তু মার্কেটিং এবং ডিলারা কখনোই দায় নিবেনা।
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="mt-5">
                                            <h3 className="font-bold text-gray-600 underline underline-offset-4">
                                                তথ্য ঠিক মত আপলোড হয়েছে কিনা তা সর্বদা পর্যবেক্ষণ করার দায়িত্ব আপনারঃ
                                            </h3>
                                            <ul className="mt-2 list-disc space-y-2 pl-7">
                                                <li>
                                                    যদি ডেটা আমরা আপলোড করে দেই, আমাদের মাঝে মাঝে ভুল হতে পারে।
                                                    <ul className="mt-2 list-[circle] space-y-1 pl-7">
                                                        <li>কারণ টেকনিকালি ডেটা আমার কাছে নেই।</li>
                                                        <li>আর আমরা অনেক ডেটা আপলোড করি।</li>
                                                        <li>আমাদের সারা ব্যাপারে কেউ আর আপনার মত গাড়ীর অভিজ্ঞতা নেই।</li>
                                                        <li>আমাদের অনেক সময় পুরাতন স্টক চলে যায়, নতুন স্টক আসে।</li>
                                                        <li>ভুল হলে আমাদের জানালে সাথে সাথে আমরা আপলোড করে দিব।</li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="mt-5">
                                            <h3 className="font-bold underline underline-offset-4">
                                                সফটওয়্যার আপডেটঃ
                                            </h3>
                                            <ul className="mt-2 list-disc space-y-2 pl-7">
                                                <li>
                                                    আমাদের আপনার প্রয়োজনে জানাবেন। আমরা সফটওয়্যার আপনার চাওয়া অনুযায়ী করে দিতে চেষ্টা করব।
                                                </li>
                                                <li>
                                                    সফটওয়্যার ব্যবহারে কোন সমস্যা হলে আমাদের হট লাইনে দ্রুত জানাবেন। আমরা দ্রুত সমাধানে চেষ্টা করব।
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── পার্টনাররা কি কি ফ্রি পাচ্ছেন ─── */}
                            <SectionHeader>পার্টনাররা কি কি ফ্রি পাচ্ছেন</SectionHeader>

                            <div className="mx-auto mt-8 w-full max-w-5xl text-gray-600 text-start">
                                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {freeBenefits.map((benefit) => (
                                        <li
                                            key={benefit}
                                            className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
                                        >
                                            <span
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                                                style={{ backgroundColor: '#116fa5' }}
                                                aria-hidden="true"
                                            >
                                                ✓
                                            </span>
                                            <span className="font-medium leading-snug">
                                                {benefit}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Final Call To Action */}
                            <section className="mx-auto w-full max-w-5xl mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B5D8A] to-[#116FA5] px-6 py-12 text-center text-white shadow-xl sm:px-10">
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">Ready to Grow?</p>
                                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">আপনার গাড়ির ব্যবসাকে আজই ডিজিটাল করুন</h2>
                                <p className="mx-auto mt-4 max-w-2xl leading-8 text-blue-50">
                                    Click For Details-এর মাধ্যমে stock, customer এবং sales process আরও সহজভাবে পরিচালনা করুন।
                                </p>
                                {/* <a
                                    href="/contact"
                                    className="mt-7 inline-flex rounded-xl bg-orange-500 px-7 py-3 font-bold text-white shadow-lg transition hover:bg-orange-600"
                                >
                                    যোগাযোগ করুন
                                </a> */}
                            </section>

                            {/* Chairman Section */}
                            <div id="chairman" className="w-full mt-20 scroll-mt-28">
                                <div className="flex flex-col items-center gap-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6 shadow-sm sm:p-8 md:flex-row">
                                    {/* Chairman Image */}
                                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl">
                                            <Image
                                                src="/sir.jpeg"
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
                                            Chairman, Click4Details Ltd
                                        </p>
                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                            সিলেট ক্যাডেট কলেজ থেকে পাস করে পাইলট কবির ১৯৯৮ সালে বাংলাদেশ বিমান বাহিনীতে যোগদান করেন। তিনি একজন ফাইটার পাইলট এবং ফ্লাইং ইনস্ট্রাক্টর ছিলেন। তিনি বিমান বাহিনী এবং জাতিসংঘের মিশনে বিভিন্ন গুরুত্বপূর্ণ পদে কর্মরত ছিলেন।
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
