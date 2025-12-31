'use client'
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { addressDummyData } from "@/assets/assets";
import { formatPrice } from "@/helpers/functions";

const Checkout = () => {
  const { currency, router, getCartCount, getCartAmount, cartItems } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');

  const fetchUserAddresses = async () => {
    // setUserAddresses(addressDummyData);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    // TODO: Implement order placement API call
    console.log('Order Details:', {
      address: selectedAddress,
      paymentMethod,
      items: cartItems,
      total: getCartAmount()
    });

    // Navigate to order confirmation page
    router.push('/order-confirmation');
  };

  useEffect(() => {
    fetchUserAddresses();

    // Redirect to cart if no items
    if (getCartCount() === 0) {
      router.push('/cart');
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <h1 className="text-2xl md:text-3xl font-medium text-gray-700 mb-8">
          Checkout & Sign Up
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Section - Address & Payment */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                Sign Up
              </h2>

              {/* Registration Form */}
              <form className="space-y-4">
                {/* Row 1: Name and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      placeholder="+8801XXXXXXXXX"
                    />
                  </div>
                </div>

                {/* Row 2: Email and Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      placeholder="name@company.com"
                    />
                  </div><br />
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    />
                  </div>
                  
                  <div>
                    <label
                      htmlFor="password_confirmation"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      id="password_confirmation"
                      placeholder="••••••••"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    />
                  </div>

                 
                </div>

                {/* Row 3: Confirm Password */}

              </form>
            </div>

            {/* Billing and Shipping Address Section */}
            <div className="bg-white border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Address */}
                <div>
                  <h2 className="text-xl font-medium text-gray-700 mb-4">
                    Billing Address
                  </h2>

                  <div className="relative w-full text-sm">
                    <div>
                      <textarea
                        name="billing_address"
                        id="billing_address"
                        rows={4}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        placeholder="Your billing address"
                      ></textarea>
                    </div>
                  </div>

                  {selectedAddress && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
                      <p className="font-medium text-gray-700">{selectedAddress.fullName}</p>
                      <p className="text-gray-600 text-sm mt-1">{selectedAddress.phoneNumber}</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {selectedAddress.area}, {selectedAddress.city}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedAddress.state} - {selectedAddress.zipCode}
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-xl font-medium text-gray-700 mb-4">
                    Shipping Address
                  </h2>

                  <div className="relative w-full text-sm">
                    <div>
                      <textarea
                        name="shipping_address"
                        id="shipping_address"
                        rows={4}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        placeholder="Your shipping address"
                      ></textarea>
                    </div>
                  </div>

                  {selectedAddress && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
                      <p className="font-medium text-gray-700">{selectedAddress.fullName}</p>
                      <p className="text-gray-600 text-sm mt-1">{selectedAddress.phoneNumber}</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {selectedAddress.area}, {selectedAddress.city}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedAddress.state} - {selectedAddress.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>

          {/* Right Section - Order Summary */}
          <div className="w-full lg:w-96">

            {/* Payment Method Section */}
            <div className="bg-white border border-gray-200 p-6 mb-2">
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-700">Cash on Delivery</span>
                </label>

                <label className="flex items-center p-4 border border-gray-300 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-700">Online Payment</span>
                </label>

                <label className="flex items-center p-4 border border-gray-300 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-700">Credit/Debit Card</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-500/5 p-6 border border-gray-200 sticky top-20">
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                Order Summary
              </h2>

              <hr className="border-gray-500/30 mb-4" />

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-base">
                  <p className="text-gray-600">Items ({getCartCount()})</p>
                  <p className="text-gray-800 font-medium">
                    {currency}
                    {formatPrice(getCartAmount())}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Shipping Fee</p>
                  <p className="font-medium text-gray-800">Free</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Tax (0%)</p>
                  <p className="font-medium text-gray-800">
                    {currency}
                    {Math.floor(getCartAmount() * 0.0)}
                  </p>
                </div>
              </div>

              <hr className="border-gray-500/30 mb-4" />

              <div className="flex justify-between text-lg md:text-xl font-medium mb-6">
                <p className="text-gray-700">Total</p>
                <p className="text-gray-900">
                  {currency}
                  {formatPrice(getCartAmount() + Math.floor(getCartAmount() * 0.0))}
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-blue-600 text-white py-3 hover:bg-orange-700 transition"
              >
                Confirm Order
              </button>

              <button
                onClick={() => router.push('/cart')}
                className="w-full border border-gray-300 text-gray-700 py-3 mt-3 hover:bg-gray-50 transition"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
