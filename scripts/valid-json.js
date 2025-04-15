/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const fs = require('fs');
const path = require('path');

// Get path to games.json file
const gamesJsonPath = path.resolve(__dirname, '..', 'games.json');

async function validateGamesJson() {
    try {
        // Read file
        const fileContent = await fs.promises.readFile(gamesJsonPath, 'UTF-8');

        // Try convert to JSON
        const gamesData = JSON.parse(fileContent);
 
        console.log('The games.json file is valid JSON');
        process.exit(0);

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('The games.json file not found');
        } else if (error instanceof SyntaxError) {
            console.error('The games.json file contains a JSON syntax error');
        } else {
            console.error('An error occurred while validating the games.json file:', error);
        }
        process.exit(1);
    }
}

// Start validation
validateGamesJson();
