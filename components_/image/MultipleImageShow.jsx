import React from 'react'
import { X } from "lucide-react"

const MultipleImageShow = ({images, setImages}) => {


        
     const handleImageChange = (e) => {
            const files = e.target.files
            if (files) {
                const newFiles = Array.from(files)
    
                // Filter out duplicates (by name and size)
                const uniqueNewFiles = newFiles.filter(
                    (newFile) =>
                        !images.some(
                            (existingFile) =>
                                existingFile.name === newFile.name &&
                                existingFile.size === newFile.size
                        )
                )
    
                setImages((prev) => [...prev, ...uniqueNewFiles])
            }
        }
  

    const handleImageDelete = (indexToRemove) => {
        setImages((prev) => prev.filter((_, index) => index !== indexToRemove))
    }


    return (
        <>
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 h-24 overflow-y-auto">
                    {images.map((file, index) => (
                        <div
                            key={index}
                            className="relative w-24 h-24 border rounded overflow-hidden group shrink-0"
                        >
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`preview-${index}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => handleImageDelete(index)}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}

export default MultipleImageShow