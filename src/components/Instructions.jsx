import React from 'react';

const Instructions = () => {
  return (
    <div className="mt-8 bg-blue-50 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
      <ol className="text-sm text-blue-800 space-y-1">
        <li>1. Upload your MP3 file</li>
        <li>2. (Optional) Upload a new cover image</li>
        <li>3. Edit the artist name</li>
        <li>4. Edit the album name</li>
        <li>5. Click "Apply & Download" to get your updated MP3</li>
      </ol>
    </div>
  );
};

export default Instructions;