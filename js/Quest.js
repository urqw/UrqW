/**
 * Copyright (C) 2015, 2016, 2018 Akela <akela88@bk.ru>
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/**
 * @param {string} text (body of game)
 *
 * @constructor
 */
function Quest(text) {

    /**
     * @type {string} name of game or file to save
     */
    this.name = '';

    /**
     * @type {boolean}
     */
    this.locked = false;

    /**
     * @type {Object}
     */
    this.labels = {};

    /**
     * @type {Object}
     */
    this.useLabels = {};

    /**
     * @type {Object}
     */
    this.items = {};

    /**
     * @type {Object}
     */
    this.vars = {};

    /**
     * @type {number}
     */
    this.position = 0;

    /**
     * @type {string}
     */
    this.realCurrentLoc = '';

    /**
     * @type {array of strings}
     */
    // Delete line breaks at the beginning and end of the text
    text = text.replace(/^[\n\r]+|[\n\r]+$/g, '');
    // Delete comments from the text
    text = text.replace(/\/\*[\s\S.]+?\*\//g, '');
    // Trim leading whitespaces from each line
    text = text.replace(/^\s+/gm, '');
    // Convert specific AkURQ constructs to UrqW constructs
    if (mode === 'akurq') {
        text = preparserForAkURQ(text);
    }
    // Split the text into an array of lines
    this.quest = text.split(/[\n\r]+/);

    /**
     * @type {string} MurmurHash3 hash of the quest source code
     */
    this.hash = murmurhash3_32(text);

    /**
     * @type {string} URQL code with possible AkURQ-specific constructs
     */
    function preparserForAkURQ(code) {
        // Regular expression for finding HTML blocks
        var htmlPattern = /<html>[\s\S]*?<\/html>/gi;
        // Perform a replacement
        code = code.replace(htmlPattern, (match) => {
            // Delete the <html> and </html> tags
            var content = match.replace(/^<html>\s*|\s*<\/html>$/gi, '');
            // Delete single-line comments from semicolon to end of line
            content = content.replace(/;.*$/gm, '');
            // Replace line breaks with spaces
            content = content.replace(/[\r\n]+/g, ' ');
            // Trim spaces at the ends
            content = content.trim();
            // Replace AkURQ links with UrqW links
            // (e.g., replace '<a href="btn:label">name</a>' with '[[name|label]]')
            content = content.replace(/<a\s+href="btn:([^"]+)"\s*>\s*([^<]+?)\s*<\/a>/gi, '[[$2|$1]]');
            // Forming the final line for UrqW
            return 'pln <div class="akurq_html">' + content + '</div>\n';
        });
        return code;
    }
}


/**
 * @param {String} label
 */
Quest.prototype.getLabel = function(label) {
    label = label.toString().toLowerCase();

    if (this.labels[label] != undefined) {
        return {
            name: label,
            pos: this.labels[label]
        };
    } else {
        return false;
    }
};

/**
 * Next line
 */
Quest.prototype.next = function() {
    var line = this.get(this.position);

    this.position++;

    if (!line) {
        return false;
    }

    if (['ripurq', 'dosurq', 'akurq'].includes(this.getVar('urq_mode'))) {
        // Cut comment
        if (line.indexOf(';') != -1) {
            line = line.substring(0, line.indexOf(';'));
        }
    }

    return line.replace(/\t/g, ' ');
};

/**
 * Line by number
 */
Quest.prototype.get = function(i) {
    if (this.quest[i] != undefined) {
        return this.quest[i];
    } else  {
        return false;
    }
};

/**
 * Initialization
 */
Quest.prototype.init = function() {
    this.labels = {};
    this.useLabels = {};
    this.items = {};
    this.vars = {
        'tokens_delim': '\ \,\"\?\!'
    };
    this.position = 0;
    this.realCurrentLoc = '';

    /**
     * Collecting labels
     */
    for (var i = this.quest.length -1; i >=0; i--) {
        var str = this.get(i);

        if (str.substr(0, 1) == '_' && str.substr(1, 1) != '_') {
            this.quest[i - 1] = this.quest[i - 1] + str.substr(1);
            this.quest[i] = '';
        } else if (str.substr(0, 1) == ':') {
            if (str.substr(0, 5).toLowerCase() == ':use_') {
                this.useLabels[str.substr(1).toLowerCase().trim()] = i;
            }

            this.labels[str.substr(1).toLowerCase().trim()] = i;
        }
    }

    for (var i = 0; i < this.quest.length; i++) {
        if (this.quest[i].substr(0, 1) == ':') {
            var key = this.quest[i].substr(1).toLowerCase().trim();
            this.realCurrentLoc = key;
            this.setVar('current_loc', key);
            this.setVar('previous_loc', key);

            break;
        }
    }
};

/**
 * Initialization of system variables, including those taken from manifest.json
 */
Quest.prototype.sysVarInit = function() {
    if (manifest['urqw_title']) GlobalPlayer.setVar('urqw_title', manifest['urqw_title']);
    if (manifest['urqw_game_lang']) GlobalPlayer.setVar('urqw_game_lang', manifest['urqw_game_lang']);
    if (mode) GlobalPlayer.setVar('urq_mode', mode);
};

/**
 * @param name
 * @param {int} count
 */
Quest.prototype.addItem = function(name, count) {
    return this.setItem(name, this.getItem(name) + parseInt(count));
};

/**
 * @param name
 * @param {int} count
 */
Quest.prototype.removeItem = function(name, count) {
    return this.setItem(name, this.getItem(name) - parseInt(count));
};

/**
 *
 * @param name
 * @param {int} count
 */
Quest.prototype.setItem = function (name, count) {
    if (Game.locked) return false;

    count = parseInt(count);

    if (count <= 0) {
        delete this.items[name];
        this.setVar(name, 0);
    } else {
        this.items[name] = count;
        this.setVar(name, count);
    }
};

/**
 *
 * @param name
 * @return {int}
 */
Quest.prototype.getItem = function (name) {
    return (this.items[name] == undefined) ? 0 : this.items[name];
};

/**
 * @param {String} variable
 * @param {*} value
 */
Quest.prototype.setVar = function(variable, value) {
    if (variable.substr(0, 4).toLowerCase() == 'inv_') {
        variable = variable.substr(4);

        this.setItem(variable, value);
    } else {
        this.vars[variable.toLowerCase()] = value;
    }
};

/**
 * @param variable
 * @returns {*}
 */
Quest.prototype.getVar = function(variable) {
    variable = variable.toLowerCase();

    if (variable.substr(0, 4) == 'inv_') {
        variable = variable.substr(4);
    }

    if (variable == 'rnd') {
        return Math.random();
    } else if (variable.substr(0, 3) == 'rnd') {
        return Math.floor(Math.random() * parseInt(variable.substr(3))) + 1;
    }

    if (variable == 'time') {
        var Datetime = new Date();
        return Datetime.getHours() * 3600 + Datetime.getMinutes() * 60 + Datetime.getSeconds();
    }

    // Theoretically, in older games, "date" variable can be used as a user variable,
    // so only support urq_mode without special rules
    if (variable == 'date' && this.getVar('urq_mode') == 'urqw') {
        var Datetime = new Date();
        return Math.floor(Datetime.getTime() / (1000*60*60*24));
    }

    if (variable == 'urqw_title') {
        return document.title;
    }

    if (variable == 'urqw_version') {
        return urqw_version;
    }

    if (variable == 'urqw_game_ifid') {
        if (manifest['urqw_game_ifid']) {
            return manifest['urqw_game_ifid'];
        } else {
            return '';
        }
    }

    // quest_path system variable for backward compatibility with AkURQ only
    if (variable == 'quest_path' && this.getVar('urq_mode') == 'akurq') {
        return ''; // Always an empty string, not an absolute path to the quest
    }

    // For expressions like "1 money"
    if (variable.split(' ').length > 1) {
        var count = variable.split(' ')[0];
        if (!isNaN(count)) {
            variable = variable.split(' ').slice(1).join(' ').trim();
            return this.vars[variable] >= count;
        }
    }

    if (this.vars[variable] != undefined) {
        return this.vars[variable];
    }

    return 0;
};

/**
 * Save game
 *
 * @param {int} slot
 */
Quest.prototype.save = function(slot) {
    var Datetime = new Date();
    var lang = document.documentElement.lang;

    localStorage.setItem(this.name + '_' + slot.toString() + '_name', Datetime.toLocaleDateString(lang) + ' ' + Datetime.toLocaleTimeString(lang));
    localStorage.setItem(this.name + '_' + slot.toString() + '_data', JSON.stringify({
        hash: this.hash,
        status: GlobalPlayer.status,
        text: GlobalPlayer.text,
        buttons: GlobalPlayer.buttons,
        links: GlobalPlayer.links,
        items: this.items,
        vars: this.vars,
        position: this.position,
        realCurrentLoc: this.realCurrentLoc
    }));
};

/**
 * Load game
 *
 * @param {int} slot
 */
Quest.prototype.load = function(data) {
    GlobalPlayer.status = data.status;
    GlobalPlayer.text = data.text;
    GlobalPlayer.buttons = data.buttons;
    GlobalPlayer.links = data.links;
    this.items = data.items;
    this.vars = data.vars;
    this.position = data.position;
    this.realCurrentLoc = data.realCurrentLoc;
};