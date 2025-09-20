import { useState, useEffect } from 'react';

export const useTelegramApp = () => {
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
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
    }
  }, []);

  const sendFileToBot = async (blob, filename, metadata = {}) => {
    if (!chatId) return { success: false, message: 'Chat ID missing' };
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const payload = { file: { data: base64Data, filename, size: blob.size }, metadata, chat_id: chatId };
          const res = await fetch('/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject('File read error');
      reader.readAsDataURL(blob);
    });
  };

  const showAlert = (msg) => {
    isTelegramApp ? window.Telegram.WebApp.showAlert(msg) : alert(msg);
  };

  const showConfirm = (msg, cb) => {
    if (isTelegramApp) window.Telegram.WebApp.showConfirm(msg, cb);
    else cb(confirm(msg));
  };

  return { isTelegramApp, user, chatId, sendFileToBot, showAlert, showConfirm };
};
