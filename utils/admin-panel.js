const express = require('express');
const router = express.Router();

const User = require('../models/users');

router.post('block-user', async (req, res) => {
  const { chatId } = req.body;

  try {
    await User.updateOne({ chatId }, { $set: { blocked: true } });
    res.json({ success: true, message: 'User blocked successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to block user.' });
  }
});

router.post('delete-user', async (req, res) => {
  const { chatId } = req.body;

  try {
    await User.deleteOne({ chatId });
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});
module.exports = function (app) {
  app.use('/admin', router);
};