/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const scriptsDir = __dirname;
const customPath = path.join(scriptsDir, 'license-checker.json');
const rootDir = path.resolve(__dirname, '..');
const reportPath = path.join(rootDir, 'third-party_components.txt');

async function generateReport() {
    try {
        if (!fs.existsSync(customPath)) {
            throw new Error(`Configuration file of license-checker not found at path ${customPath}`);
        }

        // Command to run license-checker with parameters
        const command = `license-checker --production --json --customPath "${customPath}"`;

        // Get report from license-checker
        const { stdout } = await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                resolve({ stdout });
            });
        });

        // Parse report in json format
        const licenses = JSON.parse(stdout, (key, value) => {
            if (typeof value === 'string') {
                return value.toString('utf8');
            }
            return value;
        });
    
        // Check data
        if (Object.keys(licenses).length === 0) {
            throw new Error('There is no information about licenses for third-party components.');
        }

        // Generate a report in plain text format
        let report = 'LICENSE NOTICE FOR THIRD-PARTY COMPONENTS\n' +
            'This document provides information about the licenses of\n' +
            'third-party components used in UrqW.\n\n' +
            '='.repeat(79) + '\n\n';

        for (const packageName in licenses) {
            const data = licenses[packageName];

            // Skip the package named urqw
            if (data.name === 'urqw') {
                continue;
            }

            report +=
                `Package: ${data.name}\n` +
                `Version: ${data.version}\n` +
                `Description: ${data.description}\n` +
                `Repository: ${data.repository}\n` +
                `Publisher: ${data.publisher}\n` +
                `URL: ${data.url}\n` +
                `Copyright: ${data.copyright}\n` +
                `Licenses: ${data.licenses}\n` +
                `License modified: ${data.licenseModified}\n` +
                `License text:\n\n${data.licenseText}\n\n` +
                '='.repeat(79) + '\n\n';
        }

        // Write report to file
        fs.writeFileSync(reportPath, report, { encoding: 'utf8' });
        console.log(`The third-party component license report successfully generated to ${reportPath}`);
        process.exit(0);

    } catch (error) {
        console.error('Error creating the third-party components license report:', error.message);
        process.exit(1);
    }
}

generateReport();
