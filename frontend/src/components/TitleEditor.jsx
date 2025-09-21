import React from 'react';

const TitleEditor = ({ title, originalTitle, onTitleChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Edit Title</h2>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Song Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter song title..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        {originalTitle && (
          <p className="text-sm text-gray-500 mt-2">
            Original: {originalTitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default TitleEditor;