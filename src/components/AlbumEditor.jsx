import React from 'react';

const AlbumEditor = ({ album, originalAlbum, onAlbumChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Edit Album Name</h2>
      <div>
        <label htmlFor="album" className="block text-sm font-medium text-gray-700 mb-2">
          Album Name
        </label>
        <input
          type="text"
          id="album"
          value={album}
          onChange={(e) => onAlbumChange(e.target.value)}
          placeholder="Enter album name..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        {originalAlbum && (
          <p className="text-sm text-gray-500 mt-2">
            Original: {originalAlbum}
          </p>
        )}
      </div>
    </div>
  );
};

export default AlbumEditor;