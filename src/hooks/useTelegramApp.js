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

      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
        setChatId(tg.initDataUnsafe.user.id);
      }

      console.log('✅ Telegram WebApp initialized');
      console.log('👤 User:', tg.initDataUnsafe.user);
    }
  }, []);

  const sendTelegramData = (data) => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(data));
    } else {
      console.log('💻 Dev mode - would send:', data);
    }
  };

  const sendFileToBot = async (blob, filename, metadata = {}) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const base64Data = reader.result.split(',')[1];

          const fileData = {
            action: 'send_processed_file',
            file: {
              data: base64Data,
              filename,
              mimeType: 'audio/mpeg',
              size: blob.size
            },
            metadata: {
              artist: metadata.artist || 'Unknown Artist',
              album: metadata.album || 'Unknown Album',
              originalFilename: metadata.originalFilename || 'unknown.mp3'
            },
            user,
            timestamp: new Date().toISOString()
          };

          if (isTelegramApp && window.Telegram?.WebApp) {
            window.Telegram.WebApp.sendData(JSON.stringify(fileData));
            resolve({ success: true });
          } else {
            console.log('💻 Dev mode - file data:', fileData);
            resolve({ success: true });
          }
        } catch (error) {
          reject({ success: false, error: error.message });
        }
      };

      reader.onerror = () => reject({ success: false, error: 'File read failed' });
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
      callback(window.confirm(message));
    }
  };

  return { isTelegramApp, user, chatId, sendTelegramData, sendFileToBot, showAlert, showConfirm };
};
