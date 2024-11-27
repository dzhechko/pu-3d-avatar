import ElevenLabs from "elevenlabs-node";
import dotenv from "dotenv";
import path from "path";
import { ensureDirectoryExists, getAbsolutePath } from "../utils/files.mjs";

dotenv.config();

const DEBUG = process.env.DEBUG === 'true';
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.ELEVEN_LABS_VOICE_ID;
const modelID = process.env.ELEVEN_LABS_MODEL_ID;

if (!elevenLabsApiKey) {
  console.error('ElevenLabs API key is missing');
  process.exit(1);
}

if (DEBUG) {
  console.log('ElevenLabs Configuration:');
  console.log('API Key Length:', elevenLabsApiKey.length);
  console.log('Voice ID:', voiceID);
  console.log('Model ID:', modelID);
}

const voice = new ElevenLabs({
  apiKey: elevenLabsApiKey,
  voiceId: voiceID,
});

async function convertTextToSpeech({ text, fileName }) {
  try {
    if (DEBUG) console.log(`Converting text to speech: "${text.substring(0, 50)}..."`);
    
    // Ensure the directory exists
    const absolutePath = getAbsolutePath(fileName);
    const dir = path.dirname(absolutePath);
    await ensureDirectoryExists(dir);
    
    if (DEBUG) console.log(`Saving to: ${absolutePath}`);
    
    await voice.textToSpeech({
      fileName: absolutePath,
      textInput: text,
      voiceId: voiceID,
      stability: 0.5,
      similarityBoost: 0.5,
      modelId: modelID,
      style: 1,
      speakerBoost: true,
    });
    
    if (DEBUG) console.log(`Successfully generated speech file: ${fileName}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('ElevenLabs API authentication failed. Please check your API key.');
      console.error('Response:', error.response.data);
      throw new Error('ElevenLabs API authentication failed');
    }
    console.error('Error in convertTextToSpeech:', error.message);
    if (DEBUG) {
      console.error('Full error details:', error);
    }
    throw error;
  }
}

export { convertTextToSpeech, voice };
