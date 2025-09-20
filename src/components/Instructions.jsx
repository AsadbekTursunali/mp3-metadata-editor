import React from 'react';

const Instructions = ({ isTelegramMode = false }) => {
  return (
    <div className="mt-8 bg-blue-50 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-2">
        {isTelegramMode ? "How it works:" : "How to use:"}
      </h3>

      <ol className="text-sm text-blue-800 space-y-1">
        <li>1. Upload your MP3 file</li>
        <li>2. (Optional) Upload a new cover image</li>
        <li>3. Edit the artist name</li>
        <li>4. Edit the album name</li>
        {isTelegramMode ? (
          <li>5. Click "Process & Send to Chat" - the file will be sent to your Telegram chat!</li>
        ) : (
          <li>5. Click "Apply & Download" to get your updated MP3</li>
        )}
      </ol>

      {isTelegramMode && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 text-sm">
            <strong>📱 Telegram Mode:</strong> Your processed MP3 will be delivered directly to this chat. 
            No downloads needed!
          </p>
        </div>
      )}
    </div>
  );
};

export default Instructions;
