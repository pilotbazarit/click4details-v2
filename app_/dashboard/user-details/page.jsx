// components/UserDetails.js    অথবা   app/user-details/page.js

import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, ShieldCheck, Edit } from 'lucide-react';

const UserDetails = () => {
  // পরে props বা API থেকে আসবে
  const user = {
    name: "Aminul Islam",
    username: "aminul_dev",
    email: "aminul@example.com",
    phone: "+880 17XX-XXXXXX",
    location: "Dhaka, Bangladesh",
    joinDate: "January 2024",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
    bio: "Frontend Developer | Next.js & Tailwind CSS Lover | Building cool stuff",
    role: "Developer",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Cover Area */}
          <div className="h-48 sm:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            <div className="absolute -bottom-16 left-6 sm:left-10">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl object-cover"
                />
                <button
                  className="absolute bottom-2 right-2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Change profile picture"
                >
                  <Edit size={16} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-20 sm:pt-24 px-6 sm:px-10 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h1>
                <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium">
                  @{user.username}
                </p>
              </div>

              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg">
                <Edit size={18} />
                Edit Profile
              </button>
            </div>

            {/* Bio */}
            <p className="mt-6 text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">
              {user.bio}
            </p>

            {/* Badges */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                <ShieldCheck size={18} className="text-green-500" />
                {user.role}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar size={18} />
                Joined {user.joinDate}
              </div>
            </div>

            {/* Info Grid */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Mail size={20} className="text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Phone size={20} className="text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <MapPin size={20} className="text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extra Sections */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Updated something cool</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{i + 1} day ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">42</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Posts</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">189</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Followers</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">76</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Following</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">12</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Projects</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;