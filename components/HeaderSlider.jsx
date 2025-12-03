import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import slider1 from '../assets/slider1.jpg';
import slider2 from '../assets/slider2.jpg';
import slider3 from '../assets/slider3.jpg';
import slider4 from '../assets/slider4.jpg';
import slider5 from '../assets/slider5.jpg';


const slides = [
  {
    image: slider1,
    title: 'Click4Details',
    description: 'click4details.app',
  },
  {
    image: slider2,
    title: 'Click4Details',
    description: 'click4details.app',
  },
   {
    image: slider3,
    title: 'Click4Details',
    description: 'click4details.app',
  },
  {
    image: slider4,
    title: 'Click4Details',
    description: 'click4details.app',
  },
  {
    image: slider5,
    title: 'Click4Details',
    description: 'click4details.app',
  }
];

const HeaderSlider = () => {
  return (
    <div className="w-full mx-auto rounded-xl overflow-hidden shadow mb-4 relative bg-white">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="h-[480px]"
      >
        {slides.map((slide, idx) => (


        <SwiperSlide key={idx}>
          <div className="relative w-full h-[320px] md:h-[480px] bg-black">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-object w-full h-full"
              sizes="(max-width: 768px) 100vw, 700px"
              priority={idx === 0}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <h2 className="text-xl font-semibold">{slide.title}</h2>
              <p>{slide.description}</p>
            </div>
          </div>
        </SwiperSlide>


                    // <SwiperSlide key={idx}>
                    //     <div className="relative w-full h-[420px] md:h-[550px] bg-black">
                    //         <Image
                    //             src={slide.image}
                    //             alt={slide.title}
                    //             fill
                    //             className="object-object w-full h-full"
                    //             sizes="(max-width: 768px) 100vw, 700px"
                    //             priority={idx === 0}
                    //         />
                    //     </div>
                    // </SwiperSlide>
                ))}
      </Swiper>
    </div>
  );
};

export default HeaderSlider;
