require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const multer = require('multer');
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

// Fayl yuklash uchun multer sozlamalari
const upload = multer({ dest: path.join(__dirname, "temp") });

// Bot komandalarini sozlash
bot.setMyCommands([
  { command: 'start', description: '🎵 Start MP3 Editor' },
  { command: 'help', description: '❓ Get help' }
]);

// /start komandasi
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    const welcomeMessage = `🎵 *MP3 Metadata Editor*

Xush kelibsiz! Bu bot yordamida siz:
- MP3 faylni tahrirlash
- Artist va Album nomini o‘zgartirish
- Yangi cover qo‘shish
- Tahrirlangan faylni shu chatda olish

Quyidagi tugmani bosing va boshlang:`;

    bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🎵 Open MP3 Editor', web_app: { url: webAppUrl } }
        ]]
      }
    });
  }
});

// WebApp’dan faqat metadata keladi
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;

  try {
    const data = JSON.parse(msg.web_app_data.data);
    console.log("📩 WebApp data:", data);

    if (data.action === "file_uploaded") {
      bot.sendMessage(chatId, `✅ Fayl yuklandi: *${data.filename}*`, { parse_mode: "Markdown" });
    }

  } catch (err) {
    console.error("❌ WebApp data xatosi:", err);
    bot.sendMessage(chatId, "❌ Ma'lumotni qayta ishlashda xato.");
  }
});

// Express upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const metadata = JSON.parse(req.body.metadata || "{}");
    const filePath = req.file.path;
    const chatId = process.env.OWNER_CHAT_ID; // Agar chatId ni oldindan bilsangiz

    if (!chatId) {
      return res.status(400).json({ success: false, error: "Chat ID mavjud emas" });
    }

    const caption = `🎵 *Edited MP3*  

👤 *Artist:* ${metadata.artist || "Unknown"}  
💽 *Album:* ${metadata.album || "Unknown"}  
📁 *Original:* ${metadata.originalFilename || "unknown.mp3"}`;

    await bot.sendAudio(chatId, fs.createReadStream(filePath), {
      caption,
      parse_mode: "Markdown",
      title: `${metadata.artist} - ${metadata.album}`,
      performer: metadata.artist
    });

    fs.unlinkSync(filePath); // vaqtinchalik faylni o‘chirish
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server ishlayapti: ${PORT}`);
});
