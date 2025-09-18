import React from 'react';
import { Download, RotateCcw } from 'lucide-react';

const ActionButtons = ({ 
  mp3File, 
  isProcessing, 
  librariesLoaded, 
  onProcess, 
  onReset 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onProcess}
          disabled={!mp3File || isProcessing || !librariesLoaded}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : !librariesLoaded ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Loading Libraries...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Apply & Download
            </>
          )}
        </button>
        
        <button
          onClick={onReset}
          disabled={isProcessing}
          className="sm:w-auto w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mt-4 text-center">
        All processing happens in your browser. No files are uploaded to any server.
      </p>
    </div>
  );
};

export default ActionButtons;