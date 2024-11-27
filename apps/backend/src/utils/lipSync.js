import fs from 'fs';
import path from 'path';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const DEBUG = true;

// URLs for missing Sphinx files
const SPHINX_FILES = {
    'sendump': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/sendump',
    'feat.params': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/feat.params',
    'mdef': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/mdef',
    'means': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/means',
    'mixture_weights': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/mixture_weights',
    'noisedict': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/noisedict',
    'transition_matrices': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/transition_matrices',
    'variances': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/variances'
};

async function downloadFile(url, targetPath) {
    return new Promise((resolve, reject) => {
        if (DEBUG) console.log(`Downloading ${path.basename(targetPath)}...`);
        const file = fs.createWriteStream(targetPath);
        
        https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                if (DEBUG) console.log(`Downloaded ${path.basename(targetPath)}`);
                resolve();
            });
        }).on('error', err => {
            fs.unlink(targetPath, () => {});
            reject(err);
        });
    });
}

async function downloadMissingSphinxFiles(acousticModelPath) {
    if (DEBUG) console.log('Checking for missing Sphinx files...');
    
    try {
        // Create directory if it doesn't exist
        if (!fs.existsSync(acousticModelPath)) {
            fs.mkdirSync(acousticModelPath, { recursive: true });
        }
        
        // Download missing files
        for (const [filename, url] of Object.entries(SPHINX_FILES)) {
            const targetPath = path.join(acousticModelPath, filename);
            if (!fs.existsSync(targetPath)) {
                if (DEBUG) console.log(`${filename} is missing, downloading...`);
                await downloadFile(url, targetPath);
            } else if (DEBUG) {
                console.log(`${filename} already exists`);
            }
        }
        
        if (DEBUG) console.log('All required Sphinx files are present');
        return true;
    } catch (error) {
        console.error('Error downloading Sphinx files:', error);
        return false;
    }
}

function ensureRhubarbDependencies() {
    const sphinxPath = path.join(__dirname, '../../bin/res/sphinx');
    const acousticModelPath = path.join(sphinxPath, 'acoustic-model');
    
    if (DEBUG) {
        console.log('Checking Rhubarb dependencies...');
        console.log('Sphinx path:', sphinxPath);
        console.log('Acoustic model path:', acousticModelPath);
    }

    // Create directories if they don't exist
    if (!fs.existsSync(sphinxPath)) {
        if (DEBUG) console.log('Creating sphinx directory...');
        fs.mkdirSync(sphinxPath, { recursive: true });
    }
    
    if (!fs.existsSync(acousticModelPath)) {
        if (DEBUG) console.log('Creating acoustic-model directory...');
        fs.mkdirSync(acousticModelPath, { recursive: true });
    }

    // Check if acoustic model files exist
    const requiredFiles = [
        'mdef',
        'means',
        'mixture_weights',
        'noisedict',
        'sendump',
        'transition_matrices',
        'variances',
        'feat.params'
    ];

    const missingFiles = requiredFiles.filter(file => {
        const exists = fs.existsSync(path.join(acousticModelPath, file));
        if (DEBUG) {
            console.log(`Checking ${file}: ${exists ? 'Found' : 'Missing'}`);
        }
        return !exists;
    });

    if (missingFiles.length > 0) {
        console.error('Missing acoustic model files:', missingFiles);
        console.error('Please ensure all required files are present in:', acousticModelPath);
        // Try to download missing files
        return downloadMissingSphinxFiles(acousticModelPath);
    }

    if (DEBUG) console.log('All Rhubarb dependencies are in place');
    return true;
}

async function getDuration(audioPath) {
    if (DEBUG) console.log('Getting duration for:', audioPath);
    
    try {
        const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`);
        const duration = parseFloat(stdout);
        if (DEBUG) console.log('Audio duration:', duration);
        return duration;
    } catch (error) {
        console.error('Error getting audio duration:', error);
        return 0;
    }
}

async function convertToWav(mp3Path, wavPath) {
    if (DEBUG) console.log('Converting to WAV:', mp3Path, '->', wavPath);
    
    const startTime = Date.now();
    try {
        await execAsync(`ffmpeg -y -i "${mp3Path}" -acodec pcm_s16le -ar 16000 -ac 1 "${wavPath}"`);
        if (DEBUG) console.log(`Audio conversion done in ${Date.now() - startTime}ms`);
    } catch (error) {
        console.error('Error converting audio:', error);
        throw error;
    }
}

async function processBasicLipSync(messageId, audioPath) {
    if (DEBUG) console.log('Using basic lip sync for message:', messageId);
    
    try {
        const duration = await getDuration(audioPath);
        if (!duration) return null;

        // Generate basic mouth movements with more natural timing
        const fps = 30;
        const frameCount = Math.ceil(duration * fps);
        const mouthShapes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'];
        const frames = [];
        
        // Parameters for more natural movement
        const minShapeDuration = 3; // Minimum frames per shape
        const maxShapeDuration = 8; // Maximum frames per shape
        const transitionProb = 0.3; // Probability of changing shape
        
        let currentShape = 'X';
        let shapeFrameCount = 0;
        let targetFrameCount = Math.floor(Math.random() * (maxShapeDuration - minShapeDuration) + minShapeDuration);

        for (let i = 0; i < frameCount; i++) {
            // Decide if we should change shape
            if (shapeFrameCount >= targetFrameCount && Math.random() < transitionProb) {
                // Avoid repeating the same shape
                let newShape;
                do {
                    newShape = mouthShapes[Math.floor(Math.random() * mouthShapes.length)];
                } while (newShape === currentShape);
                
                currentShape = newShape;
                shapeFrameCount = 0;
                targetFrameCount = Math.floor(Math.random() * (maxShapeDuration - minShapeDuration) + minShapeDuration);
            }

            frames.push({
                time: i / fps,
                value: currentShape
            });
            
            shapeFrameCount++;
        }

        // Ensure closed mouth at start and end
        frames[0] = { time: 0, value: 'X' };
        frames[frames.length - 1] = { time: duration, value: 'X' };

        // Add some transition frames at the start
        const startupFrames = Math.min(5, Math.floor(fps * 0.2)); // 0.2 seconds or 5 frames
        for (let i = 1; i < startupFrames; i++) {
            frames[i] = { time: i / fps, value: 'X' };
        }

        // Add some transition frames at the end
        const winddownFrames = Math.min(5, Math.floor(fps * 0.2));
        for (let i = 0; i < winddownFrames; i++) {
            frames[frames.length - 1 - i] = { time: (frames.length - 1 - i) / fps, value: 'X' };
        }

        if (DEBUG) {
            console.log(`Generated ${frames.length} basic lip sync frames`);
            console.log('First few frames:', frames.slice(0, 5));
            console.log('Last few frames:', frames.slice(-5));
        }
        
        return frames;
    } catch (error) {
        console.error('Error in basic lip sync:', error);
        return null;
    }
}

async function processPhonemes(messageId, audioPath) {
    if (DEBUG) console.log(`Processing phonemes for message ${messageId}:`);
    if (DEBUG) {
        console.log('MP3:', audioPath);
        console.log('WAV:', audioPath.replace('.mp3', '.wav'));
        console.log('JSON:', audioPath.replace('.mp3', '.json'));
    }

    // Get paths
    const sphinxPath = path.join(__dirname, '../../bin/res/sphinx');
    const acousticModelPath = path.join(sphinxPath, 'acoustic-model');
    
    // Check dependencies first
    if (!ensureRhubarbDependencies()) {
        console.error('Rhubarb dependencies are missing. Falling back to basic lip sync...');
        return await processBasicLipSync(messageId, audioPath);
    }

    const wavPath = audioPath.replace('.mp3', '.wav');
    const jsonPath = audioPath.replace('.mp3', '.json');
    const rhubarbPath = path.join(__dirname, '../../bin/rhubarb.exe');

    if (DEBUG) {
        console.log('Paths:', {
            rhubarbPath,
            sphinxPath,
            acousticModelPath,
            wavPath,
            jsonPath
        });
    }

    try {
        // Convert MP3 to WAV
        console.log('Starting conversion for message', messageId);
        await convertToWav(audioPath, wavPath);

        // Run Rhubarb with explicit acoustic model path
        const rhubarbCommand = `"${rhubarbPath}" -f json -o "${jsonPath}" "${wavPath}" -r phonetic --acousticModelPath "${acousticModelPath}" --machineReadable`;
        if (DEBUG) console.log('Executing Rhubarb command:', rhubarbCommand);
        
        console.log('Executing command:', rhubarbCommand);
        await execAsync(rhubarbCommand);

        // Read and parse the JSON output
        console.log('Reading JSON transcript:', jsonPath);
        const jsonContent = fs.readFileSync(jsonPath, 'utf8');
        const mouthCues = JSON.parse(jsonContent);

        if (DEBUG) console.log('Successfully processed lip sync for message', messageId);
        return mouthCues;
    } catch (error) {
        console.error('Rhubarb execution failed:', error);
        console.log('Falling back to basic lip sync...');
        return await processBasicLipSync(messageId, audioPath);
    } finally {
        // Cleanup temporary files
        try {
            if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
            if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
        } catch (error) {
            console.error('Error cleaning up temporary files:', error);
        }
    }
}

module.exports = {
    processPhonemes,
    processBasicLipSync
};