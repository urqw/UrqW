/**
 * Copyright (C) 2015 Akela <akela88@bk.ru>
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/**
 * @param {int} value
 */
var dosColorToHex = function(value) {
    if (value > 15) value = value % 16;
    switch (value) {
        case 0: return '#000000';
        case 1: return '#0000AA';
        case 2: return '#00AA00';
        case 3: return '#00AAAA';
        case 4: return '#AA0000';
        case 5: return '#AA00AA';
        case 6: return '#AA5500';
        case 7: return '#AAAAAA';
        case 8: return '#555555';
        case 9: return '#5555FF';
        case 10: return '#55FF55';
        case 11: return '#55FFFF';
        case 12: return '#FF5555';
        case 13: return '#FF55FF';
        case 14: return '#FFFF55';
        case 15: return '#FFFFFF';
        default: return '#000000';
    }
};

var isFloat =function (n){
    return n === Number(n) && n % 1 !== 0;
};

function win2unicode(str) {
    var charmap   = unescape(
        "%u0402%u0403%u201A%u0453%u201E%u2026%u2020%u2021%u20AC%u2030%u0409%u2039%u040A%u040C%u040B%u040F"+
        "%u0452%u2018%u2019%u201C%u201D%u2022%u2013%u2014%u0000%u2122%u0459%u203A%u045A%u045C%u045B%u045F"+
        "%u00A0%u040E%u045E%u0408%u00A4%u0490%u00A6%u00A7%u0401%u00A9%u0404%u00AB%u00AC%u00AD%u00AE%u0407"+
        "%u00B0%u00B1%u0406%u0456%u0491%u00B5%u00B6%u00B7%u0451%u2116%u0454%u00BB%u0458%u0405%u0455%u0457");

    var code2char = function(code) {
        if(code >= 0xC0 && code <= 0xFF) return String.fromCharCode(code - 0xC0 + 0x0410);
        if(code >= 0x80 && code <= 0xBF) return charmap.charAt(code - 0x80);
        return String.fromCharCode(code)
    };
    
    var res = "";
    
    for (var i = 0; i < str.length; i++) {
        res = res + code2char(str.charCodeAt(i));
    }
    
    return res
}

/**
 * @param {string} value
 */
function isValidBase64(str) {
    // Base64 can contain A-Z, a-z, 0-9, +, / and = (for padding)
    var base64RegExp = /^[A-Za-z0-9+/=]*$/;
    return base64RegExp.test(str);
}

/**
 * @param {string} value
 */
function unicode2base(str) {
    try {
        var encoder = new TextEncoder();
        var buffer = encoder.encode(str);
        return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    } catch(error) {
        return '';
    }
}

/**
 * @param {string} value
 */
function base2unicode(b64) {
    if (!isValidBase64(b64)) {
        return '';
    }
    try {
        var byteArray = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        var decoder = new TextDecoder('utf-8');
        return decoder.decode(byteArray);
    } catch(error) {
        return '';
    }
}

/**
 * @param {string} value
 */
function murmurhash3_32(str) {
    var len = str.length;
    var seed = 0; // Any initial value is acceptable
    var nblocks = len - 4;
    var h1 = seed;
    var c1 = 0xcc9e2d51;
    var c2 = 0x1b873593;
    var i = -1;
    var k1 = 0;
    var tmp;

    while (i < nblocks) {
        i += 4;
        k1 = str.charCodeAt(i) & 0xff |
             (str.charCodeAt(i + 1) & 0xff) << 8 |
             (str.charCodeAt(i + 2) & 0xff) << 16 |
             (str.charCodeAt(i + 3) & 0xff) << 24;

        k1 = rotl32(k1 * c1, 15);
        k1 = k1 * c2;

        h1 ^= k1;
        h1 = rotl32(h1, 13);
        h1 = h1 * 5 + 0xe6546b64;
    }

    k1 = 0;
    switch (len % 4) {
        case 3: k1 ^= str.charCodeAt(i + 2) << 16;
        case 2: k1 ^= str.charCodeAt(i + 1) << 8;
        case 1: k1 ^= str.charCodeAt(i + 0);
            k1 *= c1;
            k1 = rotl32(k1, 15);
            k1 *= c2;
            h1 ^= k1;
    }

    h1 ^= len;
    h1 = fmix(h1);
    return h1 >>> 0;

    function rotl32(x, r) {
        return (x << r) | (x >>> (32 - r));
    }

    function fmix(h) {
        h ^= h >>> 16;
        h = (h * 0x85ebca6b) & 0xffffffff;
        h ^= h >>> 13;
        h = (h * 0xc2b2ae35) & 0xffffffff;
        h ^= h >>> 16;
        return h;
    }
}

/**
 * @param {string} content with HTML
 * @param {array} allowed tags
 */
function getEscapedHtmlWithAllowedTags(html, allowedTags) {
    if (!allowedTags || !Array.isArray(allowedTags)) {
        allowedTags = [];
    }

    // Regular expression for searching tags and text
    var tagRegex = /<([^>]+)>|[^<>]+/g;

    // Function to process each part
    function processPart(match) {
        // If it is a tag
        if (match.startsWith('<')) {
            var content = match.slice(1, -1);
            var tagName = content.match(/^\/?\s*([a-zA-Z]+)/);
            
            if (tagName && allowedTags.includes(tagName[1].toLowerCase())) {
                return match; // Return the tag as is
            }
            
            // Escape disallowed tag
            return match
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
        
        // If it is text, escape only the necessary characters
        return $('<div>')
            .text(match)
            .html()
            .replace(/&amp;/g, '&'); // Restore ampersands
    }

    // Split the HTML into parts and process each one
    return html.replace(tagRegex, processPart);
}

/**
 * @param {string} value
 */
function announceForAccessibility(message) {
    var div = document.createElement('div');
    div.classList.add('sr-only');
    div.setAttribute('role', 'alert');
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => {
        document.body.removeChild(div);
    }, 3000);
}


var MIME = [];

MIME['bmp'] = 'image/bmp';
MIME['gif'] = 'image/gif';
MIME['jpg'] = 'image/jpeg';
MIME['jpeg'] = 'image/jpeg';
MIME['png'] = 'image/png';

MIME['mid'] = 'audio/midi';
MIME['midi'] = 'audio/midi';
MIME['mp3'] = 'audio/mp3';



    