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

// Configuration
const ACOUSTIC_MODEL_URL = 'https://sourceforge.net/projects/cmusphinx/files/Acoustic%20and%20Language%20Models/US%20English/hub4wsj_sc_8k.tar.gz/download';
const TARGET_DIR = path.join(__dirname, '../bin/res/sphinx/acoustic-model');

async function downloadFile(url, targetPath) {
    return new Promise((resolve, reject) => {
        console.log('Downloading file from:', url);
        console.log('Target path:', targetPath);
        
        const file = fs.createWriteStream(targetPath);
        
        https.get(url, response => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Handle redirect
                console.log('Following redirect to:', response.headers.location);
                downloadFile(response.headers.location, targetPath)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log('Download completed');
                resolve();
            });
        }).on('error', err => {
            fs.unlink(targetPath, () => {});
            reject(err);
        });
    });
}

async function extractTarGz(filePath, targetDir) {
    console.log('Extracting file:', filePath);
    console.log('Target directory:', targetDir);
    
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Extract using tar command
    await execAsync(`tar -xzf "${filePath}" -C "${targetDir}"`);
    console.log('Extraction completed');
}

async function setupAcousticModel() {
    try {
        // Create temporary directory
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Download the acoustic model
        const downloadPath = path.join(tempDir, 'acoustic-model.tar.gz');
        await downloadFile(ACOUSTIC_MODEL_URL, downloadPath);
        
        // Extract the files
        await extractTarGz(downloadPath, tempDir);
        
        // Copy required files to target directory
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
        
        // Create target directory if it doesn't exist
        if (!fs.existsSync(TARGET_DIR)) {
            fs.mkdirSync(TARGET_DIR, { recursive: true });
        }
        
        // Copy files
        for (const file of requiredFiles) {
            const sourcePath = path.join(tempDir, 'hub4wsj_sc_8k', file);
            const targetPath = path.join(TARGET_DIR, file);
            
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, targetPath);
                console.log(`Copied ${file} to target directory`);
            } else {
                console.warn(`Warning: Could not find ${file} in extracted files`);
            }
        }
        
        // Cleanup
        console.log('Cleaning up temporary files...');
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        console.log('Setup completed successfully!');
        
    } catch (error) {
        console.error('Error setting up acoustic model:', error);
        process.exit(1);
    }
}

// Run the setup
setupAcousticModel(); 