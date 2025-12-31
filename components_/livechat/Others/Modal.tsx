import { X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

type ModalProps = {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
};

const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  children,
  title,
  className
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus the modal when it's visible
  useEffect(() => {
    if (isVisible && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isVisible]);

  // Handle closing the modal when the ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay to reduce background opacity */}
      <div
        className='fixed top-0 left-0 w-[100vw] h-[100vh] bg-black bg-opacity-50 z-[999] mt-0'
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        tabIndex={-1} // Make the modal focusable
        className={`translate-x-[-50%] translate-y-[-50%] shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-lg z-[9999999999999] p-5 bg-white fixed left-[50%] top-[50%] w-[400px] max-h-[450px] overflow-y-auto text-sm !outline-none !mt-0 ${className}`}
        role='dialog'
        aria-modal='true'
      >
        <div className='flex items-center justify-between'>
          <span className='text-base font-bold'>{title}</span>
          <button onClick={onClose} className='mt-auto cursor-pointer'>
            <X className='w-5 h-5' />{' '}
          </button>
        </div>
        <div className='mt-4'>{children}</div>
      </div>
    </>
  );
};

export default Modal;
