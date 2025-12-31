import React, { useRef } from "react";

const ImageUploader = ({ label, id, images = [], setImages, error }) => {
  const inputRef = useRef();

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    setImages([...images, ...validImages]);
  };

  const handleRemove = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <div className="flex flex-col gap-1 max-w-md">
      {label && <label className="text-base font-medium">{label}</label>}
      <div className="border border-gray-300 rounded px-4 py-3">
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`upload-${index}`}
                className="w-24 h-24 object-cover rounded shadow"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-0 right-0 text-white bg-red-600 rounded-full w-6 h-6 text-sm flex items-center justify-center hidden group-hover:flex"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Upload Images
        </button>
        <input
          type="file"
          id={id}
          ref={inputRef}
          onChange={handleChange}
          multiple
          accept="image/*"
          className="hidden"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default ImageUploader;
