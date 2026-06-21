import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import ModalSlider from './ModalSlider';

export default function ProductDetailsSlider({ images = [] }) {
    const progressCircle = useRef(null);
    const progressContent = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const onAutoplayTimeLeft = (s, time, progress) => {
        if (!progressCircle.current || !progressContent.current) return;
        progressCircle.current.style.setProperty('--progress', 1 - progress);
        progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    };

    const handleImageClick = (index) => {
        setActiveIndex(index);
        setShowModal(true);
    };

    // const images = [
    //     "https://res.cloudinary.com/pilotbazar/image/upload/galleries/mrmFyHeqb7T3Xzr18wwHA5l1lIHy2dshqVyrMZVG.jpg",
    //     "https://res.cloudinary.com/pilotbazar/image/upload/galleries/renweLC1uWc4W7YsKynp3qk0sWvAMWynXhNPeAsk.jpg",
    //     "https://res.cloudinary.com/pilotbazar/image/upload/galleries/gibslWtf359HUqqkYy6Sb6I1X1H6oiOR5XIZkdVe.jpg",
    //     "https://res.cloudinary.com/pilotbazar/image/upload/galleries/gibslWtf359HUqqkYy6Sb6I1X1H6oiOR5XIZkdVe.jpg",
    // ];

    if (!images.length) {
        return (
            <div className="flex h-[320px] w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-500 md:h-[560px]">
                No image available
            </div>
        );
    }

    return (
        <>
            <Swiper
                spaceBetween={30}
                centeredSlides={true}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                onAutoplayTimeLeft={onAutoplayTimeLeft}
                className="mySwiper rounded-lg bg-slate-100"
            >
                {images.map((src, index) => (
                    <SwiperSlide key={index}>
                        <img
                            src={src}
                            alt={`Image ${index}`}
                            onClick={() => handleImageClick(index)}
                            className="
                                h-[320px]
                                w-full
                                cursor-pointer
                                rounded-lg
                                bg-slate-100
                                object-contain
                                sm:h-[420px]
                                md:h-[560px]
                                lg:h-[640px]"
                        />
                    </SwiperSlide>
                ))}
                <div className="autoplay-progress" slot="container-end">
                    <svg viewBox="0 0 48 48" ref={progressCircle}>
                        <circle cx="24" cy="24" r="20"></circle>
                    </svg>
                    <span ref={progressContent}></span>
                </div>
            </Swiper>


            {/* Modal Slider */}
            {showModal && (
                <ModalSlider setShowModal={setShowModal} images={images} activeIndex={activeIndex} />
            )}
        </>
    );
}
