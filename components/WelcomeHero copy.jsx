'use client';

import React from 'react';
import { ArrowRight, Zap, Shield, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const WelcomeHero = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left section - Text content */}
          <div className="space-y-8 text-white">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight animate-fade-in">
                স্বাগতম
                {/* <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                  Pilot Bazar
                </span>
                এ */}
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-md animate-fade-in-delay">
                আপনার ব্যবসায়িক সাফল্যের জন্য সম্পূর্ণ ডিজিটাল সমাধান।
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-blue-50 max-w-lg leading-relaxed animate-fade-in-delay-2">
              Pilot Bazar একটি আধুনিক ই-কমার্স প্ল্যাটফর্ম যেখানে ক্রেতা এবং বিক্রেতারা একসাথে ব্যবসা করতে পারেন। আমরা সর্বোচ্চ মানের সেবা এবং নিরাপত্তা নিশ্চিত করি।
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-3">
              <Link href="/pb-home">
                <button className="group px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-yellow-300 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
                  শপিং শুরু করুন
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/about-us">
                <button className="px-8 py-4 bg-blue-400 bg-opacity-20 text-white font-bold rounded-lg border-2 border-white hover:bg-opacity-30 transition-all duration-300 backdrop-blur-md">
                  আরও জানুন
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-blue-300 border-opacity-30">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-300">10K+</p>
                <p className="text-sm text-blue-100">পণ্য</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-300">5K+</p>
                <p className="text-sm text-blue-100">বিক্রেতা</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-300">50K+</p>
                <p className="text-sm text-blue-100">গ্রাহক</p>
              </div>
            </div>
          </div>

          {/* Right section - Features */}
          <div className="space-y-6 animate-fade-in-delay-2">
            <div className="space-y-4">
              {/* Feature card 1 */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-400 rounded-lg group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">দ্রুত ডেলিভারি</h3>
                    <p className="text-blue-100 text-sm mt-1">সারাদেশে দ্রুত এবং নির্ভরযোগ্য ডেলিভারি সেবা।</p>
                  </div>
                </div>
              </div>

              {/* Feature card 2 */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-400 rounded-lg group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">সম্পূর্ণ নিরাপদ</h3>
                    <p className="text-blue-100 text-sm mt-1">আপনার তথ্য সুরক্ষার জন্য সর্বোচ্চ নিরাপত্তা ব্যবস্থা।</p>
                  </div>
                </div>
              </div>

              {/* Feature card 3 */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pink-400 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">২৪/৭ সাপোর্ট</h3>
                    <p className="text-blue-100 text-sm mt-1">যেকোনো সমস্যার জন্য সবসময় আমাদের টিম আছে।</p>
                  </div>
                </div>
              </div>

              {/* Feature card 4 */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">সেরা দাম</h3>
                    <p className="text-blue-100 text-sm mt-1">প্রতিযোগিতামূলক মূল্যে সর্বোত্তম মানের পণ্য।</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <p className="text-white text-sm opacity-75">আমাদের সাথে থাকার জন্য আপনাকে ধন্যবাদ</p>
          <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }
      `}</style>
    </div>
  );
};

export default WelcomeHero;
