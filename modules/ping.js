const express = require('express');
const router = express.Router();

// Define a middleware function for the ping route
router.use('/ping', (req, res, next) => {
  // Log the ping request
  console.log(`Ping received at ${new Date().toISOString()}`);

  res.json({ message: 'Pong!' });
});

module.exports = router;
