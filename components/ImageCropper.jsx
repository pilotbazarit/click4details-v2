import React, { useRef, useEffect, useState, useCallback } from 'react';
import Croppie from 'croppie';
import 'croppie/croppie.css';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const ImageCropper = ({ onCrop, initialImage = null }) => {
    const croppieRef = useRef(null);
    const [croppieInstance, setCroppieInstance] = useState(null);
    const [imageSrc, setImageSrc] = useState(initialImage);
    const [fileSelected, setFileSelected] = useState(!!initialImage);

    const getResponsiveOptions = useCallback(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const boundaryWidth = isMobile ? window.innerWidth - 80 : 600;
        const boundaryHeight = isMobile ? 300 : 400;
        const viewportWidth = isMobile ? boundaryWidth - 40 : 525;
        const viewportHeight = isMobile ? (viewportWidth * 2) / 3.5 : 300;

        return {
            viewport: { width: Math.round(viewportWidth), height: Math.round(viewportHeight), type: 'square' },
            boundary: { width: boundaryWidth, height: boundaryHeight },
            showZoomer: true,
            enableResize: false,
            enableOrientation: true,
            mouseWheelZoom: 'ctrl',
        };
    }, []);

    const [croppieOptions, setCroppieOptions] = useState(() => getResponsiveOptions());

    useEffect(() => {
        const handleResize = () => {
            setCroppieOptions(getResponsiveOptions());
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [getResponsiveOptions]);

    useEffect(() => {
        let instance;
        if (croppieRef.current) {
            instance = new Croppie(croppieRef.current, croppieOptions);
            setCroppieInstance(instance);

            if (imageSrc) {
                instance.bind({ url: imageSrc });
            }
        }
        return () => {
            if (instance) {
                instance.destroy();
            }
        };
    }, [croppieOptions, imageSrc]);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileSelected(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCrop = async () => {
        if (croppieInstance) {
            const result = await croppieInstance.result({
                type: 'base64',
                size: 'viewport',
                format: 'png',
                quality: 0.8,
            });
            onCrop(result);
            toast.success('Image cropped successfully!');
        }
    };

    return (
        <div className="flex flex-col items-center p-2 sm:p-4 border-t border-b border-gray-200">
            <label htmlFor="file-upload" className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-1.5 px-3 rounded-md transition duration-300 ease-in-out flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                {fileSelected ? "Change Visiting Card" : "Upload Visiting Card"}
            </label>
            <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="mt-3 w-full flex flex-col items-center">
                {imageSrc && (
                    <p className="text-xs text-gray-600 mb-1">Adjust the image within the boundary:</p>
                )}
                <div ref={croppieRef} style={{ width: croppieOptions.boundary.width, height: croppieOptions.boundary.height }} className="mb-3"></div>
                {imageSrc && (
                    <Button
                        type="button"
                        onClick={handleCrop}
                        className="w-full sm:w-auto mt-8"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Crop Image
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ImageCropper;