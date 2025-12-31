"use client";
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { FireExtinguisher, GitBranch, LifeBuoy, MapPin, ReceiptText, Share2, PhoneOutgoing } from "lucide-react"
import { useAppContext } from "@/context/AppContext";
import Link from 'next/link';
import ProductShareModal from "./modals/ProductShareModal";
import { usePathname } from "next/navigation";
import { formatPrice } from "@/helpers/functions";


const ProductCardOld = ({ product }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    if (product?.v_code) {
      console.log("Original v_code:", product.v_code);

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

  return (
    <div>
      <div className="
        relative
        overflow-hidden
        rounded-xl 
        border 
        shadow-sm 
        hover:shadow-xl 
        hover:-translate-y-1 
        transition 
        duration-300 
        ease-in-out 
        p-2 
        bg-white 
        flex 
        flex-col
        font-sans
        min-h-[550px]
      ">

        {/* font-arial
        font-ui-sans-serif */}
        {product?.v_urgent_sale == "1" && (
          <div className="absolute top-0 left-0 w-24 h-24 z-20">
            <div className="absolute transform -rotate-45 bg-orange-600 text-center text-white font-semibold py-1 left-[-34px] top-[24px] w-[150px]">
              Urgent
            </div>
          </div>
        )}
        <Link href={href}>
          <div className="relative">
            {product?.vehicle_front_image?.url && (
              <img
                src={product?.vehicle_front_image.url || 'https://res.cloudinary.com/pilotbazar/image/upload/vehicles/6BM29EuNbGBWwi51Z514ChHfLTLcocKGyD2QJLnv.jpg'}
                alt="Vehicle"
                className="rounded-lg mb-4 w-full h-60 sm:h-72 md:h-72 lg:h-72 xl:h-60 3xl:h-72 object-fit aspect-[3/2] "
              />
            )}
            <div
              onClick={handleCopy}
              className="absolute bottom-3 right-3 bg-[#b3adac] rounded-full px-3 py-1 leading-4 text-xs text-black z-10"
            >
              {copied ? "Copied!" : product?.v_code}
            </div>
          </div>
        </Link>

        <Link href={`/product/${product?.v_id}`}>
          <p className="text-xl leading-7 font-semibold text-black min-h-12">
            {product?.v_title?.length > 56
              ? product.v_title.slice(0, 56) + "..."
              : product.v_title}
          </p>
        </Link>


        <div className="grid grid-cols-3 gap-2 ">
          {/* Condition */}
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm sm:text-base md:text-base lg:text-sm xl:text-sm 2xl:text-base 3xl:text-base 4xl:text-base">Condition</span>
            <span className="font-bold text-black">
              {product?.v_condition_name || 'N/A'}
            </span>
          </div>

          {/* Registration */}
          {
            product.v_grade_name ? (
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm sm:text-base md:text-base lg:text-sm xl:text-sm 2xl:text-base 3xl:text-base 4xl:text-base">Point</span>
                <span className="text-black font-bold">
                  {product?.v_grade_name || 'N/A'} (
                  {[product?.v_int_grade_name, product?.v_ext_grade_name].filter(Boolean).join(' ') || 'N/A'}
                  )

                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm sm:text-base md:text-base lg:text-sm xl:text-sm 2xl:text-base 3xl:text-base 4xl:text-base">Registration</span>
                <span className="text-[#635e5e] font-bold ">
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
            <span className="text-gray-400 text-sm sm:text-base md:text-base lg:text-sm xl:text-sm 2xl:text-base 3xl:text-base 4xl:text-base">Mileage</span>
            <span className=" text-black font-bold">
              {product?.v_mileage || 'N/A'}
            </span>
          </div>
        </div>


        <div className="text-gray-600 text-sm w-full flex mt-1">
          <div className="w-[34%]">
            <span className="text-gray-400 text-sm sm:text-base md:text-base lg:text-sm xl:text-sm 2xl:text-base 3xl:text-base 4xl:text-base">
              {product.v_availability_status
                ? product.v_availability_status.charAt(0).toUpperCase() +
                product.v_availability_status.slice(1) + ' '
                : 'Available '}
            </span>
          </div>
          <div className="w-[66%]">
            {/* {
              product.v_location.location_name && (
                <span className="text-gray-400 text-sm sm:text-base md:text-base lg:text-sm xl:text-sm 2xl:text-base 3xl:text-base 4xl:text-base mr-1">Location:</span>
              )
            } */}
            <span className="text-gray-400 text-sm sm:text-base md:text-base lg:text-sm xl:text-sm 2xl:text-base 3xl:text-base 4xl:text-base">
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


        <div className="mt-1">
          <div className="font-bold  text-black text-xl flex flex-col">
            {product?.vehicle_price?.user_price !== 'Call for Price' && 'TK. '}
            {pathname === '/my-shop/'
              ? formatPrice(product?.vehicle_price?.user_price)
              : formatPrice(product?.vehicle_price?.pbl_price)
            }
            {/* {product?.vehicle_price?.user_price != 'Call for Price' && 'TK.'} {pathname == '/my-shop/' ? product?.vehicle_price?.user_price : product?.vehicle_price?.pbl_price} */}
          </div>

          {
            pathname !== '/pb-home/' ? (
              <span className="text-gray-500">
                {product?.vehicle_db_price?.vp_pbl_price_status
                  ? String(product.vehicle_db_price.vp_pbl_price_status).charAt(0).toUpperCase() +
                  String(product.vehicle_db_price.vp_pbl_price_status).slice(1)
                  : ''}
              </span>
            ) : (
              <span className="text-gray-500">
                {product?.vehicle_db_price?.vp_user_price_status
                  ? String(product.vehicle_db_price.vp_user_price_status).charAt(0).toUpperCase() +
                  String(product.vehicle_db_price.vp_user_price_status).slice(1)
                  : ''}
              </span>
            )
          }

        </div>

        <div className="flex justify-between gap-2 mt-1">
          <button
            onClick={() => setOpen(true)}
            className="
            px-6 
            lg:px-6 
            md:px-8
            xl:px-4
            3xl:px-6
            py-2
            border 
            border-gray-300 
            rounded-md 
            text-gray-600 
            hover:bg-gray-100 
            transition"
          >
            <div
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" /> Share
            </div>
          </button>
          <button className="
            px-6 
            lg:px-6 
            md:px-8
            xl:px-4
            3xl:px-6
            py-2
            border 
            bg-gray-200 
            border-gray-300 
            rounded-md 
            text-gray-600 
            hover:bg-gray-100 
            transition"
          >
            <div className="flex items-center gap-1">
              <PhoneOutgoing className="h-4 w-4" />Call Now
            </div>
          </button>
        </div>
      </div>

      <ProductShareModal open={open} setOpen={setOpen} product={product} />

    </div>
  );
};

export default ProductCardOld;
