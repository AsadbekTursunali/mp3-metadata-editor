require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;
const PORT = process.env.PORT || 3000;

if (!token || !webAppUrl) {
  console.error("❌ BOT_TOKEN yoki WEB_APP_URL .env faylda topilmadi!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(express.json({ limit: '50mb' }));

// Cors middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Bot komandalarini o'rnatish
bot.setMyCommands([
  { command: 'start', description: '🎵 Start MP3 Editor' },
  { command: 'help', description: '❓ Get help' },
  { command: 'editor', description: '🎵 Open Editor' }
]);

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    const welcomeMessage = `🎵 *MP3 Metadata Editor*

Assalomu alaykum! Bu bot orqali siz MP3 fayllaringizning metadata'larini o'zgartirishingiz mumkin.

*Imkoniyatlar:*
• Artist va Album nomini o'zgartirish
• Rasm qo'shish (Cover Art)
• Faylni qayta ishlash va yuklab olish

Quyidagi tugmani bosing va boshlang:`;

    bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎵 Open MP3 Editor', web_app: { url: webAppUrl } }],
          [{ text: '❓ Help', callback_data: 'help' }]
        ]
      }
    });
  } else if (text === '/help') {
    const helpMessage = `❓ *Yordam*

*Qanday foydalanish:*
1. /start tugmasini bosing
2. "Open MP3 Editor" tugmasini bosing
3. MP3 faylni yuklang
4. Artist va Album nomini kiriting
5. Agar kerak bo'lsa, rasm qo'shing
6. "Process MP3" tugmasini bosing
7. "Send to Telegram" tugmasini bosing

*Qo'llab-quvvatlanadigan formatlar:*
• Audio: MP3 faqat
• Rasm: JPG, PNG, WebP

*Fayl hajmi:*
• Maksimal: 50MB`;

    bot.sendMessage(chatId, helpMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎵 Open Editor', web_app: { url: webAppUrl } }]
        ]
      }
    });
  } else if (text === '/editor') {
    bot.sendMessage(chatId, '🎵 MP3 Editor ochilmoqda...', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎵 Open MP3 Editor', web_app: { url: webAppUrl } }]
        ]
      }
    });
  }
});

// Callback query handler
bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  if (data === 'help') {
    const helpMessage = `❓ *Yordam*

*Qanday foydalanish:*
1. MP3 faylni yuklang
2. Artist va Album nomini kiriting  
3. Agar kerak bo'lsa, rasm qo'shing
4. "Process MP3" tugmasini bosing
5. "Send to Telegram" tugmasini bosing

*Maslahatlar:*
• Faqat MP3 format qo'llab-quvvatlanadi
• Rasm uchun JPG, PNG formatlaridan foydalaning
• Fayl hajmi 50MB dan oshmasin`;

    bot.answerCallbackQuery(callbackQuery.id);
    bot.sendMessage(chatId, helpMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎵 Open Editor', web_app: { url: webAppUrl } }]
        ]
      }
    });
  }
});

// Web App data handler
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app.data);
  
  console.log('Web app data received:', data);
  
  // Handle different actions
  switch (data.action) {
    case 'file_uploaded':
      bot.sendMessage(chatId, `📁 Fayl yuklandi: ${data.filename}\n📊 Hajmi: ${(data.size / 1024 / 1024).toFixed(2)} MB`);
      break;
    case 'file_processed':
      bot.sendMessage(chatId, `✅ Fayl qayta ishlandi!\n🎵 ${data.artist} - ${data.album}\n\n"Send to Telegram" tugmasini bosing.`);
      break;
    case 'reset_form':
      bot.sendMessage(chatId, '🗑️ Ma\'lumotlar tozalandi');
      break;
  }
});

// Faylni qabul qiluvchi endpoint
app.post('/upload', async (req, res) => {
  try {
    const { file, metadata, chat_id } = req.body;
    
    if (!file || !chat_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing file or chat_id' 
      });
    }

    // Base64 dan buffer ga o'zgartirish
    const buffer = Buffer.from(file.data, 'base64');
    const fileName = file.filename.replace(/[^a-zA-Z0-9.-]/g, '_'); // Safe filename
    const filePath = path.join(tempDir, `${Date.now()}_${fileName}`);
    
    // Faylni saqlash
    fs.writeFileSync(filePath, buffer);
    
    // Telegram caption yaratish
    const artist = metadata.artist || 'Unknown Artist';
    const album = metadata.album || 'Unknown Album';
    const originalName = metadata.originalFilename || file.filename;
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    
    const caption = `🎵 *Qayta ishlangan MP3*

👤 *Artist:* ${artist}
💽 *Album:* ${album}
📁 *Asl fayl:* ${originalName}
📊 *Hajm:* ${fileSize} MB
⏰ *Sana:* ${new Date().toLocaleString('uz-UZ')}

✅ Metadata muvaffaqiyatli o'zgartirildi!`;

    // Telegram ga audio jo'natish
    await bot.sendAudio(chat_id, fs.createReadStream(filePath), {
      caption,
      parse_mode: 'Markdown',
      title: `${artist} - ${album}`,
      performer: artist,
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎵 Yana tahrirlash', web_app: { url: webAppUrl } }]
        ]
      }
    });

    // Vaqtinchalik faylni o'chirish
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Temp file deleted: ${fileName}`);
      }
    }, 5000);

    res.json({ success: true, message: 'File sent successfully' });
    
    console.log(`✅ File sent successfully: ${fileName} (${fileSize} MB)`);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Foydalanuvchiga xatolik haqida xabar berish
    if (req.body.chat_id) {
      bot.sendMessage(req.body.chat_id, 
        `❌ Xatolik yuz berdi: ${error.message}\n\nQaytadan urinib ko'ring yoki /start bosing.`
      );
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

app.listen(PORT, () => {
  console.log(`✅ Server ishlamoqda: http://localhost:${PORT}`);
  console.log(`🤖 Bot ismi: @${bot.getMe().then(me => me.username)}`);
});

module.exports = { app, bot };