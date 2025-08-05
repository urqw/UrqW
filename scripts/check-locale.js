/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

// Function to get localization object
async function getLocaleObject(filePath) {
    try {
        const fileContent = await readFile(filePath, 'utf8');
        const script = `(function() {
            // Declaration of variables that appear in localization strings
            const urqw_version = '';
            const url_docs = '';
            const url_repo = '';
            const url_issues = '';

            ${fileContent.replace(/^var\s+\w+\s+=\s+/g, '')}
            return ${path.basename(filePath, '.js')};
        })()`;

        return eval(script);
    } catch (error) {
        console.error('Error reading localization file:', error);
        throw error;
    }
}

// Function to count keys in an object
function countKeys(obj) {
    let count = 0;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            count++;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                count += countKeys(obj[key]);
            }
        }
    }
    return count;
}

// Function to compare localizations
async function compareLocalizations(base, target) {
    const missingKeys = [];

    function checkKeys(baseObj, targetObj, prefix = '') {
        for (const key in baseObj) {
            if (!baseObj.hasOwnProperty(key)) continue;

            const fullKey = prefix ? `${prefix}.${key}` : key;

            if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
                if (!targetObj[key] || typeof targetObj[key] !== 'object') {
                    missingKeys.push(fullKey);
                } else {
                    checkKeys(baseObj[key], targetObj[key], fullKey);
                }
            } else if (!targetObj.hasOwnProperty(key)) {
                missingKeys.push(fullKey);
            }
        }
    }

    checkKeys(base, target);
    return missingKeys;
}

async function main() {
    const rootPath = path.resolve(__dirname, '..');
    const localeDir = path.join(rootPath, 'locale');
    const args = process.argv.slice(2);
    let exitCode = 0;

    try {
        // Get a list of all localization files
        const files = await readdir(localeDir)
            .then(files => files
                .filter(file => file.endsWith('.js'))
            );

        // Read the basic localization
        const enPath = path.join(localeDir, 'en.js');
        const enLocale = await getLocaleObject(enPath);
        const totalKeys = countKeys(enLocale);

        if (args.length > 0) {
            // Detailed check mode
            const targetLocale = args[0];
            const targetPath = path.join(localeDir, `${targetLocale}.js`);

            if (!files.includes(`${targetLocale}.js`)) {
                console.error(`Localization ${targetLocale} not found.`);
                process.exit(1);
            }

            const targetLocaleObj = await getLocaleObject(targetPath);
            const missingKeys = await compareLocalizations(enLocale, targetLocaleObj);

            if (missingKeys.length > 0) {
                console.log(`No translations for ${missingKeys.length} strings:`);
                missingKeys.forEach(key => console.log(`- ${key}`));
                exitCode = 1;
            } else {
                console.log(`All strings are translated for ${targetLocale} localization.`);
            }
        } else {
            // General check mode
            const results = {};

            for (const file of files) {
                if (file === 'en.js') continue;

                const localeName = path.basename(file, '.js');
                const localePath = path.join(localeDir, file);
                const localeObj = await getLocaleObject(localePath);
                const missingKeys = await compareLocalizations(enLocale, localeObj);
                const completeness = ((totalKeys - missingKeys.length) / totalKeys * 100).toFixed(2);

                results[localeName] = {
                    completeness: completeness,
                    missing: missingKeys
                };

                if (missingKeys.length > 0) {
                    exitCode = 1;
                }
            }

            console.log('Localization completeness statistics:');
            for (const locale in results) {
                console.log(`- ${locale} - ${results[locale].completeness}%`);
            }
        }

        process.exit(exitCode);
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

main();
