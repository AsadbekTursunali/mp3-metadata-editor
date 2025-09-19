import React from 'react';

const ArtistEditor = ({ artist, originalArtist, onArtistChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Edit Artist Name</h2>
      <div>
        <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
          Artist Name
        </label>
        <input
          type="text"
          id="artist"
          value={artist}
          onChange={(e) => onArtistChange(e.target.value)}
          placeholder="Enter artist name..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        {originalArtist && (
          <p className="text-sm text-gray-500 mt-2">
            Original: {originalArtist}
          </p>
        )}
      </div>
    </div>
  );
};

export default ArtistEditor;