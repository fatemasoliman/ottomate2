const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const WebSocket = require('ws');
require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://3.28.123.146', 'http://3.28.123.146:3000'],
  credentials: true
}));
app.use(bodyParser.json());

const COOKIES_FILE = 'cookies.json';

const wss = new WebSocket.Server({ port: 3002 }, () => {
  console.log('WebSocket server is running on port 3002');
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('message', (message) => {
    console.log('Received message:', message);
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.post('/save-cookies', async (req, res) => {
  try {
    const { cookies } = req.body;
    await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies));
    res.json({ message: 'Cookies saved successfully' });
  } catch (error) {
    console.error('Error saving cookies:', error);
    res.status(500).json({ error: 'Failed to save cookies' });
  }
});

app.get('/load-cookies', async (req, res) => {
  try {
    const cookiesString = await fs.readFile(COOKIES_FILE, 'utf8');
    const cookies = JSON.parse(cookiesString);
    res.json({ cookies });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ cookies: [] });
    } else {
      console.error('Error loading cookies:', error);
      res.status(500).json({ error: 'Failed to load cookies' });
    }
  }
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});