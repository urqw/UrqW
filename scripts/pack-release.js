/**
 * Copyright (C) 2025, 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const archiver = require('archiver');
const { promisify } = require('util');

// Convert exec to promise
const execPromise = promisify(exec);

// Function to recursive copying of directories
async function copyDirectory(source, destination) {
    await fs.promises.mkdir(destination, { recursive: true });
    const items = await fs.promises.readdir(source);

    for (const item of items) {
        const sourcePath = path.join(source, item);
        const destinationPath = path.join(destination, item);

        const stats = await fs.promises.lstat(sourcePath);

        if (stats.isDirectory()) {
            await copyDirectory(sourcePath, destinationPath);
        } else {
            await fs.promises.copyFile(sourcePath, destinationPath);
        }
    }
}

async function packRelease() {
    try {
        const rootPath = path.resolve(__dirname, '..');
        const releasePath = path.join(rootPath, 'release');

        // Get name and version of package
const packagePath = path.join(rootPath, 'package.json');
        const packageData = await fs.promises.readFile(packagePath, 'utf8');
        const { name, version } = JSON.parse(packageData);

        // If argument is passed, use it as build name
        const customBuildName = process.argv[2];
        let buildName;
        if (customBuildName) {
            buildName = customBuildName;
        } else {
            buildName = `${name}_${version}`;
        }
        const buildPath = path.join(releasePath, buildName);

        // Check the existence and clean the release directory
        try {
            await fs.promises.access(releasePath);
            await fs.promises.rm(releasePath, { recursive: true });
        } catch (err) {
            // If the directory does not exist, just continue
        }

        await fs.promises.mkdir(releasePath);
        await fs.promises.mkdir(buildPath);

        // Define commit hash
        let commitHash = 'unknown';
        const gitHeadPath = path.join(rootPath, '.git', 'HEAD');
        try {
            const headContent = await fs.promises.readFile(gitHeadPath, 'utf8');
            const refLine = headContent.trim();
            if (refLine.startsWith('ref: ')) {
                // Scenario 1: Git on a branch (e.g., ref: refs/heads/master)
                // Get the path to the file with the hash (refs/heads/master -> .git/refs/heads/master)
                const relativeRefPath = refLine.substring(5); 
                const fullRefPath = path.join(rootPath, '.git', relativeRefPath);
                const hashContent = await fs.promises.readFile(fullRefPath, 'utf8');
                commitHash = hashContent.trim();
            } else {
                // Scenario 2: Detached HEAD (Git directly on the commit)
                // The HEAD file contains the commit hash
                commitHash = refLine;
            }
        } catch (err) {
            console.warn('Failed to read .git files directly. Using placeholder.');
        }

        // Define files and directories to copy to release
        const filesAndDirsToCopy = [
            'css',
            'docs',
            'js',
            'locale',
            'CHANGELOG.html',
            'favicon.png',
            'index.html',
            'LICENSE-CC.txt',
            'LICENSE-GPL.txt',
            'logo.svg',
            'package.json',
            'package-lock.json',
            'third-party_components.txt'
        ];

        // Copy files and directories
        for (const item of filesAndDirsToCopy) {
            const source = path.join(rootPath, item);
            const destination = path.join(buildPath, item);

            try {
                const stats = await fs.promises.lstat(source);
                if (stats.isDirectory()) {
                    await copyDirectory(source, destination);
                } else {
                    await fs.promises.copyFile(source, destination);
                }
            } catch (err) {
                // If there is no file/directory, skip it
            }
        }

        // Install production npm dependencies
        await execPromise('npm install --production', {
            cwd: buildPath
        });

        // Delete package.json and package-lock.json
        await fs.promises.unlink(path.join(buildPath, 'package.json'));
        await fs.promises.unlink(path.join(buildPath, 'package-lock.json'));
        // Create quests directory
        await fs.promises.mkdir(path.join(buildPath, 'quests'));
        // Create games.json file
        const gamesJsonPath = path.join(buildPath, 'games.json');
        await fs.promises.writeFile(gamesJsonPath, '[\n]');
        // Create README.txt file
        const readmePath = path.join(buildPath, 'README.txt');
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const buildDate = `${year}-${month}-${day}`;
        const readmeContent = 'UrqW\n\n'
            + `UrqW is an open source engine for text-based games and interactive fiction, available free of charge.\n\n`
            + 'To run the web application, open the index.html file in your browser.\n\n'
            + '- Home page: https://urqw.github.io/UrqW\n'
            + '- Source code: https://github.com/urqw/UrqW\n'
            + `- Version: ${version}\n`
            + `- Build date: ${buildDate}\n`
            + `- Commit hash: ${commitHash}\n`;
        await fs.promises.writeFile(readmePath, readmeContent, 'utf8');

        // Create an archive
        const output = fs.createWriteStream(path.join(releasePath, `${buildName}.zip`));
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.on('error', (err) => {
            throw new Error('Error creating archive: ' + err.message);
        });

        archive.pipe(output);
        archive.directory(buildPath, false);
        await archive.finalize();

        // Wait for the stream to close
        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            output.on('error', reject);
        });

        // Delete the temporary build directory
        await fs.promises.rm(buildPath, { recursive: true });

        console.log(`Release build completed successfully. Archive created on path: ${path.join(releasePath, buildName + '.zip')}`);
        process.exit(0);

    } catch (error) {
        console.error('An error occurred:', error.message);
        process.exit(1);
    }
}

packRelease();
