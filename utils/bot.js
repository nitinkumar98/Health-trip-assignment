const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const weatherApiKey = process.env.WEATHER_API_KEY;

const bot = new TelegramBot(botToken, { polling: true });

const User = require('../models/users');

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  let user = await User.findOne({ chatId });

  if (!user) {
    const newUser = new User({ chatId });
    await newUser.save();

    bot.sendMessage(chatId, 'Welcome! What is your name?');
  } else {
    bot.sendMessage(chatId, `Welcome back, ${user.name || 'User'}!`);
  }
});

// Handle user responses
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  let user = await User.findOne({ chatId });

  if (user) {
    if (!user.name) {
      if (msg.text.trim() === '') {
        bot.sendMessage(chatId, 'Please provide a valid name.');
      } else {
        await User.updateOne({ chatId }, { $set: { name: msg.text } }, { upsert: true, new: true });
        bot.sendMessage(chatId, `Thanks, ${msg.text}! What city are you in?`);
      }
    } else if (!user.city) {
      await User.updateOne({ chatId }, { $set: { city: msg.text } });
      bot.sendMessage(chatId, `Great! What country are you in?`);
    } else if (!user.country) {
      await User.updateOne({ chatId }, { $set: { country: msg.text } }, { upsert: true, new: true });
      bot.sendMessage(chatId, `Awesome! I will send you daily weather updates.`);
    }
  }
});

bot.onText(/\/weather/, async () => {
  const users = await User.find();
  for (const user of users) {
    try {
        const { city, country, chatId } = user;
        // Fetch weather information from OpenWeatherMap API
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${weatherApiKey}&units=metric`);
        const { main, weather } = weatherResponse.data;
        const weatherMessage = `Good morning! Here's the weather update for ${city}, ${country}:\n\nTemperature: ${main.temp}°C\nCondition: ${weather[0].description}`;
        await bot.sendMessage(chatId, weatherMessage);
      } catch (error) {
        console.error('Error fetching weather updates:', error.message);
        await bot.sendMessage(chatId, 'Sorry, there was an error fetching the weather updates. Please try again later.');
      }
  }
});
