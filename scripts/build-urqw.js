/**
 * Copyright (C) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const fs = require('fs');
const path = require('path');
const { readFileSync, writeFileSync, readdirSync, unlinkSync, rmdirSync, mkdirSync } = fs;
const { minify: terserMinify } = require('terser');
const csso = require('csso');
const { minify: htmlMinify } = require('html-minifier-terser');

// Utilities

function ensureDir(dirPath) {
    try {
        mkdirSync(dirPath, { recursive: true });
    } catch (e) {
        if (e.code !== 'EEXIST') throw e;
    }
}

function removeDirRecursiveSafe(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            removeDirRecursiveSafe(fullPath);
            try { rmdirSync(fullPath); } catch(e) {}
        } else {
            try { unlinkSync(fullPath); } catch(e) {}
        }
    }
    try { rmdirSync(dirPath); } catch(e) { if (e.code !== 'ENOENT') throw e; }
}

function fail(message) {
    console.error(`Build error: ${message}`);
    process.exit(1);
}

// Escaping special characters for RegExp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper to determine if a file path belongs to a library (should not be minified)
function isLibraryFile(filePath) {
    return filePath.includes('node_modules');
}

// Basic logic

(async () => {
    const projectRoot = path.resolve(__dirname, '..');
    const distDir = path.join(projectRoot, 'dist');
    const devIndexPath = path.join(projectRoot, 'index-dev.html');
    const prodIndexPath = path.join(projectRoot, 'index.html');

    if (!fs.existsSync(devIndexPath)) {
        fail(`File index-dev.html not found in ${projectRoot}`);
    }

    // Clear dist
    removeDirRecursiveSafe(distDir);
    ensureDir(distDir);

    let htmlContent;
    try {
        htmlContent = readFileSync(devIndexPath, 'utf-8');
    } catch (err) {
        fail(`Unable to read index-dev.html: ${err.message}`);
    }

    // Regular expressions
    // CSS: .css files only
    const cssRegex = /<link[^>]*href=["']([^"']+\.css)["'][^>]*>/gi;
    // JS: only <script> with src attribute and .js file
    const jsRegex = /<script[^>]*src=["']([^"']+\.js)["'][^>]*\/?>(?:<\/script>)?/gi;

    const cssFiles = [];
    const jsFiles = [];

    let match;

    cssRegex.lastIndex = 0;
    while ((match = cssRegex.exec(htmlContent)) !== null) {
        cssFiles.push(match[1]);
    }

    jsRegex.lastIndex = 0;
    while ((match = jsRegex.exec(htmlContent)) !== null) {
        jsFiles.push(match[1]);
    }

    if (cssFiles.length === 0 && jsFiles.length === 0) {
        console.warn('Warning: No included CSS or JS files found.');
    }

    // CSS Processing:
    // Separate libraries and app code to avoid unnecessary processing
    // and to strictly preserve the cascade order defined in the HTML
    if (cssFiles.length > 0) {
        let combinedCss = '';
        
        console.log('Processing CSS files in original order:');

        for (const cssPath of cssFiles) {
            const absolutePath = path.resolve(projectRoot, cssPath);
            
            if (!fs.existsSync(absolutePath)) {
                fail(`CSS file not found: ${absolutePath}`);
            }

            const fileContent = readFileSync(absolutePath, 'utf-8');
            const fileName = path.basename(cssPath);

            if (isLibraryFile(cssPath)) {
                combinedCss += '\n' + fileContent;
                console.log(`  [LIB] Added: ${fileName}`);
            } else {
                console.log(`  [APP] Minifying: ${fileName}...`);
                try {
                    // restructure: false is CRITICAL for engine: it preserves the exact order of rules
                    // This ensures that subsequent styles correctly override core/library styles via cascade
                    const result = csso.minify(fileContent, {
                        sourceMap: false, 
                        restructure: false 
                    });
                    combinedCss += '\n' + result.css;
                    console.log(`  [APP-MIN] Added minified: ${fileName}`);
                } catch (err) {
                    fail(`CSS minification error for ${fileName}: ${err.message}`);
                }
            }
        }

        writeFileSync(path.join(distDir, 'style.min.css'), combinedCss, 'utf-8');
        console.log('Final CSS bundle saved: dist/style.min.css');
    }

    // JS Processing:
    // Libraries are added raw to prevent breaking already-minified code or dynamic logic
    // Only engine is processed by Terser
    if (jsFiles.length > 0) {
        let finalBundle = '';
        
        console.log('Processing JS files in original order:');

        for (const jsPath of jsFiles) {
            const absPath = path.resolve(projectRoot, jsPath);
            
            if (!fs.existsSync(absPath)) {
                fail(`JS file not found: ${absPath}`);
            }

            const fileName = path.basename(jsPath);

            if (isLibraryFile(jsPath)) {
                finalBundle += '\n' + readFileSync(absPath, 'utf-8');
                console.log(`  [LIB] Added: ${fileName}`);
            } else {
                console.log(`  [APP] Minifying: ${fileName}...`);
                
                const appCode = readFileSync(absPath, 'utf-8');
                
                const result = await terserMinify(appCode, {
                    sourceMap: false,
                    compress: {
                        drop_console: false, // Keep console.log for game authors' debugging
                        dead_code: false, // DO NOT remove unused code; games may call it dynamically
                        evaluate: true // Safely simplify expressions and math
                    },
                    mangle: {
                        reserved: ['$', 'jQuery'], // Protect global names used by libraries
                        properties: false // Do not rename object keys (prevents breakage with obj['key'])
                    },
                    ecma: 2017,
                    output: { comments: false }
                });

                finalBundle += '\n' + result.code;
                console.log(`  [APP-MIN] Added minified: ${fileName}`);
            }
        }

        writeFileSync(path.join(distDir, 'bundle.js'), finalBundle, 'utf-8');
        console.log('Final JS bundle saved: dist/bundle.js');
    }

    // HTML Generation
    console.log('Processing HTML content from index-dev.html:');
    let updatedHtml = htmlContent;

    const newCssTag = `<link href="dist/style.min.css" rel="stylesheet">`;
    const newJsTag = `<script src="dist/bundle.js"></script>`;

    // Processing CSS links
    if (cssFiles.length > 0) {
        console.log('  Replacing links to CSS files...');
        updatedHtml = updatedHtml.replace(cssRegex, newCssTag);
        const firstCssIndex = updatedHtml.indexOf(newCssTag);
        if (firstCssIndex !== -1) {
            const partBefore = updatedHtml.substring(0, firstCssIndex + newCssTag.length);
            let restPart = updatedHtml.substring(firstCssIndex + newCssTag.length);
            const safeTag = escapeRegExp(newCssTag);
            restPart = restPart.replace(new RegExp(safeTag + '\\n?', 'g'), '');
            updatedHtml = partBefore + restPart;
        }
    }

    // Processing JS links
    if (jsFiles.length > 0) {
        console.log('  Replacing links to JS files...');
        updatedHtml = updatedHtml.replace(jsRegex, newJsTag);
        const firstJsIndex = updatedHtml.indexOf(newJsTag);
        if (firstJsIndex !== -1) {
            const partBefore = updatedHtml.substring(0, firstJsIndex + newJsTag.length);
            let restPart = updatedHtml.substring(firstJsIndex + newJsTag.length);
            const safeTag = escapeRegExp(newJsTag);
            restPart = restPart.replace(new RegExp(safeTag + '\\n?', 'g'), '');
            updatedHtml = partBefore + restPart;
        }
    }

    // Replacing links to index file
    console.log('  Replacing links to index-dev.html...');
    updatedHtml = updatedHtml.replace(/href=["']index-dev\.html["']/gi, `href="index.html"`);

    // Minification HTML
    console.log('  Minifying HTML content...');
    try {
        const minifiedHtml = await htmlMinify(updatedHtml, {
            collapseWhitespace: true, // Delete extra spaces and line breaks between tags
            removeComments: true, // Delete comments
            removeAttributeQuotes: false, // Leave quotes around attributes (safer and more readable)
            minifyJS: true, // Minify JS inside <script>
            minifyCSS: false, // Do not minify CSS inside <style>
            caseSensitive: false, // Ignore case of letters when processing
            keepClosingSlash: false,               // Delete closing slashes from self-closing tags
            sortAttributes: false, // Do not sort attributes (keep original order)
            sortClassName: false // Do not sort class names in the class attribute (keep original order)
        });

        if (typeof minifiedHtml !== 'string') {
            fail('HTML minification returned non-string data');
        }

        try {
            writeFileSync(prodIndexPath, minifiedHtml, 'utf-8');
            console.log(`Final HTML content saved: ${prodIndexPath}`);
        } catch (err) {
            fail(`Failed to write index.html: ${err.message}`);
        }
    } catch (err) {
        fail(`HTML minification error: ${err.message}`);
    }

    console.log('The UrqW engine has been successfully built.');
    process.exit(0);
})();
