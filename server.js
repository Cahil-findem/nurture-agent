import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Import API routes
import chatHandler from './api/chat.js';

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

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});