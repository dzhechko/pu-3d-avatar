import { OpenAIWhisperAudio } from "langchain/document_loaders/fs/openai_whisper_audio";
import { convertAudioToMp3 } from "../utils/audios.mjs";
import fs from "fs";
import path from "path";
import os from "os";
import dotenv from "dotenv";
dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY;
const DEBUG = process.env.DEBUG === 'true';

async function convertAudioToText({ audioData }) {
  try {
    if (DEBUG) console.log('Converting audio to MP3...');
    const mp3AudioData = await convertAudioToMp3({ audioData });
    
    // Use OS temp directory
    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, 'output.mp3');
    
    if (DEBUG) console.log(`Writing MP3 to temporary file: ${outputPath}`);
    fs.writeFileSync(outputPath, mp3AudioData);
    
    if (DEBUG) console.log('Initializing Whisper loader...');
    const loader = new OpenAIWhisperAudio(outputPath, { clientOptions: { apiKey: openAIApiKey } });
    
    if (DEBUG) console.log('Converting audio to text...');
    const doc = (await loader.load()).shift();
    const transcribedText = doc.pageContent;
    
    if (DEBUG) console.log('Cleaning up temporary file...');
    fs.unlinkSync(outputPath);
    
    if (DEBUG) console.log('Audio conversion completed successfully');
    return transcribedText;
  } catch (error) {
    console.error('Error in convertAudioToText:', error);
    throw error;
  }
}

export { convertAudioToText };
