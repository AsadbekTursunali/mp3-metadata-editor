import { useState, useEffect } from 'react';

export const useTelegramApp = () => {
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setIsTelegramApp(true);
      const tg = window.Telegram.WebApp;

      tg.expand();
      tg.setHeaderColor('#1f2937');
      tg.setBackgroundColor('#f9fafb');
      tg.enableClosingConfirmation();

      // User ma'lumotlari
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setUser(tg.initDataUnsafe.user);
      }

      console.log('✅ Telegram WebApp initialized');
    }
  }, []);

  // Faqat metadata yuborish
  const sendTelegramData = (data) => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(data));
    } else {
      console.log('Dev mode - would send:', data);
    }
  };

  // Faylni backendga yuborish
  const sendFileToBot = async (blob, filename, metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append("file", blob, filename);
      formData.append("metadata", JSON.stringify(metadata));

      const res = await fetch("/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      return { success: true, message: "File sent to backend" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const showAlert = (message) => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  return {
    isTelegramApp,
    user,
    sendTelegramData,
    sendFileToBot,
    showAlert
  };
};
