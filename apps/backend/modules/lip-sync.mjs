import { convertTextToSpeech } from "./elevenLabs.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import { readJsonTranscript, audioFileToBase64, ensureDirectoryExists, getAbsolutePath } from "../utils/files.mjs";
import path from "path";

const DEBUG = process.env.DEBUG === 'true';
const MAX_RETRIES = 10;
const RETRY_DELAY = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const lipSync = async ({ messages }) => {
  // Ensure the audios directory exists
  const audiosDir = getAbsolutePath('audios');
  await ensureDirectoryExists(audiosDir);

  if (DEBUG) console.log('Converting messages to speech...');
  
  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = path.join('audios', `message_${index}.mp3`);
      if (DEBUG) console.log(`Processing message ${index}: "${message.text.substring(0, 50)}..."`);

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await convertTextToSpeech({ text: message.text, fileName });
          await delay(RETRY_DELAY);
          if (DEBUG) console.log(`Message ${index} converted to speech successfully`);
          break;
        } catch (error) {
          if (error.response && error.response.status === 429 && attempt < MAX_RETRIES - 1) {
            if (DEBUG) console.log(`Rate limit hit for message ${index}, attempt ${attempt + 1}/${MAX_RETRIES}`);
            await delay(RETRY_DELAY);
          } else {
            console.error(`Error converting message ${index} to speech:`, error.message);
            throw error;
          }
        }
      }
    })
  );

  if (DEBUG) console.log('Generating phonemes for lip sync...');

  await Promise.all(
    messages.map(async (message, index) => {
      const audioFile = path.join('audios', `message_${index}.mp3`);
      const jsonFile = path.join('audios', `message_${index}.json`);

      try {
        if (DEBUG) console.log(`Generating phonemes for message ${index}`);
        await getPhonemes({ message: index });
        message.audio = await audioFileToBase64({ fileName: audioFile });
        message.lipsync = await readJsonTranscript({ fileName: jsonFile });
        if (DEBUG) console.log(`Successfully processed lip sync for message ${index}`);
      } catch (error) {
        console.error(`Error while processing lip sync for message ${index}:`, error);
        throw error;
      }
    })
  );

  return messages;
};

export { lipSync };
