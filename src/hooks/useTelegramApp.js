import { useState, useEffect } from 'react';

export const useTelegramApp = () => {
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setIsTelegramApp(true);
      const tg = window.Telegram.WebApp;
      
      tg.expand();
      tg.setHeaderColor('#1f2937');
      tg.setBackgroundColor('#f9fafb');
      tg.enableClosingConfirmation();
      
      console.log('Telegram WebApp initialized');
    }
  }, []);

  const sendTelegramData = (data) => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
  };

  return { isTelegramApp, sendTelegramData };
};