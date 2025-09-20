import { useState, useEffect } from 'react';

export const useTelegramApp = () => {
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setIsTelegramApp(true);
      const tg = window.Telegram.WebApp;
      
      tg.expand();
      tg.setHeaderColor('#1f2937');
      tg.setBackgroundColor('#f9fafb');
      tg.enableClosingConfirmation();
      
      // Get user data
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setUser(tg.initDataUnsafe.user);
        setChatId(tg.initDataUnsafe.user.id);
      }
      
      console.log('Telegram WebApp initialized');
      console.log('User:', tg.initDataUnsafe.user);
    }
  }, []);

  const sendTelegramData = (data) => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(data));
    } else {
      console.log('Development mode - would send:', data);
    }
  };

  const sendFileToBot = async (blob, filename, metadata = {}) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const base64Data = reader.result.split(',')[1]; // Remove data:audio/mpeg;base64, prefix
          
          const fileData = {
            action: 'send_processed_file',
            file: {
              data: base64Data,
              filename: filename,
              mimeType: 'audio/mpeg',
              size: blob.size
            },
            metadata: {
              artist: metadata.artist || 'Unknown Artist',
              album: metadata.album || 'Unknown Album',
              originalFilename: metadata.originalFilename || 'unknown.mp3'
            },
            user: {
              id: user?.id,
              first_name: user?.first_name,
              last_name: user?.last_name,
              username: user?.username
            },
            timestamp: new Date().toISOString()
          };

          if (isTelegramApp && window.Telegram?.WebApp) {
            window.Telegram.WebApp.sendData(JSON.stringify(fileData));
            resolve({ success: true, message: 'File sent to Telegram bot' });
          } else {
            // Development mode - log the data
            console.log('Development mode - File data to send:', {
              filename: filename,
              size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
              metadata: metadata
            });
            resolve({ success: true, message: 'Development mode - File logged' });
          }
        } catch (error) {
          reject({ success: false, error: error.message });
        }
      };
      
      reader.onerror = () => {
        reject({ success: false, error: 'Failed to read file' });
      };
      
      reader.readAsDataURL(blob);
    });
  };

  const showAlert = (message) => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message, callback) => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      callback(result);
    }
  };

  return { 
    isTelegramApp, 
    user, 
    chatId,
    sendTelegramData, 
    sendFileToBot, 
    showAlert, 
    showConfirm 
  };
};