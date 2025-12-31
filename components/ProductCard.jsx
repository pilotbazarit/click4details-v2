"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { FireExtinguisher, GitBranch, LifeBuoy, MapPin, ReceiptText, Share2, PhoneOutgoing } from "lucide-react"
import { useAppContext } from "@/context/AppContext";
import Link from 'next/link';
import ProductShareModal from "./modals/ProductShareModal";
import ShopSelectModal from "./modals/ShopSelectModal";
import { usePathname } from "next/navigation";
import { formatPrice } from "@/helpers/functions";


const ProductCard = ({ product, parsedUser = null }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);


  // console.log("parsedUser", parsedUser?.user_mode);



  const handleCopy = (e) => {
    e.preventDefault();
    if (product?.v_code) {
      // console.log("Original v_code:", product.v_code);

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


      // console.log("pathname", pathname);


  // ID বাদ দিয়ে basePath বের করা
  const basePath =
    "/" +
    pathname
      .split("/")
      .filter(Boolean) // খালি string বাদ দেবে
      .slice(0, -1) // শেষের ID বাদ দেবে
      .join("/");

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
          <div className="font-extrabold text-gray-900 text-xl mb-1">
            {product?.vehicle_price?.user_price !== 'Call for Price' && ''}
            {product?.vehicle_price?.user_price !== 'Call for Price' && 'TK. '}
            {(pathname === '/my-shop/'|| pathname === '/company-shop/')
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

          <div className="flex justify-between gap-2">
            {pathname === '/pb-home/' && (
              <button
                onClick={() => {
                  setShopModalOpen(true);
                }}
                className="
                flex-1
                px-3
                lg:px-4
                md:px-5
                xl:px-3
                3xl:px-4
                py-2
                border-2
                border-green-300
                rounded-lg
                text-green-700
                font-semibold
                hover:bg-green-50
                hover:border-green-400
                active:scale-95
                transition-all
                duration-200"
              >
                <div
                  className="flex items-center justify-center gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  <span className="text-sm">Clone</span>
                </div>
              </button>
            )}
            <button
              onClick={() => setOpen(true)}
              className="
              flex-1
              px-3
              lg:px-4
              md:px-5
              xl:px-3
              3xl:px-4
              py-2
              border-2
              border-gray-300
              rounded-lg
              text-gray-700
              font-semibold
              hover:bg-gray-50
              hover:border-gray-400
              active:scale-95
              transition-all
              duration-200"
            >
              <div
                className="flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </div>
            </button>
            <button
              onClick={() => {
                const phoneNumber = parsedUser?.phone || '+8801969944400';
                window.location.href = `tel:${phoneNumber}`;
              }}
              className="
              flex-1
              lg:px-4
              md:px-5
              xl:px-3
              3xl:px-4
              bg-gradient-to-r 
              from-blue-500 
              to-purple-600 
              text-white 
              font-semibold 
              px-6 py-2 
              rounded-lg 
              hover:from-blue-600 
              hover:to-purple-700 
              transition-all duration-300
              hover:shadow-lg
              active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                <PhoneOutgoing className="h-4 w-4" />
                <span className="text-sm">Call</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <ProductShareModal open={open} setOpen={setOpen} product={product} />
      <ShopSelectModal open={shopModalOpen} setOpen={setShopModalOpen} product={product} />

    </div>
  );
};

export default ProductCard;
