// app/product/[slug]/page.jsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('productData')
    if (data) {
      setProduct(JSON.parse(data))
    }
  }, [slug])

  if (!product) return <div>Loading...</div>

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>Price: {product.price}</p>
    </div>
  )
}

