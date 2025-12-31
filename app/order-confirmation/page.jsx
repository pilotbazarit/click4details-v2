'use client'

import { assets } from '@/assets/assets'
import Image from 'next/image'
import Link from 'next/link'
// import { FiCheckCircle } from 'react-icons/fi'

const OrderConfirmation = () => {
  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Success Header */}
        <div className='bg-white rounded-lg shadow-md p-8 sm:p-12 mb-6 text-center'>
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <Image
                className="absolute p-3"
                src={assets.checkmark}
                alt='Success'
                width={80}
                height={80}
              />
              <div className="animate-pulse rounded-full h-20 w-20 border-4 border-green-500 border-opacity-20"></div>
            </div>
          </div>

          {/* <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /> */}

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Thank You for Your Order!
          </h1>

          <p className="text-gray-600 text-lg mb-2">
            Your order has been placed successfully.
          </p>

          <p className="text-gray-500">
            We will contact you shortly to confirm your order details.
          </p>
        </div>

        {/* Information Card */}
        <div className='bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6'>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Next?</h2>

          <div className="space-y-3 text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-semibold">1</span>
              </div>
              <p>Our team will review your order and contact you for confirmation</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-semibold">2</span>
              </div>
              <p>We will prepare your order for delivery</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-semibold">3</span>
              </div>
              <p>Your order will be delivered to your address</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href="/"
            className="px-8 py-3 bg-green-500 text-white text-center rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Continue Shopping
          </Link>
          <Link
            href="/my-orders"
            className="px-8 py-3 bg-white border-2 border-green-500 text-green-500 text-center rounded-lg hover:bg-green-50 transition-colors font-semibold"
          >
            View My Orders
          </Link>
        </div>

        {/* Additional Info */}
        <div className='mt-8 text-center text-gray-600'>
          <p>Need help? <Link href="/contact-us" className="text-green-500 hover:underline font-medium">Contact us</Link></p>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
