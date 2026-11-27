const mongoose = require('mongoose');
const { randomBytes } = require('node:crypto');
const { createApp } = require('./app');
const createAuthRouter = require('./routes/authRoutes');
const connectDB = require('./config/db');
const User = require('./models/User');
const Story = require('./models/Story');
const Follow = require('./models/Follow');
const Reaction = require('./models/Reaction');

async function start() {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const secure = process.env.NODE_ENV === 'production';
  const secret = process.env.SESSION_SECRET;
  if ((secure || secret) && (!secret || secret.length < 32)) {
    throw new Error('SESSION_SECRET must contain at least 32 characters');
  }
  const proxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
  if (!Number.isInteger(proxyHops) || proxyHops < 0) {
    throw new Error('TRUST_PROXY_HOPS must be a non-negative integer');
  }

  await connectDB();
  await Promise.all([User.init(), Story.init(), Follow.init(), Reaction.init()]);
  const authRouter = createAuthRouter({
    client: mongoose.connection.getClient(),
    secret: secret || randomBytes(32).toString('hex'),
    secure,
  });
  const app = createApp(authRouter);
  if (proxyHops) app.set('trust proxy', proxyHops);
  const server = app.listen(port, () => console.log(`API listening on port ${port}`));
  server.once('error', handleStartupError);
}

async function handleStartupError(error) {
  console.error('Could not start API:', error.code ?? error.name);
  process.exitCode = 1;
  await mongoose.disconnect();
}

start().catch(handleStartupError);
