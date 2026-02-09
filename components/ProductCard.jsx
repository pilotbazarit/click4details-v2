"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { FireExtinguisher, GitBranch, LifeBuoy, MapPin, ReceiptText, Share2, PhoneOutgoing, MessageCircle, ShoppingCart, Copy } from "lucide-react"
import { useAppContext } from "@/context/AppContext";
import Link from 'next/link';
import ProductShareModal from "./modals/ProductShareModal";
import ShopSelectModal from "./modals/ShopSelectModal";
import ProductChatModal from "./modals/ProductChatModal";
import { usePathname } from "next/navigation";
import { formatPrice } from "@/helpers/functions";
import Login from "./Login";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";


const ProductCard = ({ product, parsedUser = null }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatConfirmOpen, setChatConfirmOpen] = useState(false);

  const { cartItems, setCartItems, addToCart, user } = useAppContext();

  const handleCopy = (e) => {
    e.preventDefault();
    if (product?.v_code) {

      const cleanedCode = product.v_code.replace(/^[^-]*-/, "");

      navigator.clipboard.writeText(cleanedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const pathname = usePathname();
  const href =
    pathname.startsWith("/my-shop/") || pathname.startsWith("/company-shop/") || pathname.startsWith("/member-shop/") || pathname.startsWith("/user-shop/")
      ? `/product/my-shop/${product?.v_id}`
      : `/product/${product?.v_id}`;

  // ID বাদ দিয়ে basePath বের করা
  const basePath =
    "/" +
    pathname
      .split("/")
      .filter(Boolean) // খালি string বাদ দেবে
      .slice(0, -1) // শেষের ID বাদ দেবে
      .join("/");

  const [loginOpen, setLoginOpen] = useState(false);

  const proceedToChat = () => {
    if (parsedUser) {
      setChatOpen(true);
    } else {
      setLoginOpen(true);
    }
  };

  const handleChatOpen = () => {
    setChatConfirmOpen(true);
  };

  const handleAcceptChat = () => {
    setChatConfirmOpen(false);
    proceedToChat();
  };

  const handleRejectChat = () => {
    setChatConfirmOpen(false);
  };


  const closeLoginModal = () => {
    setLoginOpen(false);
  };

  const openForgotPasswordModal = () => {
    setLoginOpen(false);
    // setIsForgotPasswordModalOpen(true);
  };


  const handleAddToCart = (item) => {
    // Implement add to cart functionality here

    let price = 0;

    const rawPrice =
      pathname === '/my-shop/' || pathname === '/company-shop/'
        ? item?.vehicle_price?.user_price
        : item?.vehicle_price?.pbl_price;

    if (rawPrice !== 'Call for Price') {
      price = rawPrice;
    }


    // let price = product?.prices && product?.prices[0]?.pp_regular_price;
    let priceId = item?.vehicle_price && item?.vehicle_price?.v_price_id;

    let cartItem = {
      c_user_id: parsedUser?.id || null,
      c_session_id: parsedUser?.id ? null : getSessionId(),
      ci_product_id: item.v_id,
      // ci_type_id: null,
      ci_type_id: item?.v_category?.c_id,
      ci_qty: 1,
      ci_price: price || 0,
      ci_url: item?.vehicle_front_image?.url || '',
      ci_name: item.v_title,
      ci_subtotal: price * 1,
      ci_product_price_id: priceId,
    }

    addToCart(item.v_id, cartItem);
  }


  return (
    <div className="h-full relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
      <div className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        shadow-md
        hover:shadow-2xl
        hover:-translate-y-2
        hover:border-gray-300
        transition-all
        duration-300
        ease-in-out
        p-3
        bg-white
        flex
        flex-col
        font-sans
        h-full

      ">

        {/* font-arial
        font-ui-sans-serif */}
        {product?.v_urgent_sale == "1" && (
          <div className="absolute top-0 left-0 w-24 h-24 z-20">
            <div className="absolute transform -rotate-45 bg-gradient-to-r from-orange-600 to-red-600 text-center text-white font-bold py-1 left-[-34px] top-[24px] w-[150px] shadow-lg text-xs tracking-wide">
              URGENT
            </div>
          </div>
        )}

        {/* Message Notification Badge */}
        {/* <div 
          onClick={() => setChatOpen(true)}
          className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg z-30 flex items-center gap-1 animate-pulse cursor-pointer hover:from-red-600 hover:to-red-700 transition-all duration-200 md:hidden"
        >
          <span className="flex h-2 w-2 relative">
            <span className="inline-flex absolute h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>2 msg</span>
        </div> */}


        <Link href={href} target="_blank">
          <div className="relative overflow-hidden rounded-xl group/image">
            {product?.vehicle_front_image?.url && (
              <img
                src={product?.vehicle_front_image.url || 'https://res.cloudinary.com/pilotbazar/image/upload/vehicles/6BM29EuNbGBWwi51Z514ChHfLTLcocKGyD2QJLnv.jpg'}
                alt="Vehicle"
                className="rounded-xl mb-3 w-full h-60 sm:h-72 md:h-72 lg:h-72 xl:h-60 3xl:h-72 object-cover aspect-[3/2] transition-transform duration-500 group-hover/image:scale-105"
              />
            )}

            {/* {(parsedUser?.user_mode === 'pbl' || parsedUser?.user_mode === 'supreme') && ( */}
            <div
              onClick={handleCopy}
              className="absolute bottom-6 right-3 bg-gray-600/80 backdrop-blur-sm rounded-full px-3 py-1.5 leading-4 text-xs text-white font-medium z-10 cursor-pointer hover:bg-gray-700/90 transition-all duration-200 shadow-lg"
            >
              {copied ? "✓ Copied!" : product?.v_code}
            </div>
            {/* // )} */}

          </div>
        </Link>

        <Link href={`/product/${product?.v_id}`} target="_blank">
          <p className="text-lg leading-6 font-bold text-blue-800 hover:text-blue-900 transition-colors duration-200 line-clamp-2">
            {product?.v_title?.length > 50
              ? product.v_title.slice(0, 50) + "..."
              : product.v_title}
          </p>
        </Link>


        <div className="grid grid-cols-3 gap-2 mt-2 bg-gray-50 rounded-lg p-2">
          {/* Condition */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium mb-1">Condition</span>
            <span className="font-bold text-gray-900 text-sm sm:text-base">
              {product?.v_condition_name || 'N/A'}
            </span>
          </div>

          {/* Registration */}
          {
            product.v_grade_name ? (
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium mb-1">Point</span>
                <span className="text-gray-900 font-bold text-sm sm:text-base">
                  {product?.v_grade_name || 'N/A'} (
                  {[product?.v_int_grade_name, product?.v_ext_grade_name].filter(Boolean).join(' ') || 'N/A'}
                  )

                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium mb-1">Registration</span>
                <span className="text-gray-900 font-bold text-sm sm:text-base">
                  {product?.v_registration || 'N/A'}
                </span>
              </div>
            )
          }


          {/* <div className="flex flex-col">
            <span className="text-gray-400 text-sm sm:text-base md:text-base lg:text-sm xl:text-sm 2xl:text-base 3xl:text-base 4xl:text-base">Point</span>
            <span className="text-black font-bold ">
              {product?.v_registration || 'N/A'}
            </span>
          </div> */}

          {/* Mileage */}
          <div className="flex flex-col text-center">
            <span className="text-gray-500 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium mb-1">Mileage</span>
            <span className="text-gray-900 font-bold text-sm sm:text-base">
              {product?.v_mileage || 'N/A'}
            </span>
          </div>
        </div>


        <div className="text-gray-600 text-sm w-full flex mt-2 py-2 border-t border-gray-100">
          <div className="w-[34%]">
            <span className="text-gray-600 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium">
              {product.v_availability_status
                ? product.v_availability_status.charAt(0).toUpperCase() +
                product.v_availability_status.slice(1) + ' '
                : 'Available '}
            </span>
          </div>
          <div className="w-[66%]">
            <span className="text-gray-600 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium">
              {product.v_location && product.v_location.location_name.charAt(0).toUpperCase() +
                product.v_location.location_name.slice(1) + ' '
              }
              {
                pathname !== '/pb-home/' &&
                  product.v_location && product.v_location.uo_id ? `(${product.v_location.uo_id}) ${product.v_location.uo_name}` : ``
              }
            </span>
          </div>
        </div>


        <div className="py-2 border-t border-gray-100 flex-grow flex flex-col justify-end">

          <div className="flex justify-between mb-2">

            <div>
              <div className="font-extrabold text-gray-900 text-xl mb-1">
                {product?.vehicle_price?.user_price !== 'Call for Price' && ''}
                {product?.vehicle_price?.user_price !== 'Call for Price' && 'TK. '}
                {(pathname === '/my-shop/' || pathname === '/company-shop/')
                  ? formatPrice(product?.vehicle_price?.user_price)
                  : formatPrice(product?.vehicle_price?.pbl_price)
                }
                {/* {product?.vehicle_price?.user_price != 'Call for Price' && 'TK.'} {pathname == '/my-shop/' ? product?.vehicle_price?.user_price : product?.vehicle_price?.pbl_price} */}
              </div>

              {
                pathname !== '/pb-home/' ? (
                  <span className="text-gray-500 text-xs font-medium mb-1">
                    {product?.vehicle_db_price?.vp_pbl_price_status
                      ? String(product.vehicle_db_price.vp_pbl_price_status).charAt(0).toUpperCase() +
                      String(product.vehicle_db_price.vp_pbl_price_status).slice(1)
                      : ''}
                  </span>
                ) : (
                  <span className="text-gray-500 text-xs font-medium mb-1">
                    {product?.vehicle_db_price?.vp_user_price_status
                      ? String(product.vehicle_db_price.vp_user_price_status).charAt(0).toUpperCase() +
                      String(product.vehicle_db_price.vp_user_price_status).slice(1)
                      : ''}
                  </span>
                )
              }
            </div>

            {
              Number(parsedUser?.id) !== Number(product?.v_user_id) && (
                <button
                  // onClick={() => setChatOpen(true)}
                  onClick={() => handleChatOpen()}
                  className="
                  px-3
                  lg:px-4
                  md:px-2
                  xl:px-3
                  3xl:px-4
                  py-2
                  border-2
                border-red-300
                rounded-lg
                text-red-800
                font-semibold
                bg-yellow-50
                hover:bg-red-50
                hover:border-red-400
                active:scale-95
                transition-all
                duration-200
                w-32
                h-10
                relative"
                >
                  <div
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="text-sm">Offer Price</span>
                  </div>
                </button>
              )
            }
          </div>

          <div className="flex justify-between gap-2">
            {pathname === '/pb-home/' && (
              <button
                onClick={() => {
                  setShopModalOpen(true);
                }}
                className="
                flex-1
              lg:px-4
              md:px-5
              xl:px-3
              3xl:px-4
              bg-gradient-to-r 
              border
              border-blue-300
              text-white 
              font-semibold 
              px-6 py-2 
              rounded-lg 
              transition-all duration-300
              hover:shadow-lg
              active:scale-95"
              >
                <div
                  className="flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4 text-blue-600" />
                  {/* <span className="text-sm">Clone</span> */}
                </div>
              </button>
            )}





            <button
              onClick={() => setOpen(true)}
              className="
              flex-1
              lg:px-4
              md:px-5
              xl:px-3
              3xl:px-4
              bg-gradient-to-r 
              border
              border-green-300
              font-semibold 
              px-6 py-2 
              rounded-lg 
              transition-all duration-300
              hover:shadow-lg
              active:scale-95"
            >
              <div
                className="flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4 text-green-600" />
                {/* <span className="text-sm">Share</span> */}
              </div>
            </button>
            <button
              onClick={() => {
                const phoneNumber = parsedUser?.phone || '+8809638660077';
                window.location.href = `tel:${phoneNumber}`;
              }}
              className="
              flex-1
              lg:px-4
              md:px-5
              xl:px-3
              3xl:px-4
              bg-gradient-to-r 
               border
              border-purple-300
              font-semibold 
              px-6 py-2 
              rounded-lg 
              transition-all duration-300
              hover:shadow-lg
              active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                <PhoneOutgoing className="h-4 w-4 text-purple-600" />
                {/* <span className="text-sm">Call</span> */}
              </div>
            </button>

            <button
              // onClick={() => {
              //   const phoneNumber = parsedUser?.phone || '+8809638660077';
              //   window.location.href = `tel:${phoneNumber}`;
              // }}
              onClick={() => handleAddToCart(product)}
              className="
              flex-1
              lg:px-4
              md:px-5
              xl:px-3
              3xl:px-4
              bg-gradient-to-r 
              border
              border-orange-300
              font-semibold 
              px-6 py-2 
              rounded-lg 
              transition-all duration-300
              hover:shadow-lg
              active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4 text-orange-600" />
                {/* <span className="text-sm">Call</span> */}
              </div>
            </button>
          </div>
        </div>
      </div>

      <ProductShareModal open={open} setOpen={setOpen} product={product} />
      <ShopSelectModal open={shopModalOpen} setOpen={setShopModalOpen} product={product} />
      <ProductChatModal
        open={chatOpen}
        setOpen={setChatOpen}
        productInfo={product}
      />
      <Dialog open={chatConfirmOpen} onOpenChange={setChatConfirmOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center mb-2">Terms & Conditions</DialogTitle><hr />
          </DialogHeader>
          <div className="text-sm text-gray-600 space-y-4 leading-relaxed max-h-[60vh] overflow-y-auto pr-4">

            <p>
              <strong>সরাসরি ইমপোর্টার থেকে গাড়ি কিনুন — Click4Details এর মাধ্যমে</strong>
            </p>

            <p>
              <strong>১।</strong> Wow! Click4Details নিয়ে এসেছে একটি স্মার্ট ও ইউনিক সিস্টেম,
              যেখানে আপনি সরাসরি ইমপোর্টারের কাছ থেকে গাড়ি কেনার সিদ্ধান্ত নিতে পারবেন—
              ঝামেলা ছাড়া, সময় নষ্ট না করে।
            </p>

            <p>
              <strong>২।</strong> এটি একটি <strong>Closed Chat System</strong>, যেখানে নির্দিষ্ট
              প্রশ্ন–উত্তরের মাধ্যমেই ডিল সম্পন্ন হয়।
            </p>

            <hr />

            <div>
              <strong>৩। কিভাবে কাজ করে?</strong>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Offer Price বাটনে ক্লিক করুন</li>
                <li>সাইন-আপ / লগইন করুন</li>
                <li>প্রশ্নের ক্যাটাগরি নির্বাচন করুন</li>
                <li>প্রস্তুত করা Question & Answer অপশন থেকে সিলেক্ট করুন</li>
                <li>ক্লিক করার সাথে সাথে আপনার অফার ইমপোর্টারের কাছে চলে যাবে</li>
              </ol>

              <p className="mt-2">
                ইমপোর্টার সময়মতো উত্তর দিতে পারনে না বা দেন না কারণঃ
              </p>

              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>প্রতিদিন প্রতি গাড়িতে হাজারের বেশি অফার আসে</li>
                <li>সাধারণত ৭২ ঘণ্টার মধ্যে উত্তর পাওয়া যায়</li>
                <li>অথবা Click4Details এর প্রতিনিধি আপনার সাথে যোগাযোগ করবে</li>
              </ul>
            </div>

            <div>
              <strong>৪। গুরুত্বপূর্ণ বিষয় :</strong>
              <p className="mt-1">
                আপনার অফার প্রাইস যদি গাড়ীর বাজারমূল্য অনুযায়ী অনেক কম হয়,
                ইমপোর্টার উত্তর নাও দিতে পারে।
                (সাধারণত ইমপোর্টার পর্যায়ে ২০,০০০–৩০,০০০ টাকা পর্যন্ত নেগোশিয়েশন রেঞ্জ থাকে।)
                উত্তর না পেলে নতুন অফার প্রাইস দিন।
              </p>
            </div>

            <hr />

            <div>
              <strong>৫। দরদাম করার নিয়ম</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>প্রাইস অপশনে গিয়ে প্রাইসের প্রথম ৫ ডিজিট লিখুন</li>
                <li>সার্চ করে প্রাইস সিলেক্ট করুন</li>
                <li>Fixed Price পাওয়ার পর আর দরদাম করবেন না</li>
                <li>বায়নার সময়সীমা: সাধারণত ২৪ ঘণ্টা</li>
                <li>সময়ের সাথে প্রাইস কমতেও পারে, বাড়তেও পারে</li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>৬। কেন এটি “Closed System”?</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ইমপোর্টাররা খুচরা কাস্টমারের সাথে দীর্ঘ কথা বা দরদাম করেন না</li>
                <li>এখানে নিজে থেকে কিছু লেখার অপশন নেই</li>
                <li>শুধুমাত্র টু-দা-পয়েন্ট Question & Answer</li>
                <li>
                  সিদ্ধান্ত একদম পরিষ্কার:
                  <br />
                  👉 এই দামে নিবেন, না নিবেন না
                </li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>৭। গুরুত্বপূর্ণ শর্তাবলি (অবশ্যই পড়ুন)</strong>
            </div>

            <div>
              <strong>৮। Fixed Price – দরদাম নেই</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ইমপোর্টাররা খুচরা দরদাম করেন না</li>
                <li>
                  দাম জানানোর পর শুধু দুটি অপশন:
                  <ul className="list-none pl-3 mt-1">
                    <li>✅ I Agree</li>
                    <li>❌ I Don’t Agree</li>
                  </ul>
                </li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>৯। গাড়ি “As-Is Condition” এ বিক্রি হতে পারে</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>গাড়ি শোরুম কন্ডিশনে থাকতে পারে বা নাও থাকতে পারে</li>
                <li>সাধারণত নিচের এক বা একাধিক সার্ভিস নাও পেতে পারেন:</li>
              </ul>

              <ul className="list-disc pl-10 mt-1 space-y-1">
                <li>ওয়াশ / পলিশ / টাচ-আপ</li>
                <li>চাকা বা পার্টস পরিবর্তন</li>
                <li>প্রোগ্রামিং / SD Card</li>
                <li>এক্সট্রা টুলস / সার্ভিসিং</li>
                <li>ইত্যাদি</li>
              </ul>

              <p className="mt-2">
                কম দামে গাড়ি কিনলে এই রিস্ক গ্রহণ করতে হবে।
                তবে বিষয়গুলো মেজর সমস্যা নয়।
                প্রয়োজনে সার্ভিসের জন্য আলাদা পেমেন্টে সমাধান রয়েছে (শর্তসাপেক্ষে)।
              </p>

              <p>
                👉 মেজর সমস্যা (ইঞ্জিন, গিয়ারবক্স, এক্সিডেন্ট তথ্য গোপন থাকলে)
                হলে গাড়ি পরিবর্তন করা হবে।
              </p>
            </div>

            <hr />

            <div>
              <strong>১০। No Warranty | No Return | No Exchange</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>গ্যারান্টি নেই</li>
                <li>ওয়ারেন্টি নেই</li>
                <li>গাড়ি ফেরত বা এক্সচেঞ্জ নেই</li>
                <li>
                  এই সুবিধা চাইলে → শোরুম থেকে গাড়ি কিনুন
                  (তবে বেশির ভাগ শোরুমও গ্যারান্টি বা ওয়ারেন্টি দেয় না)
                </li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১১। বায়না দিলে ফেরত নেই</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>বায়না কনফার্ম হলে ফেরতযোগ্য নয়</li>
                <li>গাড়ি পরিবর্তন করা যাবে না</li>
                <li>
                  তবে গাড়ি দিতে না পারলে বা গাড়ীতে মেজর সমস্যা থাকলে গাড়ি পরিবর্তন হবে
                </li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১২। এই সিস্টেম কাদের জন্য উপযুক্ত?</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>যারা কম দামে গাড়ি নিতে চান</li>
                <li>যারা ছবি ও তথ্য দেখে গাড়ি বাছাই জানেন</li>
                <li>যারা টু-দা-পয়েন্ট সিদ্ধান্ত নিতে পারেন</li>
                <li>গাড়ি ব্যবসায়ী, রিসেলার, ছোট ডিলার</li>
                <li>“এখন কম দামে নিলাম, পরে ঠিক করবো” টাইপ ক্রেতা</li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১৩। এই সিস্টেম কাদের জন্য নয়?</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>যারা দরদাম করতে চান বা সময় নষ্ট করেন</li>
                <li>যারা শোরুম কন্ডিশন ও আফটার সেল সার্ভিস চান</li>
                <li>যারা খুব খুঁতখুঁতে বা পারফেকশন খোঁজেন</li>
                <li>ফার্স্ট-টাইম বা ইমোশনাল গাড়ি ক্রেতা</li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১৪। কেন ইমপোর্টাররা Click4Details পছন্দ করে?</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>অযথা দরদাম, লম্বা কথা, হোয়াটসঅ্যাপ স্প্যাম বন্ধ</li>
                <li>টু-দা-পয়েন্ট Fixed Price Deal</li>
                <li>সময় বাঁচে, ডিল ক্লোজ হয় দ্রুত</li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১৫। ট্রান্সপারেন্সি ও কমিটমেন্ট</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Click4Details কোনো পক্ষপাতমূলক দরদাম করে না</li>
                <li>
                  ডিল সফল হলে Click4Details শুধুমাত্র ইমপোর্টার থেকে একটি সার্ভিস চার্জ গ্রহণ করে
                </li>
                <li>
                  <strong>I Agree</strong> বাটনে ক্লিক মানে—
                  আপনি সব শর্ত জেনে উক্ত দামে গাড়ি কিনতে সম্মত
                </li>
              </ul>
            </div>

            <hr />

            <p className="font-semibold text-gray-800">
              ১৬। “ঝামেলা ছাড়া, কম দামে — সরাসরি ইমপোর্টার থেকে গাড়ি কিনুন Click4Details এর মাধ্যমে।”
            </p>

          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <button
              type="button"
              onClick={handleRejectChat}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Rejected
            </button>
            <button
              type="button"
              onClick={handleAcceptChat}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Accept
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Login isOpen={loginOpen} onClose={closeLoginModal} openForgotPasswordModal={openForgotPasswordModal} />

      {/* <Login open={loginOpen} setOpen={setLoginOpen} /> */}
    </div>
  );
};

export default ProductCard;
