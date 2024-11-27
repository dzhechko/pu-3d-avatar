import fs from "fs";
import path from "path";
import { execCommand } from "./files.mjs";

const DEBUG = process.env.DEBUG === 'true';

async function convertAudioToMp3({ audioData }) {
  try {
    const dir = 'tmp';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    
    const inputPath = path.join(dir, "input.webm");
    const outputPath = path.join(dir, "output.mp3");
    
    if (DEBUG) console.log('Writing webm data to temporary file...');
    fs.writeFileSync(inputPath, Buffer.from(audioData, 'base64'));
    
    if (DEBUG) console.log(`Converting webm to mp3: ${inputPath} -> ${outputPath}`);
    // Updated ffmpeg command with proper input format and codec settings
    await execCommand({ 
      command: `ffmpeg -y -f webm -i "${inputPath}" -acodec libmp3lame -ar 44100 -ac 2 -ab 192k "${outputPath}"`
    });
    
    if (DEBUG) console.log('Reading converted MP3 file...');
    const mp3AudioData = fs.readFileSync(outputPath);
    
    if (DEBUG) console.log('Cleaning up temporary files...');
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    
    return mp3AudioData;
  } catch (error) {
    console.error('Error in convertAudioToMp3:', error);
    throw error;
  }
}

export { convertAudioToMp3 };