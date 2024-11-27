import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct download URLs for the required files
const FILES = {
    'sendump': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/sendump',
    'feat.params': 'https://raw.githubusercontent.com/cmusphinx/sphinx4/master/sphinx4-data/src/main/resources/edu/cmu/sphinx/models/en-us/en-us/feat.params'
};

const TARGET_DIR = path.join(__dirname, '../../bin/res/sphinx/acoustic-model');

function downloadFile(url, targetPath) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${path.basename(targetPath)}...`);
        const file = fs.createWriteStream(targetPath);
        
        https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${path.basename(targetPath)}`);
                resolve();
            });
        }).on('error', err => {
            fs.unlink(targetPath, () => {});
            reject(err);
        });
    });
}

async function downloadSphinxFiles() {
    try {
        // Create target directory if it doesn't exist
        if (!fs.existsSync(TARGET_DIR)) {
            fs.mkdirSync(TARGET_DIR, { recursive: true });
        }
        
        // Download each file
        for (const [filename, url] of Object.entries(FILES)) {
            const targetPath = path.join(TARGET_DIR, filename);
            if (!fs.existsSync(targetPath)) {
                await downloadFile(url, targetPath);
            } else {
                console.log(`${filename} already exists, skipping...`);
            }
        }
        
        console.log('All files downloaded successfully!');
        
    } catch (error) {
        console.error('Error downloading files:', error);
        process.exit(1);
    }
}

// Run the download
downloadSphinxFiles(); 