'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { MessageCircle, Search, MoreVertical, Circle } from 'lucide-react'
import Image from 'next/image'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConversationService from '@/services/ConversationService';

const ConversationList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)

  // Sample conversations data
  const conversationsOld = [
    {
      id: 1,
      name: 'আহমেদ হোসেন',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'হ্যালো, পণ্যটি সম্পর্কে জানতে চাই',
      timestamp: '2 মিনিট আগে',
      unread: 3,
      isOnline: true,
      category: 'seller'
    },
    {
      id: 2,
      name: 'ফাতিমা আক্তার',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'ধন্যবাদ, পণ্যটি খুবই ভালো',
      timestamp: '5 মিনিট আগে',
      unread: 0,
      isOnline: true,
      category: 'buyer'
    },
    {
      id: 3,
      name: 'করিম সাহেব',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'অর্ডার কী হয়েছে?',
      timestamp: '1 ঘণ্টা আগে',
      unread: 2,
      isOnline: false,
      category: 'seller'
    },
    {
      id: 4,
      name: 'সালমা বেগম',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'দাম কমাতে পারবেন?',
      timestamp: '3 ঘণ্টা আগে',
      unread: 0,
      isOnline: true,
      category: 'buyer'
    },
    {
      id: 5,
      name: 'রহিম ব্যবসায়ী',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'পরবর্তী শিপমেন্ট কখন?',
      timestamp: 'গতকাল',
      unread: 0,
      isOnline: false,
      category: 'seller'
    },
    {
      id: 6,
      name: 'করিম সাহেব',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'অর্ডার কী হয়েছে?',
      timestamp: '1 ঘণ্টা আগে',
      unread: 2,
      isOnline: false,
      category: 'seller'
    },
    {
      id: 7,
      name: 'সালমা বেগম',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'দাম কমাতে পারবেন?',
      timestamp: '3 ঘণ্টা আগে',
      unread: 0,
      isOnline: true,
      category: 'buyer'
    },
    {
      id: 8,
      name: 'রহিম ব্যবসায়ী',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'পরবর্তী শিপমেন্ট কখন?',
      timestamp: 'গতকাল',
      unread: 0,
      isOnline: false,
      category: 'seller'
    },
    {
      id: 9,
      name: 'সালমা বেগম',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'দাম কমাতে পারবেন?',
      timestamp: '3 ঘণ্টা আগে',
      unread: 0,
      isOnline: true,
      category: 'buyer'
    },
    {
      id: 10,
      name: 'রহিম ব্যবসায়ী',
      avatar: 'https://via.placeholder.com/48',
      lastMessage: 'পরবর্তী শিপমেন্ট কখন?',
      timestamp: 'গতকাল',
      unread: 0,
      isOnline: false,
      category: 'seller'
    }
  ]

  const [ conversations, setConversations ] = useState([]); // [conversations, setConversations]

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleSelectConversation = (id) => {
    setSelectedConversation(id)
  }


  const getConversations = async () => {
    try {
        const params = {
            _from_id: 4,
            _or_to_id: 4
        }
        const response = await ConversationService.Queries.getConversationList(params);

        if(response.status == "success") {
            setConversations(response.data.data)
        }
        // console.log("response::::::", response);
        
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };



  useEffect(() => {
    getConversations()
  }, [])

  return (
    <>
     <Navbar />
    
        <div className="h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        <div className="w-full h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-4 md:p-6">
            {/* Conversation List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex-shrink-0">
                <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
                    <MessageCircle size={28} />
                    বার্তা
                </h1>

                {/* Search Bar */}
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-3 text-blue-200" />
                    <input
                    type="text"
                    placeholder="কথোপকথন খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                </div>
                </div>

                {/* Conversations List */}
                <div className="flex-grow overflow-y-auto">
                {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                    <div
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`border-b border-slate-200 p-4 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                        selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                    >
                        <div className="flex gap-3 items-start">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <img
                            src={conversation.avatar}
                            alt={conversation.name}
                            className="w-12 h-12 rounded-full object-cover"
                            />
                            {conversation.isOnline && (
                            <Circle size={12} className="absolute bottom-0 right-0 bg-green-500 text-green-500 rounded-full fill-current" />
                            )}
                        </div>

                        {/* Message Info */}
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">
                                {conversation.name}
                            </h3>
                            <span className="text-xs text-slate-500 flex-shrink-0">
                                {conversation.timestamp}
                            </span>
                            </div>
                            <p className="text-sm text-slate-600 truncate">
                            {conversation.lastMessage}
                            </p>
                        </div>

                        {/* Unread Badge */}
                        {conversation.unread > 0 && (
                            <div className="flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {conversation.unread}
                            </div>
                        )}
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="p-8 text-center">
                    <MessageCircle size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">কোনো কথোপকথন পাওয়া যায়নি</p>
                    </div>
                )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                {selectedConversation ? (
                <>
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {(() => {
                        const conv = conversations.find(c => c.id === selectedConversation)
                        return (
                            <>
                            <img
                                src={conv.avatar}
                                alt={conv.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h2 className="text-lg font-bold">{conv.name}</h2>
                                <p className="text-sm text-blue-100">
                                {conv.isOnline ? 'সক্রিয় এখন' : 'অফলাইন'}
                                </p>
                            </div>
                            </>
                        )
                        })()}
                    </div>
                    <button className="p-2 hover:bg-blue-500 rounded-lg transition">
                        <MoreVertical size={20} />
                    </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow overflow-y-auto bg-slate-50 p-6">
                    <div className="space-y-4">
                        {/* Sample messages */}
                        <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-lg max-w-xs shadow-sm">
                            <p className="text-slate-800">আপনার পণ্যের দাম কত?</p>
                            <p className="text-xs text-slate-500 mt-1">১০:৩০ AM</p>
                        </div>
                        </div>
                        <div className="flex justify-end">
                        <div className="bg-blue-600 text-white p-4 rounded-lg max-w-xs shadow-sm">
                            <p>এটি ৫০০ টাকা। আগ্রহী?</p>
                            <p className="text-xs text-blue-100 mt-1">১০:৩১ AM</p>
                        </div>
                        </div>
                        <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-lg max-w-xs shadow-sm">
                            <p className="text-slate-800">হ্যাঁ, দেশব্যাপী ডেলিভারি আছে?</p>
                            <p className="text-xs text-slate-500 mt-1">১০:৩২ AM</p>
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-slate-200 p-4 bg-white flex-shrink-0">
                    <div className="flex gap-2">
                        <input
                        type="text"
                        placeholder="আপনার বার্তা লিখুন..."
                        className="flex-grow px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                        পাঠান
                        </button>
                    </div>
                    </div>
                </>
                ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                    <MessageCircle size={64} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 text-lg">একটি কথোপকথন নির্বাচন করুন</p>
                    </div>
                </div>
                )}
            </div>
            </div>
        </div>
        </div>

        <Footer />
     </>
  )
}

export default ConversationList
