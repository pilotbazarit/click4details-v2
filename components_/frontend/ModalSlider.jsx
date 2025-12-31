'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ModalSlider = ({ setShowModal, images, activeIndex }) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="relative w-full h-full md:w-[80%] md:h-[90%]">
        <button
          className="absolute top-4 right-4 z-50 text-white text-3xl"
          onClick={() => setShowModal(false)}
        >
          &times;
        </button>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          initialSlide={activeIndex}
          loop={true}
          navigation={true}
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination]}
          autoplay={{ delay: 4000 }}
          className="h-full"
        >
          {images.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="flex items-center justify-center h-full">
                <img
                  src={src}
                  alt={`Slide ${i}`}
                  className="object-contain max-h-[90vh] rounded-md"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ModalSlider;
