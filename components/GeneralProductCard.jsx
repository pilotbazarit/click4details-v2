"use client";
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { FireExtinguisher, GitBranch, LifeBuoy, MapPin, ReceiptText, Share2, PhoneOutgoing } from "lucide-react"
import { useAppContext } from "@/context/AppContext";
import Link from 'next/link';
import ProductShareModal from "./modals/ProductShareModal";
import AddToCartModal from "./modals/AddToCartModal";
import { usePathname } from "next/navigation";
import { getSessionId } from "@/lib/utils";


const GeneralProductCard = ({ product }) => {
  const [open, setOpen] = useState(false);
  const [addToCartModalOpen, setAddToCartModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { cartItems, setCartItems, addToCart, user } = useAppContext();

  const handleCopy = (e) => {
    e.preventDefault();
    if (product?.p_code) {
      const cleanedCode = product.p_code.replace(/^[^-]*-/, "");
      navigator.clipboard.writeText(cleanedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const pathname = usePathname();
  const href =
    pathname.startsWith("/my-shop/") || pathname.startsWith("/company-shop/") || pathname.startsWith("/member-shop/") || pathname.startsWith("/user-shop/")
      ? `/general-product/my-shop/${product?.p_slug}`
      : `/general-product/${product?.p_slug}`;


  // ID বাদ দিয়ে basePath বের করা
  const basePath =
    "/" +
    pathname
      .split("/")
      .filter(Boolean) // খালি string বাদ দেবে
      .slice(0, -1) // শেষের ID বাদ দেবে
      .join("/");


  const formatPrice = (price) => {
    // Convert the input to a number.
    const numericPrice = parseFloat(price);

    // Check if the price is a valid number. If not, return a default value.
    if (isNaN(numericPrice)) {
      return '0.00';
    }

    // Create a formatter for US English which uses commas for thousands 
    // and ensure exactly two decimal places.
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  };

  // console.log("cartItems", cartItems);

    let parsedUser = null;
    try {
      parsedUser = user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
  
    // console.log("cartItems cart page", cartItems);
    // console.log("user Info", parsedUser?.id);


  const handleAddToCart = (item) => {
    // Implement add to cart functionality here

    let price = product?.prices && product?.prices[0]?.pp_discount_price;

    let cartItem = {
      c_user_id: parsedUser?.id || null,
      c_session_id: parsedUser?.id ? null : getSessionId(),
      ci_product_id: item.p_id,
      ci_type_id: item.p_type_id,
      ci_qty: 1,
      ci_price: price || 0,
      ci_url: item.p_primary_image?.url || '',
      ci_name: item.p_name,
      ci_subtotal: price * 1,
    }

    addToCart(item.p_id, cartItem);
  }

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
        min-h-[450px]
      ">

        {/* font-arial
        font-ui-sans-serif */}
        {/* {product?.v_urgent_sale == "1" && ( */}
        {/* <div className="absolute top-0 left-0 w-24 h-24 z-20">
            <div className="absolute transform -rotate-45 bg-orange-600 text-center text-white font-semibold py-1 left-[-34px] top-[24px] w-[150px]">
              Urgent
            </div>
          </div> */}
        {/* // )} */}
        <Link href={href}>
          <div className="relative">
            {product?.p_primary_image?.url && (
              <img
                src={product?.p_primary_image.url || 'https://res.cloudinary.com/pilotbazar/image/upload/vehicles/6BM29EuNbGBWwi51Z514ChHfLTLcocKGyD2QJLnv.jpg'}
                alt="Vehicle"
                className="rounded-lg mb-4 w-full h-60 sm:h-72 md:h-72 lg:h-72 xl:h-60 3xl:h-72 object-fit aspect-[3/2] "
              />
            )}
            <div
              onClick={handleCopy}
              className="absolute bottom-3 right-3 bg-[#b3adac] rounded-full px-3 py-1 leading-4 text-xs text-black z-10"
            >
              {copied ? "Copied!" : product?.p_code}
            </div>
          </div>
        </Link>

        {/* {
          console.log("product:::=============================", product)
        } */}

        {/* <Link href={`/product/${product?.v_id}`}> */}
        {/* <Link href={`#`}> */}
        <Link href={`/general-product/${product?.p_slug}`}>
          <p className="text-xl leading-7 font-semibold text-gray-750 min-h-12">
            {product?.p_name?.length > 56
              ? product.p_name.slice(0, 56) + "..."
              : product.p_name}
          </p>
        </Link>

        {/* product details section */}
        <div className="mt-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <p className="text-orange-600 font-bold text-lg">
                ৳{formatPrice(product?.prices && product?.prices[0]?.pp_regular_price)}
              </p>
              {/* <p className="text-gray-500 line-through text-sm">
                ৳{formatPrice(product?.prices && product?.prices[0]?.pp_regular_price)}
              </p> */}
            </div>
            <div>
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
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => setAddToCartModalOpen(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <ProductShareModal open={open} setOpen={setOpen} product={product} />

      <AddToCartModal
        open={addToCartModalOpen}
        setOpen={setAddToCartModalOpen}
        product={product}
        onAddToCart={handleAddToCart}
      />

    </div>
  );
};

export default GeneralProductCard;
