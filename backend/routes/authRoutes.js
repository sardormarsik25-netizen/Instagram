const { randomBytes, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const { Router } = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const { rateLimit } = require('express-rate-limit');
const { deriveKey, registerWithSession } = require('../controllers/userController');
const User = require('../models/User');
const Story = require('../models/Story');
const Follow = require('../models/Follow');
const Reaction = require('../models/Reaction');
const { isObjectIdOrHexString } = require('mongoose');

const cookieName = 'instagram.sid';
const fallbackHash = `${randomBytes(16).toString('hex')}:${'0'.repeat(128)}`;
const updateLifetime = 24 * 60 * 60 * 1000;
const noteKey = (authorId, expiresAt) => `${authorId}:${new Date(expiresAt).toISOString()}`;

function readJpeg(dataUrl, maxLength) {
  const prefix = 'data:image/jpeg;base64,';
  if (typeof dataUrl !== 'string' || dataUrl.length > maxLength || !dataUrl.startsWith(prefix)) return null;
  const encoded = dataUrl.slice(prefix.length);
  const image = Buffer.from(encoded, 'base64');
  if (encoded !== image.toString('base64') || image.length < 4 ||
      image.readUInt16BE(0) !== 0xffd8 || image.readUInt16BE(image.length - 2) !== 0xffd9) {
    return null;
  }
  return image;
}

function publicUser(user) {
  return { id: user.id, username: user.username, fullName: user.fullName, avatarUrl: user.avatarUrl };
}

async function signIn(req, res, user, status = 200) {
  await promisify(req.session.regenerate).call(req.session);
  req.session.userId = user.id;
  await promisify(req.session.save).call(req.session);
  res.status(status).json({ user: publicUser(user) });
}

function createAuthRouter({ client, secret, secure }) {
  const router = Router();
  const cookie = { httpOnly: true, sameSite: 'lax', secure, path: '/' };
  const attempts = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Too many attempts' },
  });

  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (req.method === 'POST' && !req.is('application/json')) {
      return res.status(415).json({ message: 'Expected application/json' });
    }
    next();
  });
  router.use(session({
    name: cookieName,
    secret,
    store: MongoStore.create({ client, collectionName: 'sessions' }),
    resave: false,
    saveUninitialized: false,
    cookie: { ...cookie, maxAge: 7 * 24 * 60 * 60 * 1000 },
  }));

  router.post('/register', attempts, (req, res) => registerWithSession(req, res, signIn));
  router.post('/login', attempts, async (req, res) => {
    const { identifier, password } = req.body ?? {};
    if (typeof identifier !== 'string' || !identifier.trim() || identifier.length > 254 ||
        typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: 'Invalid login data' });
    }

    const value = identifier.trim().toLowerCase();
    const field = value.includes('@') ? 'email' : 'username';
    const user = await User.findOne({ [field]: value }).select('+passwordHash');
    const [salt, hash] = (user?.passwordHash ?? fallbackHash).split(':');
    const storedKey = Buffer.from(hash ?? '', 'hex');
    const key = await deriveKey(password, salt, 64);
    if (!user || storedKey.length !== key.length || !timingSafeEqual(key, storedKey)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    await signIn(req, res, user);
  });

  router.get('/me', async (req, res) => {
    const user = req.session.userId && await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ message: 'Sign in required' });
    res.json({ user: publicUser(user) });
  });

  router.use('/connections', (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Sign in required' });
    next();
  });

  const connectionUser = (user) => ({ id: user.id, username: user.username, fullName: user.fullName });

  router.get('/connections', async (req, res) => {
    const userId = req.session.userId;
    const [followers, following] = await Promise.all([
      Follow.find({ following: userId }).sort({ createdAt: -1 }).populate('follower', 'username fullName'),
      Follow.find({ follower: userId }).sort({ createdAt: -1 }).populate('following', 'username fullName'),
    ]);
    res.json({
      followers: followers.map((record) => record.follower).filter(Boolean).map(connectionUser),
      following: following.map((record) => record.following).filter(Boolean).map(connectionUser),
    });
  });

  router.get('/connections/search', async (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    if (!/^[a-z0-9._]{1,30}$/.test(query)) return res.json({ users: [] });
    const prefix = new RegExp(`^${query.replaceAll('.', '[.]')}`);
    const users = await User.find({ _id: { $ne: req.session.userId }, username: prefix })
      .select('username fullName').sort('username').limit(20);
    const follows = await Follow.find({ follower: req.session.userId, following: { $in: users.map((user) => user._id) } });
    const followingIds = new Set(follows.map(({ following }) => following.toString()));
    res.json({ users: users.map((user) => ({ ...connectionUser(user), following: followingIds.has(user.id) })) });
  });

  router.post('/connections', async (req, res) => {
    const follower = req.session.userId;
    const { userId, follow } = req.body ?? {};
    if (typeof userId !== 'string' || !isObjectIdOrHexString(userId) ||
        follower === userId.toLowerCase() || typeof follow !== 'boolean') {
      return res.status(400).json({ message: 'Invalid connection' });
    }
    const filter = { follower, following: userId };
    if (follow) {
      if (!await User.exists({ _id: userId })) return res.status(404).json({ message: 'User not found' });
      try {
        await Follow.updateOne(filter, { $setOnInsert: filter }, { upsert: true });
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    } else {
      await Follow.deleteOne(filter);
    }
    res.status(204).end();
  });

  router.post('/profile', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Sign in required' });
    const { username, avatarUrl } = req.body ?? {};
    if (typeof username !== 'string' || !/^[a-z0-9._]{3,30}$/i.test(username.trim())) {
      return res.status(400).json({ message: 'Invalid username' });
    }

    const updates = { username: username.trim().toLowerCase() };
    if (avatarUrl !== undefined) {
      if (!readJpeg(avatarUrl, 240000)) {
        return res.status(400).json({ message: 'Invalid profile image' });
      }
      updates.avatarUrl = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(req.session.userId, updates, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!user) return res.status(401).json({ message: 'Sign in required' });
    res.json({ user: publicUser(user) });
  });

  router.use('/stories', (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Sign in required' });
    next();
  });

  router.get('/stories', async (req, res) => {
    const expiresAt = { $gt: new Date() };
    const selectStory = (query) => query.sort({ createdAt: -1, _id: -1 })
      .limit(100).populate('author', 'username');
    const [own, others] = await Promise.all([
      selectStory(Story.find({ expiresAt, author: req.session.userId })),
      selectStory(Story.find({ expiresAt, author: { $ne: req.session.userId } })),
    ]);
    const available = [...own, ...others].filter((story) => story.author);
    const reactions = await Reaction.find({
      actor: req.session.userId, kind: 'story', target: { $in: available.map((story) => story.id) },
    }).distinct('target');
    const liked = new Set(reactions);
    const stories = available.map((story) => ({
      id: story.id,
      authorId: story.author.id,
      username: story.author.username,
      expiresAt: story.expiresAt,
      liked: liked.has(story.id),
    }));
    res.json({ stories });
  });

  router.post('/stories', async (req, res) => {
    const image = readJpeg(req.body?.image, 850000);
    if (!image) return res.status(400).json({ message: 'Invalid story image' });
    const author = await User.findById(req.session.userId).select('username');
    if (!author) return res.status(401).json({ message: 'Sign in required' });
    const story = await Story.create({ author: author._id, image, expiresAt: new Date(Date.now() + updateLifetime) });
    res.status(201).json({
      story: { id: story.id, authorId: author.id, username: author.username, expiresAt: story.expiresAt },
    });
  });

  router.get('/stories/:id/image', async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) return res.sendStatus(404);
    const story = await Story.findOne({ _id: req.params.id, expiresAt: { $gt: new Date() } }).select('+image');
    if (!story) return res.sendStatus(404);
    res.type('jpeg').set('X-Content-Type-Options', 'nosniff').send(story.image);
  });

  router.get('/notes', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Sign in required' });
    const now = new Date();
    const [own, others] = await Promise.all([
      User.findById(req.session.userId).select('username chatNote'),
      User.find({ _id: { $ne: req.session.userId }, 'chatNote.expiresAt': { $gt: now } })
        .select('username chatNote').sort({ 'chatNote.expiresAt': -1 }).limit(50),
    ]);
    if (!own) return res.status(401).json({ message: 'Sign in required' });
    const active = [own, ...others].filter(({ chatNote }) => chatNote?.expiresAt > now);
    const reactions = await Reaction.find({
      actor: req.session.userId, kind: 'note',
      target: { $in: active.map((user) => noteKey(user.id, user.chatNote.expiresAt)) },
    }).distinct('target');
    const liked = new Set(reactions);
    res.json({ notes: active.map((user) => ({
        authorId: user.id, username: user.username,
        text: user.chatNote.text, expiresAt: user.chatNote.expiresAt,
        liked: liked.has(noteKey(user.id, user.chatNote.expiresAt)),
      })) });
  });

  router.post('/reactions', async (req, res) => {
    const actor = req.session.userId;
    if (!actor) return res.status(401).json({ message: 'Sign in required' });
    const { kind, id, expiresAt, liked } = req.body ?? {};
    if (!['story', 'note'].includes(kind) || typeof id !== 'string' ||
        !isObjectIdOrHexString(id) || typeof liked !== 'boolean') {
      return res.status(400).json({ message: 'Invalid reaction' });
    }

    const now = new Date();
    let recipient;
    let target;
    if (kind === 'story') {
      const story = await Story.findOne({ _id: id, expiresAt: { $gt: now } }).select('author');
      if (!story) return res.status(404).json({ message: 'Story not found' });
      recipient = story.author.toString();
      target = story.id;
    } else {
      const timestamp = typeof expiresAt === 'string' ? Date.parse(expiresAt) : NaN;
      if (!(timestamp > now.getTime())) return res.status(404).json({ message: 'Note not found' });
      const author = await User.findOne({ _id: id, 'chatNote.expiresAt': new Date(timestamp) }).select('_id');
      if (!author) return res.status(404).json({ message: 'Note not found' });
      recipient = author.id;
      target = noteKey(recipient, timestamp);
    }
    if (actor === recipient) return res.status(400).json({ message: 'Cannot like your own update' });
    const filter = { actor, kind, target };
    if (liked) {
      try {
        await Reaction.updateOne(filter, { $setOnInsert: { ...filter, recipient } }, { upsert: true });
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    } else {
      await Reaction.deleteOne(filter);
    }
    res.json({ liked });
  });

  router.get('/notifications', async (req, res) => {
    const recipient = req.session.userId;
    if (!recipient) return res.status(401).json({ message: 'Sign in required' });
    const [reactions, follows] = await Promise.all([
      Reaction.find({ recipient }).sort({ createdAt: -1 }).limit(50).populate('actor', 'username'),
      Follow.find({ following: recipient }).sort({ createdAt: -1 }).limit(50).populate('follower', 'username'),
    ]);
    const items = [
      ...reactions.filter(({ actor }) => actor).map((item) => ({
        id: item.id, kind: item.kind, username: item.actor.username, createdAt: item.createdAt,
      })),
      ...follows.filter(({ follower }) => follower).map((item) => ({
        id: item.id, kind: 'follow', username: item.follower.username, createdAt: item.createdAt,
      })),
    ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
    res.json({ items });
  });

  router.post('/notes', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Sign in required' });
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text || text.length > 60) return res.status(400).json({ message: 'Invalid note' });
    const expiresAt = new Date(Date.now() + updateLifetime);
    const user = await User.findByIdAndUpdate(req.session.userId, {
      $set: { chatNote: { text, expiresAt } },
    }, { runValidators: true }).select('username');
    if (!user) return res.status(401).json({ message: 'Sign in required' });
    res.json({ note: { authorId: user.id, username: user.username, text, expiresAt } });
  });

  router.post('/logout', async (req, res) => {
    await promisify(req.session.destroy).call(req.session);
    res.clearCookie(cookieName, cookie).status(204).end();
  });

  return router;
}

module.exports = createAuthRouter;
