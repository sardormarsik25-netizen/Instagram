const express = require('express');
const mongoose = require('mongoose');
const path = require('node:path');
const userRoutes = require('./routes/userRoutes');

function createApp(authRouter) {
  const app = express();

  if (authRouter) {
    app.use('/api/auth/profile', express.json({ limit: '256kb' }));
    app.use('/api/auth/stories', express.json({ limit: '896kb' }));
  }
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (_req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable' });
  });

  app.use('/api/users', userRoutes);
  if (authRouter) app.use('/api/auth', authRouter);

  const frontend = path.resolve(__dirname, '../frontend/dist');
  app.use(express.static(frontend));
  app.get(['/login', '/register', '/dashboard'], (_req, res, next) => {
    res.sendFile('index.html', { root: frontend }, (error) => {
      if (error?.status === 404) return next();
      if (error) next(error);
    });
  });
  app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid user data' });
    }
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'Invalid JSON' });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ message: 'Request body too large' });
    }

    console.error('Request failed:', error.name);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
