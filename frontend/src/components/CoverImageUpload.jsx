import React, { useRef } from 'react';
import { Image } from 'lucide-react';

const CoverImageUpload = ({ coverImage, onImageUpload }) => {
  const imageInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    onImageUpload(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Upload Cover Image</h2>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
        >
          Choose cover image
        </label>
        <p className="text-sm text-gray-500 mt-1">JPG, PNG, or other image formats</p>
        {coverImage && (
          <div className="mt-3 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
            ✓ {coverImage.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverImageUpload;