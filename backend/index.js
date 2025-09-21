// index.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// --- Bot xabarlarini qabul qilish ---
bot.on("message", (msg) => {
  if (msg.web_app_data) {
    // Mini app yuborgan ma’lumot
    console.log("Mini app data:", msg.web_app_data.data);

    // Faylni yuborish
    bot.sendDocument(msg.chat.id, path.join(__dirname, "files/example.mp3"));
  }
});

// --- Frontend (React build)ni serve qilish ---
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
});
