require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;

if (!token || !webAppUrl) {
  console.error("❌ BOT_TOKEN yoki WEB_APP_URL .env faylda topilmadi!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(express.json({ limit: '50mb' }));

// Bot komandalar
bot.setMyCommands([
  { command: 'start', description: '🎵 Start MP3 Editor' },
  { command: 'help', description: '❓ Get help' }
]);

// /start va /help
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    const welcomeMessage = `🎵 *MP3 Metadata Editor*

Xush kelibsiz! Bu bot yordamida siz:
- MP3 faylni tahrirlash
- Artist / Album nomini o‘zgartirish
- Cover qo‘shish
- Natijani chatda olish`;

    bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🎵 Open MP3 Editor', web_app: { url: webAppUrl } }
        ]]
      }
    });
  }

  if (text === '/help') {
    const helpMessage = `❓ *Yordam*

1️⃣ "Open MP3 Editor" tugmasini bosing  
2️⃣ MP3 faylingizni yuklang  
3️⃣ Artist/Album/Coverni o‘zgartiring  
4️⃣ "Process & Send" tugmasini bosing  
5️⃣ Tahrirlangan faylni shu yerda oling 🚀`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }
});

// WebApp’dan data olish
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;

  try {
    const data = JSON.parse(msg.web_app_data.data);
    console.log('📩 WebApp data:', data.action);

    switch (data.action) {
      case 'file_uploaded':
        bot.sendMessage(chatId, `✅ Fayl yuklandi: *${data.filename}*  
Hajmi: ${(data.size / 1024 / 1024).toFixed(2)} MB`, { parse_mode: 'Markdown' });
        break;

      case 'send_processed_file':
        await handleProcessedFile(chatId, data);
        break;

      case 'file_processed_success':
        bot.sendMessage(chatId, `🎉 Muvaffaqiyatli: *${data.filename}*`, { parse_mode: 'Markdown' });
        break;

      case 'file_processed_error':
        bot.sendMessage(chatId, `❌ Xatolik: ${data.error}`, { parse_mode: 'Markdown' });
        break;

      case 'reset_form':
        bot.sendMessage(chatId, '🔄 Yangi fayl uchun tayyor!');
        break;
    }
  } catch (error) {
    console.error('❌ WebApp data xatosi:', error);
    bot.sendMessage(chatId, '❌ So‘rovni qayta ishlashda xato.');
  }
});

// Faylni chatga yuborish
async function handleProcessedFile(chatId, data) {
  try {
    console.log(`▶️ Fayl tayyorlanmoqda: ${data.file.filename}`);
    const audioBuffer = Buffer.from(data.file.data, 'base64');

    const tempFilePath = path.join(__dirname, 'temp', data.file.filename);
    if (!fs.existsSync(path.dirname(tempFilePath))) {
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    }
    fs.writeFileSync(tempFilePath, audioBuffer);

    const caption = `🎵 *Your Edited MP3*  

👤 *Artist:* ${data.metadata.artist}  
💽 *Album:* ${data.metadata.album}  
📁 *Original:* ${data.metadata.originalFilename}  
📊 *Size:* ${(data.file.size / 1024 / 1024).toFixed(2)} MB`;

    await bot.sendAudio(chatId, fs.createReadStream(tempFilePath), {
      caption,
      parse_mode: 'Markdown',
      title: `${data.metadata.artist} - ${data.metadata.album}`,
      performer: data.metadata.artist
    });

    fs.unlinkSync(tempFilePath);
    console.log(`✅ Fayl yuborildi: ${data.file.filename}`);
  } catch (error) {
    console.error('❌ Fayl yuborishda xato:', error);
    bot.sendMessage(chatId, '❌ Faylni yuborib bo‘lmadi.');
  }
}

// Express health check
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server ishlayapti: ${PORT}`);
});
