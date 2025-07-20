/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const fs = require('fs').promises;
const path = require('path');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItTOC = require('markdown-it-table-of-contents');

// Variable for error tracking
let exitCode = 0;

// Create instance of markdown-it
const markdown = markdownIt({
    html: true,
    linkify: true,
    typographer: true
});

// Connect plugin for anchors
markdown.use(markdownItAnchor, {
    anchor: {
        permalink: true,
        permalinkBefore: true,
        permalinkSymbol: '¶'
    }
});

// Connect plugin for table of contents (TOC)
markdown.use(markdownItTOC, {
    includeLevel: [2, 3], // Heading levels to include in the TOC
    transformContainerOpen: function() {
        return '<nav class="toc">\n';
    },
    transformContainerClose: function() {
        return '\n</nav>';
    }
});

// Function for handling links
markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    let href = token.attrGet('href');
    
    // Check if link is local
    if (href.startsWith('/') || href.includes('.md')) {
        // Split href into main part and hash
        const [path, hash] = href.split('#');
        
        // Replace .md with .html only in the main part of the path
        const newPath = path.replace(/\.md$/g, '.html');
        
        // Get the final href
        token.attrSet('href', hash ? `${newPath}#${hash}` : newPath);
    }
    
    return self.renderToken(tokens, idx, options);
};

// Function to extract first level heading
function extractTitle(markdownContent) {
    const lines = markdownContent.split('\n');
    for (const line of lines) {
        if (line.startsWith('# ')) {
            return line.slice(2).trim();
        }
    }
    return 'Documentation'; // Default value
}

// Paths definition
const rootDir = path.resolve(__dirname, '..');
const templatePath = path.join(__dirname, 'gen-docs-template.html');
const mdDir = path.join(rootDir, 'md');
const docsDir = path.join(rootDir, 'docs');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

// Function to check for existence of directories and and create non-existent ones
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (err) {
            console.error(`Error creating directory at path ${dirPath}:`, err);
            exitCode = 1;
            throw err;
        }
    }
}

// Function to get HTML file template
async function getTemplate() {
    try {
        return await fs.readFile(templatePath, 'utf8');
    } catch (error) {
        console.error('Error reading documentation template:', error);
        exitCode = 1;
        throw error;
    }
}

// Function to determine the language of a document
function getLanguageFromPath(sourcePath) {
    // Get the relative path from the md directory
    const relativePath = path.relative(mdDir, sourcePath);
    const parts = relativePath.split(path.sep);
    
    // If the file is located directly in the md directory or it is CHANGELOG.md
    if (parts.length === 1 || parts[0] === '..') {
        return 'en';
    }
    
    // Return the first directory as a language
    return parts[0];
}

// Function to convert markdown to HTML using template
async function convertMarkdownFile(mdPath, htmlPath) {
    try {
        const markdownContent = await fs.readFile(mdPath, 'utf8');
        const htmlContent = markdown.render(markdownContent);
        const title = extractTitle(markdownContent);
        
        const template = await getTemplate();
        const lang = getLanguageFromPath(mdPath);
        
        const fullHtml = template
            .replace('{{LANG}}', lang)
            .replace('{{TITLE}}', title)
            .replace('{{CONTENT}}', htmlContent);
        
        await fs.writeFile(htmlPath, fullHtml);
    } catch (error) {
        console.error(`Error converting file at path ${mdPath}:`, error);
        exitCode = 1;
        throw error;
    }
}

// Function for recursive processing of files in the md directory
async function processMdDirectory(sourceDir, targetDir) {
    try {
        await ensureDirectoryExists(targetDir);
        
        const files = await fs.readdir(sourceDir);
        
        for (const file of files) {
            const sourcePath = path.join(sourceDir, file);
            const stats = await fs.stat(sourcePath);
            
            if (stats.isDirectory()) {
                // If it is a directory, process it recursively
                const targetSubDir = path.join(targetDir, file);
                await processMdDirectory(sourcePath, targetSubDir);
            } else if (path.extname(file) === '.md') {
                // If it is a markdown file, convert it
                const htmlFileName = path.basename(file, '.md') + '.html';
                const htmlTargetPath = path.join(targetDir, htmlFileName);
                await convertMarkdownFile(sourcePath, htmlTargetPath);
            } else {
                // For all other files, just copy them
                const targetPath = path.join(targetDir, file);
                await fs.copyFile(sourcePath, targetPath);
            }
        }
    } catch (error) {
        console.error(`Error processing directory at path ${sourceDir}:`, error);
        exitCode = 1;
    }
}

// Main function
async function main() {
    try {
        // Conversion CHANGELOG
        const changelogHtmlPath = path.join(rootDir, 'CHANGELOG.html');
        await convertMarkdownFile(changelogPath, changelogHtmlPath);
        
        // Processing the md directory
        await processMdDirectory(mdDir, docsDir);
        
        console.log('Documentation successfully generated.');
    } catch (error) {
        console.error('Error occurred while generating documentation:', error);
        exitCode = 1;
        throw error;
    }
}

// Run main process
main()
    .then(() => {
        process.exit(exitCode);
    })
    .catch(error => {
        console.error('Error in main process:', error);
        process.exit(1);
    });
