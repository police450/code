const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');

const app = express();

app.use(bodyParser.json());

const pusher = new Pusher({
  appId: '1642226',
  key: '8a76d7cf0227d90d1fe3',
  secret: 'aba111201e61b0e1a02f',
  cluster: 'eu',
});

// Store banned users and moderators
let bannedUsers = [];
let moderators = [];

// Channels
const chatChannel = 'chat';

// Middleware to check if the user is a moderator
const isModerator = (userId) => moderators.includes(userId);

// Middleware to check if the user is banned
const isBanned = (userId) => bannedUsers.includes(userId);

// Endpoint to ban a user
app.post('/ban', (req, res) => {
  const { userId } = req.body;

  // Only allow the streamer to ban users
  if (isModerator(req.headers['x-user-id'])) {
    bannedUsers.push(userId);

    // Notify clients about the ban
    pusher.trigger(chatChannel, 'userBanned', { userId });

    res.status(200).send('User banned successfully');
  } else {
    res.status(403).send('Unauthorized');
  }
});

// Endpoint to unban a user
app.post('/unban', (req, res) => {
  const { userId } = req.body;

  // Only allow the streamer to unban users
  if (isModerator(req.headers['x-user-id'])) {
    bannedUsers = bannedUsers.filter((id) => id !== userId);

    // Notify clients about the unban
    pusher.trigger(chatChannel, 'userUnbanned', { userId });

    res.status(200).send('User unbanned successfully');
  } else {
    res.status(403).send('Unauthorized');
  }
});

// Endpoint to add a moderator
app.post('/addModerator', (req, res) => {
  const { userId } = req.body;

  // Only allow the streamer to add moderators
  if (!isModerator(req.headers['x-user-id'])) {
    moderators.push(userId);

    // Notify clients about the new moderator
    pusher.trigger(chatChannel, 'moderatorAdded', { userId });

    res.status(200).send('Moderator added successfully');
  } else {
    res.status(403).send('Unauthorized');
  }
});

// Endpoint to remove a moderator
app.post('/removeModerator', (req, res) => {
  const { userId } = req.body;

  // Only allow the streamer to remove moderators
  if (!isModerator(req.headers['x-user-id'])) {
    moderators = moderators.filter((id) => id !== userId);

    // Notify clients about the removed moderator
    pusher.trigger(chatChannel, 'moderatorRemoved', { userId });

    res.status(200).send('Moderator removed successfully');
  } else {
    res.status(403).send('Unauthorized');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});