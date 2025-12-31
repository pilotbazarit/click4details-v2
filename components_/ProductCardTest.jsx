'use client'

import { useRouter } from 'next/navigation'

const ProductCard = ({ product }) => {
  const router = useRouter()

  const goToDetails = () => {
    // Save full product data to localStorage
    localStorage.setItem('productData', JSON.stringify(product))

    // Navigate to dynamic route
    router.push(`/product/${product.v_id}`)
  }

  return (
    <div>
      <h2>{product.title}</h2>
      <button onClick={goToDetails}>View Details</button>
    </div>
  )
}

export default ProductCard
