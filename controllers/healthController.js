const mongoose = require('mongoose');

const getHealth = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    success: true,
    message: 'Task Manager API is running',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus[dbState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
