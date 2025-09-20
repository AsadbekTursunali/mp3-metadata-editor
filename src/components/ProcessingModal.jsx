import React from 'react';
import { Music, Upload } from 'lucide-react';

const ProcessingModal = ({ isOpen, step }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="relative mb-4">
            <Music className="w-16 h-16 text-blue-600 mx-auto animate-pulse" />
            <Upload className="w-6 h-6 text-blue-400 absolute top-0 right-1/2 transform translate-x-1/2 animate-bounce" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Processing MP3</h3>
          
          <p className="text-gray-600 text-sm mb-4">
            {step || 'Processing your file...'}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
          </div>
          
          <p className="text-xs text-gray-500">
            This will be sent to your Telegram chat
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;