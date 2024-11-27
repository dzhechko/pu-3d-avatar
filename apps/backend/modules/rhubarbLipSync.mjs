import { execCommand, getAbsolutePath, ensureDirectoryExists } from "../utils/files.mjs";
import path from "path";
import fs from 'fs/promises';
import { existsSync } from 'fs';

const DEBUG = process.env.DEBUG === 'true';

// Fallback phonemes when rhubarb is not available
const generateFallbackPhonemes = (duration) => ({
  metadata: {
    duration: duration,
    version: "1.0.0"
  },
  mouthCues: [
    { start: 0, end: duration * 0.1, value: "X" },  // Rest position
    { start: duration * 0.1, end: duration * 0.2, value: "A" },  // Open position
    { start: duration * 0.2, end: duration * 0.3, value: "B" },  // Small mouth
    { start: duration * 0.3, end: duration * 0.4, value: "C" },  // Wide mouth
    { start: duration * 0.4, end: duration * 0.5, value: "D" },  // Round mouth
    { start: duration * 0.5, end: duration * 0.6, value: "E" },  // Small round mouth
    { start: duration * 0.6, end: duration * 0.7, value: "F" },  // Lower lip up
    { start: duration * 0.7, end: duration * 0.8, value: "G" },  // Upper lip down
    { start: duration * 0.8, end: duration * 0.9, value: "H" },  // Corners pulled back
    { start: duration * 0.9, end: duration, value: "X" }   // Back to rest
  ]
});

const checkRhubarbInstallation = async () => {
  const binDir = getAbsolutePath('bin');
  const rhubarbPath = path.join(binDir, process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb');
  
  if (!existsSync(rhubarbPath)) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Rhubarb not found! Follow these steps to install:');
    console.warn('\x1b[36m%s\x1b[0m', '1. Download Rhubarb from: https://github.com/DanielSWolf/rhubarb-lip-sync/releases');
    console.warn('\x1b[36m%s\x1b[0m', `2. Extract the downloaded file`);
    console.warn('\x1b[36m%s\x1b[0m', `3. Copy the rhubarb${process.platform === 'win32' ? '.exe' : ''} file to: ${binDir}`);
    console.warn('\x1b[36m%s\x1b[0m', '4. Make sure the file has execute permissions');
    console.warn('\x1b[33m%s\x1b[0m', 'Using fallback lip sync until Rhubarb is installed...\n');
    return false;
  }
  return true;
};

const getPhonemes = async ({ message }) => {
  try {
    const time = new Date().getTime();
    const mp3File = getAbsolutePath('audios', `message_${message}.mp3`);
    const wavFile = getAbsolutePath('audios', `message_${message}.wav`);
    const jsonFile = getAbsolutePath('audios', `message_${message}.json`);
    const binDir = getAbsolutePath('bin');
    const rhubarbPath = path.join(binDir, process.platform === 'win32' ? 'rhubarb.exe' : 'rhubarb');

    // Ensure directories exist
    await ensureDirectoryExists(path.dirname(mp3File));
    await ensureDirectoryExists(path.dirname(wavFile));
    await ensureDirectoryExists(path.dirname(jsonFile));
    await ensureDirectoryExists(binDir);

    if (DEBUG) {
      console.log(`Processing phonemes for message ${message}:`);
      console.log(`MP3: ${mp3File}`);
      console.log(`WAV: ${wavFile}`);
      console.log(`JSON: ${jsonFile}`);
      console.log(`Rhubarb path: ${rhubarbPath}`);
    }

    // Get audio duration using ffprobe
    const durationCmd = await execCommand({
      command: `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${mp3File}"`
    });
    const duration = parseFloat(durationCmd) || 2.0;

    // Check if rhubarb exists and is executable
    const hasRhubarb = await checkRhubarbInstallation();
    if (!hasRhubarb) {
      const fallbackData = generateFallbackPhonemes(duration);
      await fs.writeFile(jsonFile, JSON.stringify(fallbackData, null, 2));
      return;
    }

    if (DEBUG) console.log(`Starting conversion for message ${message}`);
    
    // Convert MP3 to WAV with proper settings for Rhubarb
    await execCommand({
      command: `ffmpeg -y -i "${mp3File}" -acodec pcm_s16le -ar 16000 -ac 1 "${wavFile}"`
    });
    if (DEBUG) console.log(`Audio conversion done in ${new Date().getTime() - time}ms`);

    // Run Rhubarb lip sync
    try {
      await execCommand({
        command: `"${rhubarbPath}" -f json -o "${jsonFile}" "${wavFile}" -r phonetic --machineReadable`
      });
      if (DEBUG) console.log(`Lip sync generation done in ${new Date().getTime() - time}ms`);
    } catch (rhubarbError) {
      console.error('Rhubarb execution failed:', rhubarbError);
      console.warn('Falling back to basic lip sync...');
      const fallbackData = generateFallbackPhonemes(duration);
      await fs.writeFile(jsonFile, JSON.stringify(fallbackData, null, 2));
    }

    // Clean up WAV file
    try {
      await fs.unlink(wavFile);
    } catch (error) {
      console.warn('Could not delete temporary WAV file:', error);
    }
    
  } catch (error) {
    console.error(`Error while getting phonemes for message ${message}:`, error);
    throw error;
  }
};

export { getPhonemes };