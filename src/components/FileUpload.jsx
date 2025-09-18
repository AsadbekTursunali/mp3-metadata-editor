import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

const FileUpload = ({ mp3File, onMp3Upload }) => {
  const mp3InputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    onMp3Upload(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Upload MP3 File</h2>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <input
          ref={mp3InputRef}
          type="file"
          accept=".mp3,audio/mpeg"
          onChange={handleFileChange}
          className="hidden"
          id="mp3-upload"
        />
        <label
          htmlFor="mp3-upload"
          className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
        >
          Choose MP3 file
        </label>
        <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
        {mp3File && (
          <div className="mt-3 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
            ✓ {mp3File.name} ({(mp3File.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;