import React from 'react';
import { Music, CheckCircle } from 'lucide-react';

const Header = ({ isTelegramApp, librariesLoaded }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Music className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">MP3 Metadata Editor</h1>
      </div>
      <p className="text-gray-600">
        Upload an MP3 file, customize its title and cover art, then download the updated version.
      </p>
      
      {/* Library Status */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        {librariesLoaded ? (
          <div className="text-green-600 bg-green-50 px-3 py-2 rounded-md flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Libraries loaded - Ready to process files
          </div>
        ) : (
          <div className="text-blue-600 bg-blue-50 px-3 py-2 rounded-md flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Loading libraries...
          </div>
        )}
      </div>
      
      {/* Telegram Status Indicator */}
      {isTelegramApp && (
        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
          <CheckCircle className="w-4 h-4" />
          Running as Telegram Mini App
        </div>
      )}
    </div>
  );
};

export default Header;