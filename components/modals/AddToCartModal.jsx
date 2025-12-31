"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

const AddToCartModal = ({ open, setOpen, product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Set first variant as selected when modal opens
  React.useEffect(() => {
    if (open && product?.prices && product.prices.length > 0) {
      setSelectedVariant(product.prices[0]);
    } else if (open && (!product?.prices || product.prices.length === 0)) {
      setSelectedVariant({ pp_id: 'default' });
    }
  }, [open, product]);

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return '0.00';
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedVariant);
    setOpen(false);
  };


  // console.log("add to cart modal product", product);
  // console.log("add to cart modal selectedVariant", selectedVariant);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setOpen(false)}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-lg w-[90%] max-w-md mx-4 overflow-hidden">
        {/* Header with Product Image and Info */}
        <div className="flex items-start gap-3 p-4 border-b">
          {product?.p_primary_image?.url && (
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src={product.p_primary_image.url}
                alt={product?.p_name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
              {product?.p_name}
            </h3>
            <p className="text-lg font-bold text-blue-600 mt-1">
              {/* ৳ {formatPrice(product?.prices && product?.prices[0]?.pp_discount_price)} */}
              ৳ {formatPrice(selectedVariant?.pp_regular_price)}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Variant Selection */}
        <div className="p-4">
          <h4 className="text-base font-semibold text-gray-900 mb-3">
            Select Variant
          </h4>

          {/* Variant Options */}
          <div className="space-y-2">
            {product?.prices && product.prices.map((item, index) => (
              <div
                key={index}
                onClick={() => setSelectedVariant(item)}
                className={`
                  flex items-center justify-between
                  p-3 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${selectedVariant?.pp_product_id === item.pp_product_id
                    ? 'border-[3px] border-blue-500 bg-blue-50'
                    : 'border-2 border-gray-300 hover:border-gray-400 bg-white'
                  }
                `}
              >
                <span className={`font-medium ${selectedVariant?.pp_id === item.pp_id ? 'text-blue-900' : 'text-gray-700'}`}>
                  {item?.unit?.md_title}
                </span>
                <span className={`text-lg font-bold ${selectedVariant?.pp_id === item.pp_id ? 'text-blue-600' : 'text-gray-600'}`}>
                  ৳ {formatPrice(item?.pp_regular_price)}
                </span>
              </div>
            ))}

            {/* Default variant if no prices array */}
            {(!product?.prices || product.prices.length === 0) && (
              <div
                onClick={() => setSelectedVariant({ pp_id: 'default' })}
                className={`
                  flex items-center justify-between
                  p-3 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${selectedVariant?.pp_id === 'default'
                    ? 'border-[3px] border-blue-500 bg-blue-50'
                    : 'border-2 border-gray-300 hover:border-gray-400 bg-white'
                  }
                `}
              >
                <span className={`font-medium ${selectedVariant?.pp_id === 'default' ? 'text-blue-900' : 'text-gray-700'}`}>Sq/ft</span>
                <span className={`text-lg font-bold ${selectedVariant?.pp_id === 'default' ? 'text-blue-600' : 'text-gray-600'}`}>
                  ৳ {formatPrice(product?.prices && product?.prices[0]?.pp_discount_price)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="p-4">
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className={`
              w-full py-3 rounded-full font-semibold text-white
              transition-all duration-200
              ${selectedVariant
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
