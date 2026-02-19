import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Import API routes
import chatHandler from './api/chat.js';
import senditProfilesHandler from './api/sendit-profiles.js';
import senditGenerateHandler from './api/sendit-generate.js';
import senditSendHandler from './api/sendit-send.js';
import senditContactsHandler from './api/sendit-contacts.js';
import senditEmailsHandler from './api/sendit-emails.js';
import senditEmailStatusHandler from './api/sendit-email-status.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.post('/api/chat', (req, res) => {
  chatHandler(req, res);
});

app.get('/api/sendit/profiles', (req, res) => {
  senditProfilesHandler(req, res);
});

app.post('/api/sendit/generate', (req, res) => {
  senditGenerateHandler(req, res);
});

app.post('/api/sendit/send', (req, res) => {
  senditSendHandler(req, res);
});

app.post('/api/sendit/contacts', (req, res) => {
  senditContactsHandler(req, res);
});

app.get('/api/sendit/emails', (req, res) => {
  senditEmailsHandler(req, res);
});

app.post('/api/sendit/email-status', (req, res) => {
  senditEmailStatusHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});