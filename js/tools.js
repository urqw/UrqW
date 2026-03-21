/**
 * Copyright (C) 2015 Akela <akela88@bk.ru>
 * Copyright (C) 2025, 2026 Nikita Tseykovets <tseikovets@rambler.ru>
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
 * Function for normalizing internal paths to game files
 * @param {string} value
 */
function normalizeInternalPath(path) {
    path = path.toString().trim();
    path = path.replace(/\\/g, '/');
    path = path.replace(/^\/+/, '');
    return path;
}

/**
 * Function to get the URL of a game file by its normalized internal path
 * @param {string} value
 */
function getGameFileURL(filePath) {
    if (files === null) {
        filePath = questPath + '/' + filePath;
    } else {
        filePath = files[filePath]; // todo
    }
    return filePath;
}

/**
 * Converts qs1 to qst
 * @param {Uint8Array} data - encoded data
 * @returns {Uint8Array} - decoded data
 */
function qs1ToQst(data) {
    var result = new Uint8Array(data.length);

    for (var i = 0; i < data.length; i++) {
        var byte = data[i];

        if (byte >= 32) {
            result[i] = (31 - byte) & 0xFF;
        } else {
            result[i] = byte;
        }
    }

    return result;
}

/**
 * Converts qs2 to qst
 * @param {Uint8Array} data - encoded data
 * @returns {Uint8Array} - decoded data
 */
function qs2ToQst(data) {
    // Blowfish constants

    var cBF_PBox = new Uint32Array([
        0x039D95EE, 0xBEF33801, 0x9A152D7E, 0x31F13B03, 0xA9F663AC, 0xF427CF98,
        0xC32E14BD, 0xED4F42B3, 0x8C77D2D7, 0x8AB31B39, 0x88BEB9DE, 0x06BBEA7A,
        0x5BA06D72, 0xFA7AC867, 0xB683BA7E, 0x92D7AC31, 0x2C3FF5CC, 0xD75B1994
    ]);

    var flatSBox = new Uint32Array([
        0x9A14FF43, 0x43420A09, 0x9B73CF6C, 0x0943E8EC,
        0x03B80983, 0xF523BDED, 0x92843320, 0x9A26BECD,
        0xF5541795, 0xA7B8A4B5, 0xC6D11F3C, 0x16A83F04,
        0x74248421, 0xE85991D9, 0x7229DDA0, 0x2AA5B621,
        0x6AEFA9CB, 0x044F5571, 0xDF86689E, 0xBD249D71,
        0x1142585E, 0xBDBA27D0, 0x3685EFC1, 0x941E0B09,
        0x48F307D3, 0xED6627BA, 0xBBC88B7B, 0x583164ED,
        0x7BA14D60, 0x16AC4DEA, 0x08739258, 0xE56466BD,
        0x8DEA7004, 0x8329A1CA, 0x6A7A45B9, 0x085E29EB,
        0xDC72BF1F, 0x76523555, 0x19778640, 0x973FF523,
        0xEAA6B4AA, 0x6A741C21, 0xE3439F6A, 0x1E84C9AE,
        0x8297BEB8, 0x751592F5, 0x620AB14D, 0xD71CCD00,
        0xF2B8B43D, 0xECE33BC7, 0xE1AB8030, 0x23A396FD,
        0xD84A38A5, 0xF09B3068, 0x38DF58D2, 0x4BFFA14B,
        0x17EFD907, 0xBEFAE6B0, 0xA9AE5982, 0xB28F3775,
        0x90AE6687, 0x43EBC589, 0x4F687595, 0x29532D3D,
        0xD390828B, 0xB6724351, 0x24086540, 0x7DCB78A6,
        0xD6FDFBF2, 0xD080BFF6, 0x532DBFFD, 0xAEAF5056,
        0xC26066BE, 0x999D1B44, 0x65C4AA33, 0x6FD8B6DC,
        0x6AAE508E, 0x6AFE8985, 0xBB2D3ADC, 0x139841EB,
        0x2DC2E381, 0xCB9E05A2, 0xB3EB1374, 0x08936953,
        0xC07A5815, 0xFE4E1260, 0x42EE14DC, 0x7D1F8BB0,
        0x1422076A, 0x930957DE, 0xCFA9FA06, 0xB1EBC2AF,
        0xA70B0C0F, 0x324345E3, 0x4ECDCA24, 0x27F2010B,
        0x0BEFC627, 0x1C54830B, 0xA9C19EC8, 0x8DBF5C56,
        0x54193116, 0x5003BC03, 0x86F528D5, 0x78BFF3B1,
        0x2277C971, 0x32C4100D, 0x2C4507B1, 0x0D240FD6,
        0x8A4E5020, 0xCA33E40E, 0x340E16CA, 0x92B14ED0,
        0xF9A83CBA, 0xFC1C046F, 0x34F2FAF0, 0x2BAE16A5,
        0x245CCA24, 0x44CA06E7, 0xDAA9F4B5, 0x391E9743,
        0x8CE503BC, 0xBDEFFEFD, 0x553FBA87, 0xFAF4F3DB,
        0x2F49C4EE, 0x0F829A73, 0x3DA589D7, 0x6A503C35,
        0x4AE161BB, 0x5829F5E7, 0x2F8D021C, 0x813A5713,
        0x27275279, 0xDD6D9585, 0xC89EF71F, 0xA7FA9F60,
        0xEB4C81EB, 0x5EAA8A83, 0x008120E5, 0x4C00C232,
        0xC2945B4C, 0x44C46C06, 0x24BF89EE, 0xDA363310,
        0x04FF9D99, 0x76C96DED, 0x16864797, 0x144148EF,
        0x4A12D620, 0x0354F45B, 0x0406F057, 0x292E7D11,
        0xF36C4B62, 0x8E330726, 0x3D8EACC4, 0x5092B701,
        0x9C38CCBF, 0x594924B3, 0xF8019BE8, 0x9121DE7F,
        0x1B97686B, 0x370F0574, 0x55727A19, 0x808B3069,
        0x389F72DF, 0xBD8FF7FF, 0x519A11B1, 0xC98593CD,
        0xDDE47D38, 0xB63BF013, 0xCA9D1BD7, 0x12367604,
        0xDC3BDCF8, 0x3A7D7215, 0xC1D9F6EE, 0xB356ABEA,
        0x14CDEF5B, 0xCD98B56F, 0x978FFFF8, 0x7EFA787F,
        0xB66CBF94, 0xB6F33758, 0x6E221261, 0xD2C577D6,
        0xB5B92FAC, 0xC4ED06CC, 0x054E789E, 0xE56FB949,
        0xE8910103, 0xE70A0B65, 0x5BDF2477, 0xFD224EC2,
        0xBEC720B6, 0xB1439243, 0xBE9E4623, 0x4F8A37BC,
        0x92E0E022, 0x70EE5D3C, 0xED781725, 0xD23014DA,
        0xF5AFCCAF, 0x77FE3226, 0x05F36AEE, 0x3A43690E,
        0x91A1EF70, 0x67E6E0F3, 0xB3ED5CB0, 0x82E2AC91,
        0x1EC2596F, 0xF9C25422, 0xF13A7FBB, 0xA5A937DE,
        0xA788FB1D, 0x55FB6F4A, 0xC3A452DA, 0x48C663A3,
        0xEA136444, 0x84F45A85, 0xE52E1024, 0xBDA13FC1,
        0x9BBE54E1, 0x489DE15C, 0xE7A9E8B8, 0xEE2B3350,
        0xC0001EF3, 0xB38C30DF, 0xF55B6E5C, 0x383D86A8,
        0xDE167A06, 0x955A0F52, 0x8EE247B5, 0xE483EAE7,
        0xDD2BC2E5, 0xE7CAA2C6, 0xE34FEDAB, 0xF46A27A0,
        0x6FE8B872, 0x7D020784, 0x5D224DB9, 0x1FB83F74,
        0x822DF0B9, 0x0F9DFFF4, 0xF91B1017, 0x29926DF2,
        0x7F323111, 0x3F965F09, 0xAA0A40DA, 0x01B85DD3,
        0x699AA950, 0x4379D43D, 0x1FCD2744, 0xE3DE2557,
        0xD51D63D4, 0x0D64B95D, 0x3FD49D9C, 0x584EC7FA,
        0xAF5AB8FB, 0x4F32164E, 0x4FC0ACA5, 0x09B3079F,
        0x8995F6E2, 0xD49C4954, 0x9A55F877, 0x36DFF050,
        0x035299EA, 0x5B6E478A, 0xEB38FD92, 0x2226EDAA,
        0x9846C822, 0xC9380D9C, 0xE6771A1E, 0x732901E4,
        0x6FA5FDB0, 0x01EB1370, 0x07F0309C, 0xD236B4B9,
        0xA640D4E3, 0x75259536, 0xAFFAD1FE, 0x8D1A1208,
        0x5029358D, 0xED17419A, 0x7D4C2195, 0xCBFAFFE9,
        0x15D8623B, 0xE3EFE746, 0x58066FB3, 0x3A3DEDFB,
        0x1E2A596F, 0x000297E2, 0xE13A7029, 0xB23C04F6,
        0x8DD5245C, 0xD65147FB, 0xA56694C4, 0x5E239B85,
        0x61DD7999, 0x9B101989, 0x56435412, 0x79D4CDEC,
        0xCB1EAE16, 0x5E9CADAF, 0x985BD9F3, 0xE5D4A312,
        0x3E29DB93, 0xCD924296, 0xA186F16B, 0x66E72F8C,
        0x5A6A18F2, 0x5CD4CCAD, 0x7C80129C, 0xBE73D6F6,
        0xC3E47291, 0xBEAC3073, 0xC0E9F583, 0x74B5755F,
        0xEB9AAF9F, 0x695C0877, 0x29F5B464, 0x210DCAF0,
        0x72A17FF0, 0xCCB312C6, 0x110C0A49, 0x76E4ECBF,
        0x3183F507, 0x66D1710B, 0x0600AA30, 0x1B5543A6,
        0x85D82F14, 0xA8B1DF9D, 0xDCE20463, 0x9DD7163D,
        0x0113AD51, 0x5296E4BD, 0x2A4E2B17, 0x7A851BF6,
        0x69AA4B42, 0xFDF7B8A9, 0x1823EAE8, 0x113149B0,
        0x59ECD86F, 0xD6C493FE, 0xA477CC0F, 0x5E22ADEE,
        0xD9C81B07, 0x77D49606, 0xC14F90E1, 0x0DF28048,
        0xD5FB17BE, 0x875C8F84, 0x8F8470F2, 0xAC12EDFB,
        0x4C1C5B4E, 0x63919828, 0x8100E781, 0xBFC0B2DE,
        0xDEFA5091, 0xEEC52244, 0x8FD90A29, 0xB0F626F9,
        0xC7A0BEDF, 0xFE000312, 0x9FB31FDC, 0x2DBF622C,
        0xD1AF7A9D, 0xF2262522, 0x65BD19E0, 0x6E5B4463,
        0x854E8872, 0x943D33E7, 0xAC527D4C, 0x0969C177,
        0x52F386A0, 0x7E684FF9, 0x549D4273, 0x64F55854,
        0x541D64A4, 0x45DCAA83, 0x90749D71, 0x049E5B4B,
        0x5EFD9D80, 0xDB5FC762, 0x1FAFA47A, 0x49B8003C,
        0x23E58910, 0x14437772, 0x1D8EA970, 0xE0C774BC,
        0xA6E43511, 0xC62B2741, 0xAC17D251, 0x33E7D7FA,
        0x71B42D48, 0x71A51512, 0x03A7C0EA, 0xF8E06549,
        0x838BA30A, 0x32F4B31B, 0xA25D00C1, 0x3F273452,
        0x49399921, 0x26A91659, 0x7F33D71F, 0xD0309449,
        0x1F79E51C, 0xCD947E18, 0x5FA550C2, 0xBCE58F78,
        0xEEC10695, 0xFA766C8C, 0x8845E39D, 0xEA7A7FCA,
        0x8858C42D, 0x5E303231, 0xE464A218, 0xC277D03F,
        0x49CD9E1B, 0x6F18CB55, 0x17AE41D8, 0xDBF3B8B9,
        0xCE491E2A, 0xED0C01E6, 0xEF6BAD5F, 0x8287E5E4,
        0xB3E9751D, 0x83B35791, 0x468C45C1, 0xB1740AAB,
        0x98098461, 0x8D1C7057, 0x91FE94AD, 0xF937CDBB,
        0x83DCC0D9, 0xD7B1B57C, 0xDF3CE868, 0xE28B5B92,
        0x539545E6, 0x493E48A3, 0x137DC67A, 0x3C34C93E,
        0x329C3F17, 0x521059A7, 0xF9D5F15A, 0x73E6B86F,
        0x1B48612F, 0xF2A05C72, 0x9878D4D6, 0x93B46FD2,
        0xC541137B, 0x356489CB, 0x50019290, 0xA1D76E17,
        0x1ACA583E, 0x7FEF869A, 0x340C0114, 0x591081CC,
        0x515777AE, 0x87E5E577, 0xFCB27F5C, 0x77C4076C,
        0xD8B2DC8E, 0x229170B6, 0x5BA1BEE0, 0x67380564,
        0xB9F42BCB, 0x120B5B72, 0x396B82FF, 0x5EAE9234,
        0x86FA7491, 0x6E66E992, 0x6CD13838, 0xBE4CF2D4,
        0x98375BE8, 0x43CC7C82, 0xB8572E6D, 0xF268E857,
        0x1C18A052, 0x183BEF85, 0xB61CB44E, 0x960FBDDF,
        0xD8ACB2CE, 0x32564D30, 0xF6031149, 0xE4AC4D5F,
        0x9B8926C6, 0x39C37722, 0x268268CA, 0x2296D3A1,
        0x2FA5935F, 0xAE724C6B, 0x4EF26297, 0xFD7D3188,
        0xE1D9F535, 0x2354C43F, 0xC7A2BB9E, 0xC712367A,
        0xF079A33B, 0x99FAF6B7, 0x5EB7EA6D, 0x0AA426B9,
        0x55B2C168, 0x16D49C0F, 0x317BB750, 0xD1F329CF,
        0xAC802393, 0x44CC4110, 0xE848E636, 0x385D50AB,
        0x236CA49C, 0x1823B7E6, 0x5150E9D3, 0xF71A8DB0,
        0xCF009BB6, 0x1C551C1D, 0x24E9FC54, 0xE05F634F,
        0x2B25238A, 0xAB7E02C7, 0xB2992C5D, 0x2941CA2E,
        0xB85784D8, 0xAA5D2F10, 0x5605ECCF, 0x21B1934A,
        0x22DD3480, 0x50F0A395, 0x868B6EE6, 0xB608FFFC,
        0x48AF33A2, 0x56F971B7, 0xBAFFC22D, 0x75C90C12,
        0x029EBA2E, 0x86F79ECE, 0x8ECE826C, 0x9AE231FE,
        0x2BFC24A8, 0xAF602E5C, 0xCDD707EC, 0x456F7A5D,
        0xC5C01C08, 0x1763D989, 0xC48404FB, 0xFB435D00,
        0xE3A36E21, 0xF9EC4BD5, 0xA2FC487F, 0x3CFBAEBB,
        0x811D69AE, 0xF7894C07, 0x6A79B960, 0xCFD0FC8C,
        0xBAEB4744, 0x22895C20, 0xB524D524, 0x861C20B7,
        0xFCE6264D, 0x6C026378, 0xE97BF219, 0x6E8C79D9,
        0x52D8686C, 0xBDB21CD7, 0xCB7014E9, 0x939B8D1B,
        0x85E4A946, 0x5483F22F, 0x57BEEF0A, 0x61AEEDCC,
        0xC196D298, 0x7DD58741, 0x11826FE8, 0x493ED845,
        0x522BAC00, 0x4077F172, 0x72380CEE, 0x50F4C295,
        0x30EEA791, 0xE68A510B, 0x6CEA21AA, 0xECAAA21C,
        0x83FBA2D2, 0x77B79938, 0x7FC133B2, 0x129CE5DC,
        0x50E65BCD, 0x477B7453, 0xAF7D1514, 0x89C00827,
        0xF7A1EC17, 0x356959ED, 0xB0DA0D24, 0x7783F2B1,
        0xE4FA5DDC, 0xF45B2515, 0x968E0CC0, 0xF2D4709B,
        0x8BC437AB, 0xF52C331C, 0x3E585066, 0x43ACD3A7,
        0x0FE64231, 0x8BAE332C, 0x3C45C872, 0xE629C815,
        0x18C0CD24, 0x2DF9B8B9, 0xE22666B3, 0xAE28482B,
        0x35A36B23, 0xC09C417E, 0xFD9137CC, 0x3CC784A4,
        0x6A4AFA4A, 0x7E356423, 0x992E3D08, 0x932E2E39,
        0xD6B81CB4, 0xF591CB50, 0x44FFFA39, 0xB8F0F66F,
        0xEB0A5944, 0x3659B530, 0x5D447F2F, 0xA89E7D80,
        0xC6964BE7, 0x8886C665, 0x0D2B9D36, 0x19CF6D7A,
        0x1FF808A2, 0xE562381F, 0x97869179, 0xE19B4442,
        0xDC451E4B, 0xC23C898E, 0x3B2E8A9C, 0x5CA54832,
        0xBE47D0FC, 0xE6490301, 0x87B11E5C, 0x510D8D6B,
        0x7744450C, 0x3CD4E633, 0x8B081BDC, 0x7D7461A5,
        0x9DEC5CD5, 0x9247D9CE, 0x93DB938F, 0xB5ADA544,
        0x2D4ADC2F, 0xDBE4D336, 0x5909DC44, 0x6318E715,
        0x804C22FD, 0x4C9BB1E6, 0xE31A477C, 0xCCB6C16B,
        0x0E177B2C, 0x3F63C28E, 0xB1CC91C0, 0xF224268D,
        0x45C3219D, 0x930043E8, 0x337D6FDE, 0x275DCF68,
        0xF11A77AE, 0x0BF98AFA, 0x96F0EAFB, 0x562E7AF1,
        0xF69517E4, 0x1285A653, 0xDCC1F517, 0x6A3E3160,
        0xF8927AD7, 0xE777A6F8, 0x6A26B171, 0x9020E9AE,
        0x6189F470, 0x87D17422, 0xB6E4AA19, 0xF4B52464,
        0x739FD032, 0xA38F8BB1, 0x619139F5, 0x71BDAB10,
        0x73F5BDFF, 0x93F327CE, 0xF0CF1B9A, 0x4885A086,
        0x597AFC18, 0x34A853E9, 0x7CE3FF22, 0x610FE03A,
        0x002C20C7, 0xA47161A9, 0x9A8DE679, 0xC6247D98,
        0x7709A2E8, 0x87ED5BBF, 0x0893F1FC, 0x0431B7AB,
        0x82BEDAD8, 0x5A9B8D34, 0x55FAA474, 0xB957A23C,
        0x82DD1A98, 0xCC67E0EF, 0xA53C8BCB, 0x35DED15C,
        0x8FFF7CD9, 0x0870A93B, 0x4FB2B3BB, 0x418D9D56,
        0x1D160E9F, 0x7A774DF4, 0x4D587349, 0x7FAA5314,
        0x3787049A, 0x03C9FB33, 0xE96B2CBF, 0x6829A55D,
        0x9D51D4EA, 0xBC1CAC54, 0x462B09C0, 0xB31BB9EC,
        0x7FD96DB9, 0x507D05F7, 0x8B645E56, 0xDE5B0CB9,
        0xF92FE869, 0xB227E48A, 0x8FCFCC2A, 0x2E337B87,
        0xA10ED4E9, 0xA59580FD, 0xDA66DF40, 0xB2B95A7E,
        0x70D3B0AE, 0xA8AA8B82, 0xA578EAA5, 0x9B2635E4,
        0x2C0F952A, 0xDC84B991, 0xDF6B1714, 0xAAA1D947,
        0xD6CE839B, 0xB4E1FD26, 0xBBB9D0C1, 0x13038688,
        0x4CE823E1, 0x7498A196, 0xB350C720, 0x99EFE5E0,
        0xE42D0E11, 0xE9C40027, 0xC411832F, 0xAFEAF96B,
        0xE60FA38F, 0x7068ACAA, 0x28216A15, 0x22F8CBC0,
        0xB03B238A, 0x7A833B62, 0x3EE57B5F, 0x877E828A,
        0x3B5CA3C5, 0x8B7EBCCA, 0x472FB0BB, 0x073A0C47,
        0x60748AC5, 0xCC77BAA2, 0xB4026414, 0xAB798B64,
        0xEA64AF2F, 0xAD4A6B3C, 0x63893A34, 0xD57C0438,
        0xE43ADADC, 0xE8FD1C90, 0xF59769E0, 0xB7C2E003,
        0x43D58C3A, 0x7CE1AC19, 0xF2B9D881, 0x687F4678,
        0x7EEFDF4D, 0x0F4798F8, 0x5B7FEF36, 0xFDC20499,
        0x8D0C64F5, 0x988B96FF, 0xD1837CBD, 0xB7741B4D,
        0x1C31791B, 0xB3D36D71, 0x18893864, 0x70A7D77A,
        0x4593FC3A, 0x1D3FCA87, 0xE0650396, 0xEA93F74F,
        0xC18CAE05, 0xBC793BEF, 0x8282797F, 0x78999CD7,
        0x83E9F68E, 0xF3456649, 0x90AEBB3F, 0x9BAE7D05,
        0x6DCD2A59, 0xD1DCD15C, 0x36236BAC, 0xBA4A8127,
        0x11F9F994, 0xF76208C3, 0x695607A8, 0x60C6189D,
        0xEA2F3CCF, 0x2D6DB3CD, 0xE6B761A4, 0xDF9DBDD2,
        0xD7644DCA, 0x7A6771D8, 0xF3608620, 0xEDBF342F,
        0x7092257E, 0x9F1A678E, 0x9091620B, 0xE3634AEF,
        0xC740603C, 0xC851DEEA, 0xD6852E9C, 0x16083C77,
        0x7238310B, 0x6AE23EE8, 0x21E04D18, 0xA1DD4AED,
        0xB3948CA3, 0xF75039EF, 0x6F8DA4A2, 0x8AAF1721,
        0x07846C0F, 0x3C650AFA, 0xE73088F6, 0x4038D942,
        0xE39F9DE8, 0xA557A400, 0xD1710219, 0xFD3A2587,
        0x510032E0, 0x2F090304, 0x3AF60B25, 0x54B0C0F4,
        0x10A2FEC7, 0xB50F1B81, 0x4937596D, 0x6697284D,
        0xFF40C224, 0x4CD4A8D2, 0x3E1E1974, 0xCC370578,
        0x90EDC50C, 0x13C75FF6, 0x512CCCCD, 0xFF1F412C,
        0x366AA97A, 0x6C352482, 0x8F8F2EA0, 0xA50A7FD1,
        0x68EE3CCB, 0x21441264, 0xF16C37C5, 0xAF10CAFC,
        0xB105CC7C, 0x8AF90EFE, 0x115EAEC1, 0xE5414CF1,
        0x5DBE3741, 0xCEE69297, 0x0645D982, 0x234579BB,
        0x334E141C, 0x5D2CEEED, 0x1118451C, 0x0B10E8A9,
        0x6D119F5A, 0xFC6A57E1, 0x92E57D9C, 0xA94176D0,
        0xC2A2F500, 0x4539E580, 0x6895D728, 0x622960B9,
        0xDCC8935B, 0xDDED7411, 0xBEBD896E, 0xD4C921D3,
        0xDBFAF3C5, 0x97F04648, 0xB9C28D77, 0x381A227D,
        0x1CA89D58, 0x7B7079B6, 0x5DB866CE, 0x5C9E7208,
        0x3C8F4135, 0xB9AF1CF1, 0xAC2378F2, 0xDE121392,
        0xBD2BA94D, 0xF81D43C1, 0x317458F3, 0xAE43F035,
        0x3A7A72B9, 0xBB239503, 0x590E84C2, 0x6927C7CD,
        0x5B7DF808, 0x14B07159, 0x4F1211C5, 0xA60BA83D,
        0x06F57950, 0xFAEA8464, 0xB35746DD, 0x2726FD24,
        0x63B52689, 0x60FEB8BF, 0x41B500A0, 0xCF6FAD1D,
        0x059222B8, 0xCD4FB7B0, 0x10085D2F, 0xFC376C76,
        0x13682F93, 0x1EA0F40E, 0x753D2324, 0xBCE743CE,
        0xFD15BAA2, 0x43A1BA7E, 0x3A492ACD, 0xBF39EE8C,
        0x47D813F9, 0x3F17E8BA, 0xD298685F, 0x714436B4,
        0x15D78D30, 0x47F83727, 0x237D77A3, 0x671A3849,
        0xB7D73474, 0x9017CE57, 0xC9DD51D6, 0x096D3D96,
        0x4ED03D4F, 0xAB8DCBD5, 0xB5A85C14, 0x0DDCD38A,
        0x83404D8A, 0xD9A3BC7B, 0x6B0BA582, 0x6C6C38C6,
        0xB790729B, 0x976EA7B9, 0x4AF7CB8B, 0xD75796EA,
        0x78148BB9, 0xF1DA76A7, 0x76A5D288, 0xB03D2194,
        0xA232A287, 0x72BD5DB2, 0x4B399FD5, 0xF46BC1FE,
        0x608E5374, 0x6EAFED7D, 0xA1BC656D, 0xB89E78A1,
        0x3F17D0D2, 0x7591310D, 0x9E0CD2B9, 0x68A1C260,
        0x254F250C, 0xE15B45E9, 0xD2D19229, 0x27B02FD7,
        0x8E2CE603, 0x77C5A24B, 0x45865548, 0x9F4E315B,
        0x951C4346, 0xEE6AC851, 0xE25661FB, 0x65D5006D,
        0xA6DB5F15, 0xF06490AD, 0x645345A0, 0x883C3B40,
        0xB6B4A998, 0x12DB1823, 0x91874149, 0xD98C74FB,
        0xF2840B6A, 0x9D55984B, 0x1CAE045E, 0xFDFD0A05,
        0xFCE34B37, 0x6A13C85E, 0x046D87B5, 0xE4DD910B,
        0x61587845, 0x5B1F4984, 0x67182B06, 0xA5548E66,
        0x177A104B, 0x66AF3EC3, 0x3F6844C6, 0x80FD5937,
        0x37DB0045, 0xCB7EE355, 0xC6B7A77B, 0xE680A8C5,
        0x944EF71B, 0x269E3ED0, 0x0B0E52FF, 0x7DEA7A12
    ]);

    var cBF_SBox = [];
    for (var i = 0; i < 4; i++) {
        cBF_SBox[i] = flatSBox.slice(i * 256, (i + 1) * 256);
    }

    // QS2 key (this is a meaningful string in CP866 encoding)
    var cQS2Key = new Uint8Array([
        48, 52, 32, 138, 174, 224, 239, 173, 174, 162, 32, 130, 168, 170, 226, 174,
        224, 32, 60, 118, 105, 99, 116, 111, 114, 50, 64, 110, 109, 46, 114, 117,
        62, 44, 32, 104, 116, 116, 112, 58, 47, 47, 117, 114, 113, 46, 114, 117,
        47, 117, 114, 113, 95, 100, 111, 115
    ]);

    // CRC32 table
    var Crc32Table = new Uint32Array([
        0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA,
        0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
        0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988,
        0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
        0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE,
        0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
        0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC,
        0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
        0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172,
        0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
        0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940,
        0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
        0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116,
        0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
        0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924,
        0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
        0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A,
        0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
        0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818,
        0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
        0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E,
        0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457,
        0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C,
        0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
        0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2,
        0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB,
        0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0,
        0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
        0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086,
        0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
        0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4,
        0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
        0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A,
        0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683,
        0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8,
        0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1,
        0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE,
        0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7,
        0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC,
        0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
        0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252,
        0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B,
        0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60,
        0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
        0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236,
        0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F,
        0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04,
        0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
        0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A,
        0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
        0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38,
        0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21,
        0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E,
        0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777,
        0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C,
        0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
        0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2,
        0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB,
        0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0,
        0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
        0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6,
        0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF,
        0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94,
        0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D
    ]);

    // Struct sizes
    var HEADER_SIZE = 16;
    var SIGNATURE = new Uint8Array([0x51, 0x53, 0x32, 0x00]); // Signature is QS2 followed by null byte

    function readUInt32LE(array, offset) {
        var view = new DataView(array.buffer, offset, 4);
        return view.getUint32(0, true);
    }

    function writeUInt32LE(array, value, offset) {
        var view = new DataView(array.buffer, offset, 4);
        view.setUint32(0, value, true);
    }

    function arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    function getCrc32(data) {
        var crc = 0xFFFFFFFF;
        for (var i = 0; i < data.length; i++) {
            crc = (crc >>> 8) ^ Crc32Table[(crc ^ data[i]) & 0xFF];
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    // Blowfish F Function
    function BF_F(xL) {
        var a = (xL >>> 24) & 0xFF;
        var b = (xL >>> 16) & 0xFF;
        var c = (xL >>> 8) & 0xFF;
        var d = xL & 0xFF;

        var res = (cBF_SBox[0][a] + cBF_SBox[1][b]) >>> 0;
        res = (res ^ cBF_SBox[2][c]) >>> 0;
        res = (res + cBF_SBox[3][d]) >>> 0;
        return res;
    }

    // Blowfish Decrypt ECB
    function blowfishDecryptECB(block) {
        var xL = readUInt32LE(block, 0);
        var xR = readUInt32LE(block, 4);

        xL = (xL ^ cBF_PBox[17]) >>> 0;

        for (var i = 16; i > 0; i -= 2) {
            xR = (xR ^ BF_F(xL) ^ cBF_PBox[i]) >>> 0;
            xL = (xL ^ BF_F(xR) ^ cBF_PBox[i - 1]) >>> 0;
        }

        xR = (xR ^ cBF_PBox[0]) >>> 0;

        writeUInt32LE(block, xR, 0);
        writeUInt32LE(block, xL, 4);
    }

    function bfDecodeBuffer(data) {
        var len = data.length;
        var blockNum = Math.floor(len / 8);
        var res = new Uint8Array(data.length);

        for (var i = 0; i < blockNum; i++) {
            var block = new Uint8Array(8);
            block.set(data.subarray(i * 8, i * 8 + 8));
            blowfishDecryptECB(block);
            res.set(block, i * 8);
        }
        return res;
    }

    // QS2 decoding logic (applies over plain un-blowfished data)
    function qs2DecodeData(data) {
        var res = new Uint8Array(data.length);
        var k = 1;
        var e = 9;

        for (var i = 0; i < data.length; i++) {
            var c = data[i];

            c = (c - e - cQS2Key[k - 1]) & 0xFF;
            res[i] = c;

            k++;
            if (k > cQS2Key.length) {
                e = (e + 1) & 0xFF;
                k = 1;
            }
        }
        return res;
    }

    function qs2DecodeFilePayload(fileData) {
        // find zero byte 
        var zeroIdx = -1;
        for (var i = 0; i < fileData.length; i++) {
            if (fileData[i] === 0) {
                zeroIdx = i;
                break;
            }
        }

        if (zeroIdx === -1) {
            throw new Error('Unexpected end of stream: Could not find zero byte.');
        }

        var headerOffset = zeroIdx + 1;
        if (headerOffset + HEADER_SIZE > fileData.length) {
            throw new Error('Unexpected end of stream: Header missing.');
        }

        var signature = fileData.subarray(headerOffset, headerOffset + 4);
        if (!arraysEqual(signature, SIGNATURE)) {
            throw new Error('Corrupted data: Invalid signature.');
        }

        // Read header fields
        var dataLen = readUInt32LE(fileData, headerOffset + 8);
        var expectedCrc = readUInt32LE(fileData, headerOffset + 12);

        var bfLen = dataLen;
        var mod = dataLen % 8;
        if (mod !== 0) {
            bfLen = bfLen + 8 - mod;
        }

        var dataOffset = headerOffset + HEADER_SIZE;
        if (dataOffset + bfLen > fileData.length) {
            throw new Error('Unexpected end of stream: Encrypted data missing.');
        }

        var encryptedData = fileData.subarray(dataOffset, dataOffset + bfLen);

        // 1. Blowfish decode
        var bfDecoded = bfDecodeBuffer(encryptedData);

        // 2. QS2 decode
        var qs2Decoded = qs2DecodeData(bfDecoded.subarray(0, dataLen));

        // 3. CRC check
        var actualCrc = getCrc32(qs2Decoded);
        if (actualCrc !== expectedCrc) {
            throw new Error('Corrupted data: CRC32 mismatch.');
        }

        return qs2Decoded;
    }

    try {
        return qs2DecodeFilePayload(data);
    } catch (error) {
        console.error('Error decoding QS2 file:', error.message);
        return '';
    }
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



    