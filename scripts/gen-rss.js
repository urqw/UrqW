/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const fs = require('fs');
const path = require('path');
const moment = require('moment');

const { urqwURL, urqwRepoURL } = require('./common');

// Get path to games.json and rss.xml files
const gamesJsonPath = path.resolve(__dirname, '..', 'games.json');
const rssFile = 'rss.xml';
const rssXmlPath = path.resolve(__dirname, '..', rssFile);
// Define general parameters of rss channel and its items
const channelTitle = 'UrqW Games';
const channelLink = urqwURL;
const channelSelfLink = channelLink + rssFile;
const channelDescription = 'Latest games on UrqW engine';
const channelLanguage = 'en';
const channelTTL = '60';
const numberOfLatestGames = 10;
const itemPublisher = 'UrqW';
const itemPublisherURL = urqwRepoURL;
const itemType = 'InteractiveResource';
const itemFormat = 'text/html';

function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

async function generateRSS() {
    try {
        const gamesJson = await fs.promises.readFile(gamesJsonPath, 'utf-8');
        const games = JSON.parse(gamesJson);

        // Convert all dates to UTC+0
        const sortedGames = games
            .map(game => {
                // Create date in UTC+0 from string YYYY-MM-DD
                const date = moment.utc(game.date, 'YYYY-MM-DD', true);
                return {
                    ...game,
                    date: date.toDate()
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const latestGames = sortedGames.slice(0, numberOfLatestGames);
        const lastBuildDate = latestGames[0].date;

        let rssContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        rssContent += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;
        rssContent += `    <channel>\n`;
        rssContent += `        <title>${channelTitle}</title>\n`;
        rssContent += `        <link>${channelLink}</link>\n`;
        rssContent += `        <description>${channelDescription}</description>\n`;
        rssContent += `        <language>${channelLanguage}</language>\n`;

        // Format date without taking into account local time
        const utcLastBuildDate = moment.utc(lastBuildDate);
        rssContent += `        <pubDate>${utcLastBuildDate.format('ddd, DD MMM YYYY HH:mm:ss Z').replace(/([+-])(\d{2}):(\d{2})/, '$1$2$3')}</pubDate>\n`;
        rssContent += `        <lastBuildDate>${utcLastBuildDate.format('ddd, DD MMM YYYY HH:mm:ss Z').replace(/([+-])(\d{2}):(\d{2})/, '$1$2$3')}</lastBuildDate>\n`;
        rssContent += `        <ttl>${channelTTL}</ttl>\n`;
        rssContent += `    <atom:link href="${channelSelfLink}" rel="self" type="application/rss+xml"/>\n`;

        latestGames.forEach(game => {
            const langCode = game.lang.split(';')[0];
            const gameURL = `${channelLink}?id=${game.folder}`;

            // Format game date without taking into account local time
            const utcGameDate = moment.utc(game.date);

            rssContent += `        <item>\n`;
            rssContent += `            <title xml:lang="${langCode}">${escapeXml(game.title)}</title>\n`;
            rssContent += `            <link>${gameURL}</link>\n`;
            rssContent += `            <description xml:lang="${langCode}">${escapeXml(game.description)}</description>\n`;
            rssContent += `            <pubDate>${utcGameDate.format('ddd, DD MMM YYYY HH:mm:ss Z').replace(/([+-])(\d{2}):(\d{2})/, '$1$2$3')}</pubDate>\n`;
            rssContent += `            <guid>${gameURL}</guid>\n`;
            rssContent += `            <dc:creator xml:lang="${langCode}">${escapeXml(game.author)}</dc:creator>\n`;
            rssContent += `            <dc:publisher>${itemPublisher}</dc:publisher>\n`;
            rssContent += `            <dc:publisher.url>${itemPublisherURL}</dc:publisher.url>\n`;
            rssContent += `            <dc:type>${itemType}</dc:type>\n`;
            rssContent += `            <dc:format>${itemFormat}</dc:format>\n`;
            rssContent += `            <dc:language>${langCode}</dc:language>\n`;
            rssContent += `        </item>\n`;
        });

        rssContent += `    </channel>\n`;
        rssContent += `</rss>`;

        await fs.promises.writeFile(rssXmlPath, rssContent, 'utf-8');

        console.log(`RSS feed successfully generated to ${rssXmlPath}`);
        process.exit(0);
    } catch (error) {
        console.error('Error generating RSS:', error);
        process.exit(1);
    }
}

generateRSS();
