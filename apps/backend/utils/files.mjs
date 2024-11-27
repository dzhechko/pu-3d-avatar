import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const DEBUG = process.env.DEBUG === 'true';

const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    if (DEBUG) console.log(`Creating directory: ${dirPath}`);
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const getAbsolutePath = (...paths) => {
  const relativePath = path.join(...paths);
  return path.resolve(process.cwd(), relativePath);
};

const execCommand = ({ command }) => {
  if (DEBUG) console.log(`Executing command: ${command}`);
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        if (DEBUG) console.error(`Command error: ${error.message}`);
        reject(error);
      }
      resolve(stdout);
    });
  });
};

const readJsonTranscript = async ({ fileName }) => {
  const filePath = getAbsolutePath(fileName);
  if (DEBUG) console.log(`Reading JSON transcript: ${filePath}`);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON transcript: ${error.message}`);
    throw error;
  }
};

const audioFileToBase64 = async ({ fileName }) => {
  const filePath = getAbsolutePath(fileName);
  if (DEBUG) console.log(`Reading audio file: ${filePath}`);
  try {
    const data = await fs.readFile(filePath);
    return data.toString("base64");
  } catch (error) {
    console.error(`Error reading audio file: ${error.message}`);
    throw error;
  }
};

export { execCommand, readJsonTranscript, audioFileToBase64, ensureDirectoryExists, getAbsolutePath };
