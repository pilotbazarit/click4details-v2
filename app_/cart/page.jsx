'use client'
import React from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { getSessionId } from "@/lib/utils";

const Cart = () => {

  const { router, cartItems, addToCart, updateCartQuantity, removeCartItem, getCartCount, user, currency } = useAppContext();

  console.log("cartItems in cart page", cartItems);


  let parsedUser = null;
  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
  }

  const handleRemoveFromCart = (item) => {
    let cartItem = {
      c_user_id: parsedUser?.id || null,
      c_session_id: parsedUser?.id ? null : getSessionId(),
      ci_product_id: item.ci_product_id,
      ci_type_id: item.ci_type_id
    }

    removeCartItem(cartItem);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Items</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Product Image
                  </th>

                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Product Title
                  </th>
                  
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Price
                  </th>

                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Quantity
                  </th>

                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => {
                  if (!item || item.quantity <= 0) return null;

                  // console.log("cart items", item);

                  const itemId = item.ci_product_id;
                  return (
                    <tr key={index}>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">                          
                            <Image
                              src={item?.ci_url}
                              alt={item?.ci_name}
                              className="w-16 h-auto object-cover mix-blend-multiply"
                              width={1280}
                              height={720}
                            />
                          </div>
                          <button
                            className="md:hidden text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(itemId, 0)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm hidden md:block">
                          <p className="text-gray-800">{item.p_name}</p>
                          <button
                            className="text-xs text-orange-600 mt-1"
                            onClick={() => handleRemoveFromCart(item)}
                            // onClick={() => removeCartItem(item?.ci_type_id)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        <h1 className="text-sm text-gray-800">{item?.ci_name}</h1>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">{currency}{item?.ci_price}</td>
                      {/* <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center md:gap-2 gap-1">
                          <button onClick={() => updateCartQuantity(itemId, item.quantity - 1)}>
                            <Image
                              src={assets.decrease_arrow}
                              alt="decrease_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                          <input onChange={e => updateCartQuantity(itemId, Number(e.target.value))} type="number" value={item.quantity} className="w-8 border text-center appearance-none"></input>
                          <button onClick={() => addToCart(itemId)}>
                            <Image
                              src={assets.increase_arrow}
                              alt="increase_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </td> */}
                      {/* <td className="py-4 md:px-4 px-1 text-gray-600">${(item.offerPrice * item.quantity).toFixed(2)}</td> */}

                      <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center md:gap-2 gap-1">
                          <button
                            // onClick={() => updateCartQuantity(itemId, item?.ci_qty - 1)}
                            onClick={e => updateCartQuantity(itemId, -1)}
                          >
                            <Image
                              src={assets.decrease_arrow}
                              alt="decrease_arrow"
                              className="w-4 h-4"
                            />
                          </button>

                          <input
                            // onChange={e => updateCartQuantity(itemId, Number(e.target.value))}
                            type="number"
                            disabled
                            value={item?.ci_qty}
                            className="w-8 border text-center appearance-none">
                          </input>

                          <button
                            // onClick={() => addToCart(itemId)}
                           onClick={e => updateCartQuantity(itemId, 1)}
                          >
                            <Image
                              src={assets.increase_arrow}
                              alt="increase_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </td>

                      <td className="py-4 md:px-4 px-1 text-gray-600">{currency}{(item?.ci_price * item?.ci_qty).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button onClick={() => router.push('/all-products')} className="group flex items-center mt-6 gap-2 text-orange-600">
            <Image
              className="group-hover:-translate-x-1 transition"
              src={assets.arrow_right_icon_colored}
              alt="arrow_right_icon_colored"
            />
            Continue Shopping
          </button>
        </div>
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
