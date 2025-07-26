/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
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
        const packagePath = path.join(rootPath, 'package.json');

        // Name and version of build
        const packageData = await fs.promises.readFile(packagePath, 'utf8');
        const { name, version } = JSON.parse(packageData);
        const buildName = `${name}_${version}`;
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
