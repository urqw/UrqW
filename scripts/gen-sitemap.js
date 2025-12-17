/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const fs = require('fs');
const path = require('path');

const { urqwURL } = require('./common');

const rootDir = path.resolve(__dirname, '..');

// Object for storing links and their priorities
const links = {};

// Add the main page
links[urqwURL] = '1.0';

try {
    // Process .zip files in the /quests directory
    const questsDir = path.join(rootDir, 'quests');
    const zipFiles = fs.readdirSync(questsDir).filter(file => file.endsWith('.zip'));

    zipFiles.forEach(file => {
        const name = file.slice(0, -4); // Delete .zip from the end
        const url = `${urqwURL}?id=${name}`;
        links[url] = '0.9';
    });

    // Process folders in the /quests directory
    const questFolders = fs.readdirSync(questsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    questFolders.forEach(folder => {
        const url = `${urqwURL}?id=${folder}`;
        links[url] = '0.9';
    });

    // Recursively search for .html files in the /docs directory
    const docsDir = path.join(rootDir, 'docs');

    function findHtmlFiles(dir, basePath = '') {
        const files = fs.readdirSync(dir);
        const htmlFiles = [];

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const relativePath = path.join('docs', basePath, file);

            if (fs.statSync(filePath).isDirectory()) {
                // Recursive call for subdirectories
                htmlFiles.push(...findHtmlFiles(filePath, path.join(basePath, file)));
            } else if (file.endsWith('.html')) {
                htmlFiles.push(relativePath);
            }
        });

        return htmlFiles;
    }

    const htmlFiles = findHtmlFiles(docsDir);
    htmlFiles.forEach(file => {
        // Normalize URL path separators (replace \ with /)
        const normalizedPath = file.split(path.sep).join('/');
        const url = `${urqwURL}${normalizedPath}`;
        links[url] = '0.8';
    });

    // Verification: The number of URLs must not exceed 50000
    const totalLinks = Object.keys(links).length;
    if (totalLinks > 50000) {
        console.error(`Error: The number of URLs in the sitemap exceeds the limit of 50000 (current number: ${totalLinks}).`);
        process.exit(1);
    }

    // Generate XML sitemap content
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    Object.keys(links).forEach(url => {
        xmlContent += `\t<url>\n`;
        xmlContent += `\t\t<loc>${url}</loc>\n`;
        xmlContent += `\t\t<priority>${links[url]}</priority>\n`;
        xmlContent += `\t</url>\n`;
    });

    xmlContent += `</urlset>`;

    // Write to sitemap.xml file
    const sitemapPath = path.join(rootDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xmlContent, 'utf8');

    // Verification: File size must not exceed 50 MB
    const fileStats = fs.statSync(sitemapPath);
    const fileSizeInBytes = fileStats.size;
    const maxSizeInBytes = 50*1024*1024; // 50 MB in bytes

    if (fileSizeInBytes > maxSizeInBytes) {
        console.error(`Error: Sitemap.xml file size exceeds 50 MB limit (current size: ${(fileSizeInBytes/1024/1024).toFixed(2)} MB).`);
        process.exit(1);
    }

    console.log(`The sitemap file successfully generated to ${sitemapPath}`);
    process.exit(0);

} catch (error) {
    console.error('Error generating sitemap.xml:', error.message);
    process.exit(1);
}
