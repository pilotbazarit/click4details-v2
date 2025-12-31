// components/ImageCropperModal.jsx
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'; // Assuming you have a UI library setup like this
import ImageCropper from './ImageCropper';
import { Button } from '@/components/ui/button'; // Assuming a button component

const ImageCropperModal = ({ isOpen, onClose, onCropComplete, initialImage }) => {
    let croppedImage = null;

    const handleCrop = (data) => {
        croppedImage = data;
    };

    const handleConfirm = () => {
        if (croppedImage) {
            onCropComplete(croppedImage);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-11/12 max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Crop Your Image</DialogTitle>
                    <DialogDescription>
                        Adjust the image and click "Confirm" when you're done.
                    </DialogDescription>
                </DialogHeader>
                
                <ImageCropper onCrop={handleCrop} initialImage={initialImage} />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropperModal;