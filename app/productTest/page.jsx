'use client'
import React from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation'

const ProductCard = ({ product }) => {
  const router = useRouter();

  const productDetailsNavigate = (id) => {
    router.push(`/product/${id}`); // simplified for app router
  }

  return (
    <div className="flex flex-col items-start gap-0.5 max-w-[400px] w-full cursor-pointer border rounded-lg p-2">
      <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-50 flex items-center justify-center">
        <Image
          src={product?.vehicle_front_image || 'https://res.cloudinary.com/pilotbazar/image/upload/galleries/bsFyIRLmLPXFZETCOTgDHpbTml5ayF341bXCkIFL.jpg'}
          alt="image name"
          className="group-hover:scale-105 transition h-[210px] sm:h-[210px] md:w-full md:h-full rounded-lg object-cover"
          width={800}
          height={800}
          onClick={() => productDetailsNavigate(product?.v_id)}
        />
      </div>
    </div>
  );
};

export default ProductCard;
