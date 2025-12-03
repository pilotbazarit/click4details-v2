"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const images = [
  "https://res.cloudinary.com/pilotbazar/image/upload/galleries/mrmFyHeqb7T3Xzr18wwHA5l1lIHy2dshqVyrMZVG.jpg",
  "https://res.cloudinary.com/pilotbazar/image/upload/galleries/renweLC1uWc4W7YsKynp3qk0sWvAMWynXhNPeAsk.jpg",
  "https://res.cloudinary.com/pilotbazar/image/upload/galleries/gibslWtf359HUqqkYy6Sb6I1X1H6oiOR5XIZkdVe.jpg",
  "https://res.cloudinary.com/pilotbazar/image/upload/galleries/gibslWtf359HUqqkYy6Sb6I1X1H6oiOR5XIZkdVe.jpg",
];

export default function ProductDetailsSlider() {
  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleImageClick = (index) => {
    setActiveIndex(index);
    setShowModal(true);
  };

  return (
    <>
      {/* Main Slider */}
      <Swiper
        spaceBetween={10}
        slidesPerView={1}
        modules={[Navigation]}
        navigation
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <img
              src={src}
              alt={`Image ${index}`}
            //   onClick={() => handleImageClick(index)}
              className="cursor-pointer rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Modal Slider */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="w-[90%] max-w-4xl">
            <button
              className="text-white absolute top-4 right-6 text-2xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <Swiper
              spaceBetween={10}
              slidesPerView={1}
              initialSlide={activeIndex}
              modules={[Pagination]}
              pagination={{ clickable: true }}
            >
              {images.map((src, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={src}
                    alt={`Modal Image ${index}`}
                    className="rounded-lg w-full h-auto object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </>
  );
}