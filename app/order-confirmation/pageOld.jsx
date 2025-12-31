'use client'

import { useAppContext } from '@/context/AppContext'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import OrderService from '@/services/OrderService'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import Link from 'next/link'
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin } from 'react-icons/fi'

const OrderConfirmation = () => {
  const { router } = useAppContext()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await OrderService.Queries.getOrderDetails(orderId)

      if (response.status === 200 && response.data) {
        setOrderData(response.data)
      } else {
        setError('Failed to fetch order details')
      }
    } catch (err) {
      console.error('Error fetching order details:', err)
      setError('Failed to load order information')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price || 0)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col justify-center items-center gap-5'>
        <div className="flex justify-center items-center relative">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-500 border-gray-200"></div>
        </div>
        <div className="text-center text-xl font-semibold text-gray-600">Loading order details...</div>
      </div>
    )
  }

  if (error && !orderData) {
    return (
      <div className='min-h-screen flex flex-col justify-center items-center gap-5 p-4'>
        <div className="text-red-500 text-6xl">⚠️</div>
        <div className="text-center text-2xl font-semibold text-gray-800">{error}</div>
        <Link href="/my-orders" className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          View My Orders
        </Link>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Success Header */}
        <div className='bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6 text-center'>
          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <Image className="absolute p-3" src={assets.checkmark} alt='' width={80} height={80} />
              <div className="animate-pulse rounded-full h-20 w-20 border-4 border-green-500 border-opacity-20"></div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {orderId && (
            <div className="mt-4 inline-block bg-green-50 px-6 py-3 rounded-lg">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="text-xl font-semibold text-green-600">#{orderId}</p>
            </div>
          )}
        </div>

        {/* Order Timeline */}
        <div className='bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6'>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Status</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>

            {/* Timeline Steps */}
            <div className="space-y-8">
              {/* Order Placed */}
              <div className="relative flex items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white z-10">
                  <FiCheckCircle className="w-6 h-6" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-800">Order Placed</h3>
                  <p className="text-sm text-gray-600">
                    {orderData?.created_at ? formatDate(orderData.created_at) : 'Just now'}
                  </p>
                </div>
              </div>

              {/* Processing */}
              <div className="relative flex items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-400 z-10">
                  <FiPackage className="w-6 h-6" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-400">Processing</h3>
                  <p className="text-sm text-gray-400">We're preparing your order</p>
                </div>
              </div>

              {/* Shipped */}
              <div className="relative flex items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-400 z-10">
                  <FiTruck className="w-6 h-6" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-400">Shipped</h3>
                  <p className="text-sm text-gray-400">On the way to you</p>
                </div>
              </div>

              {/* Delivered */}
              <div className="relative flex items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-400 z-10">
                  <FiMapPin className="w-6 h-6" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-400">Delivered</h3>
                  <p className="text-sm text-gray-400">Order delivered successfully</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        {orderData && (
          <div className='bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6'>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Delivery Address</h3>
                <div className="text-gray-600 space-y-1">
                  {orderData.delivery_name && <p className="font-medium">{orderData.delivery_name}</p>}
                  {orderData.delivery_phone && <p>{orderData.delivery_phone}</p>}
                  {orderData.delivery_address && <p>{orderData.delivery_address}</p>}
                  {orderData.delivery_district && <p>{orderData.delivery_district}</p>}
                  {orderData.delivery_upazila && <p>{orderData.delivery_upazila}</p>}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Payment Information</h3>
                <div className="text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium">
                      {orderData.payment_method === 'cod' ? 'Cash on Delivery' : orderData.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className={`font-medium ${
                      orderData.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {orderData.payment_status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {item.product_image && (
                          <Image
                            src={item.product_image}
                            alt={item.product_name || 'Product'}
                            width={60}
                            height={60}
                            className="rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{item.product_name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatPrice(orderData.subtotal || orderData.total_amount)}</span>
                </div>
                {orderData.delivery_charge && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge:</span>
                    <span>{formatPrice(orderData.delivery_charge)}</span>
                  </div>
                )}
                {orderData.discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(orderData.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatPrice(orderData.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href="/my-orders"
            className="px-8 py-3 bg-green-500 text-white text-center rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="px-8 py-3 bg-white border-2 border-green-500 text-green-500 text-center rounded-lg hover:bg-green-50 transition-colors font-semibold"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Additional Info */}
        <div className='mt-8 text-center text-gray-600'>
          <p>We've sent a confirmation email to your registered email address.</p>
          <p className="mt-2">Need help? <Link href="/contact-us" className="text-green-500 hover:underline">Contact us</Link></p>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
