import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { processMessage } from "./modules/openAI.mjs";
import { lipSync } from "./modules/lip-sync.mjs";
import { sendDefaultMessages, defaultResponse } from "./modules/defaultMessages.mjs";
import { convertAudioToText } from "./modules/whisper.mjs";
import { ensureDirectoryExists, getAbsolutePath } from "./utils/files.mjs";
import { voice } from "./modules/elevenLabs.mjs";
import { existsSync } from 'fs';
import path from 'path';

dotenv.config();

const DEBUG = process.env.DEBUG === 'true';
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both Vite default ports
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

const port = 3000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Check if rhubarb is installed
const checkRhubarbInstallation = () => {
  const binDir = getAbsolutePath('bin');
  const rhubarbPath = path.join(binDir, process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb');
  return existsSync(rhubarbPath);
};

// Ensure required directories exist
const initializeDirectories = async () => {
  try {
    await ensureDirectoryExists(getAbsolutePath('audios'));
    await ensureDirectoryExists(getAbsolutePath('bin'));
    if (DEBUG) console.log('Required directories created');
  } catch (error) {
    console.error('Error creating directories:', error);
  }
};

// Add lip sync status endpoint
app.get("/lip-sync-status", (req, res) => {
  const hasRhubarb = checkRhubarbInstallation();
  res.json({ status: hasRhubarb ? 'full' : 'basic' });
});

app.get("/voices", async (req, res) => {
  try {
    res.send(await voice.getVoices(elevenLabsApiKey));
  } catch (error) {
    next(error);
  }
});

app.post("/tts", async (req, res, next) => {
  try {
    const userMessage = req.body.message;
    if (DEBUG) console.log('Received TTS request:', userMessage);

    const defaultMessages = await sendDefaultMessages({ userMessage });
    if (defaultMessages) {
      if (DEBUG) console.log('Sending default messages');
      res.send({ messages: defaultMessages });
      return;
    }

    let processedMessages;
    try {
      if (DEBUG) console.log('Processing message with OpenAI');
      processedMessages = await processMessage(userMessage);
    } catch (error) {
      console.error("Error processing message with OpenAI:", error);
      res.send({ messages: defaultResponse });
      return;
    }

    if (DEBUG) console.log('Adding lip sync to messages');
    const messagesWithLipSync = await lipSync({ messages: processedMessages.messages });
    
    if (DEBUG) console.log('Sending response');
    res.send({ messages: messagesWithLipSync });
  } catch (error) {
    next(error);
  }
});

app.post("/sts", async (req, res, next) => {
  try {
    const audioData = req.body.audio;
    if (!audioData) {
      res.status(400).json({ error: 'No audio data provided' });
      return;
    }

    if (DEBUG) console.log('Converting speech to text');
    const userMessage = await convertAudioToText({ audioData });
    
    if (DEBUG) console.log('Converted text:', userMessage);

    const defaultMessages = await sendDefaultMessages({ userMessage });
    if (defaultMessages) {
      if (DEBUG) console.log('Sending default messages');
      res.send({ messages: defaultMessages });
      return;
    }

    let processedMessages;
    try {
      if (DEBUG) console.log('Processing message with OpenAI');
      processedMessages = await processMessage(userMessage);
    } catch (error) {
      console.error("Error processing message with OpenAI:", error);
      res.send({ messages: defaultResponse });
      return;
    }

    if (DEBUG) console.log('Adding lip sync to messages');
    const messagesWithLipSync = await lipSync({ messages: processedMessages.messages });
    
    if (DEBUG) console.log('Sending response');
    res.send({ messages: messagesWithLipSync });
  } catch (error) {
    next(error);
  }
});

// Initialize directories and start server
initializeDirectories().then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});
