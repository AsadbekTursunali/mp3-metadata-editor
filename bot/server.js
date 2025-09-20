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

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Bot komandalarini o‘rnatish
bot.setMyCommands([
  { command: 'start', description: '🎵 Start MP3 Editor' },
  { command: 'help', description: '❓ Get help' }
]);

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    bot.sendMessage(chatId,
      `🎵 *MP3 Metadata Editor*\n\nXush kelibsiz! Quyidagi tugmani bosing va boshlang:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: '🎵 Open MP3 Editor', web_app: { url: webAppUrl } }]]
        }
      }
    );
  }
});

// Faylni qabul qiluvchi endpoint
app.post('/upload', async (req, res) => {
  try {
    const { file, metadata, chat_id } = req.body;
    if (!file || !chat_id) return res.status(400).json({ error: 'Missing file or chat_id' });

    const buffer = Buffer.from(file.data, 'base64');
    const filePath = path.join(tempDir, file.filename);
    fs.writeFileSync(filePath, buffer);

    const caption = `🎵 *Your Edited MP3*\n\n👤 *Artist:* ${metadata.artist}\n💽 *Album:* ${metadata.album}\n📁 *Original:* ${metadata.originalFilename}\n📊 *Size:* ${(file.size / 1024 / 1024).toFixed(2)} MB`;

    await bot.sendAudio(chat_id, fs.createReadStream(filePath), {
      caption,
      parse_mode: 'Markdown',
      title: `${metadata.artist} - ${metadata.album}`,
      performer: metadata.artist
    });

    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
