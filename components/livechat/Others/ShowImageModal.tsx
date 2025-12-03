import { useEffect, useRef, useState } from 'react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ShowImageModal({ imageUrl, onClose }: ImageModalProps) {
  const [imageSize, setImageSize] = useState({ width: 'auto', height: 'auto' });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      const vw = window.innerWidth * 0.9;
      const vh = window.innerHeight * 0.9;

      const widthRatio = vw / naturalWidth;
      const heightRatio = vh / naturalHeight;
      const ratio = Math.min(widthRatio, heightRatio, 1);

      setImageSize({
        width: `${naturalWidth * ratio}px`,
        height: `${naturalHeight * ratio}px`
      });
    };
  }, [imageUrl]);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.setProperty('width', imageSize.width, 'important');
      modalRef.current.style.setProperty(
        'height',
        imageSize.height,
        'important'
      );
    }
  }, [imageSize]);

  return (
    <div
      className='fixed inset-0 z-50 bg-black/70 flex items-center justify-center'
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className='bg-white rounded-lg overflow-hidden shadow-xl max-w-[90vw] max-h-[90vh]'
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt='Modal'
          className='w-full h-full object-contain'
        />
      </div>
    </div>
  );
}
