const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./utils/mongoose'); // Connect to MongoDB
require('./utils/bot'); // Initialize Telegram bot
require('./utils/admin-panel')(app); // Set up Admin Panel

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});