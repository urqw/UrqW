/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Get path to current directory
const rootDir = path.resolve(__dirname, '..');

// Get argument from command line
const pattern = process.argv[2];

// Check presence of argument
if (!pattern) {
    console.error('Please specify a pattern to search for games');
    process.exit(1);
}

// Convert wildcard to regular expression
let regex;
try {
    regex = wildcardToRegex(pattern);
} catch (error) {
    console.error('Error creating regular expression:', error);
    process.exit(1);
}

// Function to convert wildcard to regex
function wildcardToRegex(pattern) {
    return new RegExp('^' + pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
        .replace(/\[/g, '[')
        .replace(/\]/g, ']') + '$', 'i');
}

// Main function
async function packageGames() {
    try {
        // Get list of all directories in games folder
        const gamesDir = path.join(rootDir, 'games');
        const files = await fs.promises.readdir(gamesDir, { withFileTypes: true });
        
        // Filter only directories that match pattern
        const gameDirs = files
            .filter(dirent => dirent.isDirectory() && regex.test(dirent.name))
            .map(dirent => dirent.name);
        
        // Check if games were found
        if (gameDirs.length === 0) {
            console.log(`No games found matching template: ${pattern}`);
            process.exit(1);
        }

        // Function to check directory size
        async function getDirSize(dirPath) {
            const files = await fs.promises.readdir(dirPath);
            let size = 0;
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = await fs.promises.stat(filePath);
                if (stats.isFile()) {
                    size += stats.size;
                }
            }
            return size;
        }

        // Archive every game found
        for (const game of gameDirs) {
            const sourceDir = path.join(gamesDir, game);
            const outputPath = path.join(rootDir, 'quests', `${game}.zip`);
            
            // Check if directory is empty
            const size = await getDirSize(sourceDir);
            if (size === 0) {
                console.log(`Skipping empty directory: ${sourceDir}`);
                continue;
            }

            // Create new archive
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Maximum compression level
            });
            
            // Error handler
            archive.on('error', (err) => {
                throw err;
            });
            
            // Add directory to archive
            archive.directory(sourceDir, false);
            
            // Start archiving
            archive.pipe(output);
            await new Promise((resolve, reject) => {
                archive.finalize(() => {
                    resolve();
                });
                output.on('close', resolve);
                output.on('error', reject);
            });
            
            console.log(`Game ${game} successfully archived to ${outputPath}`);
        }
    } catch (error) {
        console.error(`An error occurred while archiving the game ${game}:`, error);
        process.exit(1);
    }
}

// Run main function
packageGames();
