/**
 * Copyright (C) 2015 Akela <akela88@bk.ru>
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

var PLAYER_STATUS_NEXT = 0;
var PLAYER_STATUS_END = 1;
var PLAYER_STATUS_ANYKEY = 2;
var PLAYER_STATUS_PAUSE = 3;
var PLAYER_STATUS_INPUT = 4;
var PLAYER_STATUS_QUIT = 5;

var gameMusic = new Audio();
var gameSound = new Audio();

/**
 * @constructor
 */
function Player() {
    this.Parser = new Parser();
    this.Client = new Client();

    this.text = [];
    this.buttons = [];
    this.links = [];
    this.inf = false;

    this.procPosition = [];

    this.flow = 0;
    this.flowStack = [];
    this.flowStack[this.flow] = [];

    /**
     * @type {boolean}
     */
    this.lock = false;

    /**
     * System commands
     */
}


/**
 *
 */
Player.prototype.continue = function() {
    this.play();

    this.fin();
};

/**
 * Render
 */
Player.prototype.fin = function() {
    if (Game.getVar('music')) this.playMusic(Game.getVar('music'), true);

    if (this.status != PLAYER_STATUS_NEXT) {
        this.Client.render({
            status: this.status,
            text: this.text,
            buttons: this.buttons
        });
    }

    this.lock = !(this.status == PLAYER_STATUS_END || this.status == PLAYER_STATUS_PAUSE);
};

/**
 *
 */
Player.prototype.play = function(line) {
    this.lock = true;

    this.status = PLAYER_STATUS_NEXT;

    if (line !== undefined) {
        this.Parser.parse(line);
    }

    while ((this.status == PLAYER_STATUS_NEXT)) {
        if (this.flowStack[this.flow].length == 0 && ((line = Game.next()) !== false)) {
            this.Parser.parse(line);
        }

        while (this.flowStack[this.flow].length > 0 && this.status == PLAYER_STATUS_NEXT) {
            this.Parser.parse(this.flowStack[this.flow].pop());
        }
    }
};

/**
 * Adding a command to the current thread
 *
 * @param {String} line
 */
Player.prototype.flowAdd = function(line) {
    this.flowStack[this.flow].push(line);
};

/**
 * Commands are then executed by the user during the game
 */

/**
 * common
 */
Player.prototype.common = function() {
    var commonLabel = 'common';

    if (Game.getVar('urq_mode') != 'ripurq' && Game.getVar('common') !== 0) {
        commonLabel = commonLabel + '_' + Game.getVar('common');
    }

    if (this.proc(commonLabel)) {
        this.forgetProcs();
        this.play();
    }
};

/**
 * @param {int} actionId
 * @param {bool} link
 */
Player.prototype.action = function(actionId, link) {
    if (this.lock) return false;

    if (link) {
        var command = this.links[actionId];
        this.links[actionId] = null;
    } else {
        for (var key in this.buttons) {
            if (this.buttons[key].id == actionId) {
                command = this.buttons[key].command;
                delete this.buttons[key];

                break
            }
        }
    }

    if (command === null) return;

    var label = Game.getLabel(command);

    if (label) {
        this.btnAction(label.name);
    } else {
        this.xbtnAction(command);
    }
};

/**
 * @param {String} labelName
 * @returns {boolean}
 */
Player.prototype.btnAction = function(labelName) {
    this.cls();

    this.common();

    if (this.goto(labelName, 'btn')) {
        this.continue();
    }
};

/**
 * @param {String} command
 * @returns {boolean}
 */
Player.prototype.xbtnAction = function(command) {
    this.common();

    this.play(command + '&end');
    this.fin();
};

/**
 * @param {String} labelName
 * @returns {boolean}
 */
Player.prototype.useAction = function(labelName) {
    if (this.lock) return false;

    this.play('proc ' + labelName + '&end');
    this.fin();
};

/**
 * @param {String} keycode
 * @returns {boolean}
 */
Player.prototype.anykeyAction = function(keycode) {
    if (this.inf.length > 0) {
        this.setVar(this.inf, keycode);
    }

    GlobalPlayer.continue();
};

/**
 * @param {String} value
 * @returns {boolean}
 */
Player.prototype.inputAction = function(value) {
    this.setVar(this.inf, value);

    this.continue();
};

/**
 * @inheritDoc
 */
Player.prototype.setVar = function(variable, value) {
    if (Game.locked) return false;

    variable = variable.trim();

    if (variable.toLowerCase() === 'style_dos_textcolor') {
        Game.setVar('style_textcolor', dosColorToHex(value));
    } else
    if (variable.toLowerCase() === 'urq_mode') {
        // When attempting to assign an unknown value, forcefully assign the value 'urqw'
        if (!['urqw', 'ripurq', 'dosurq', 'akurq'].includes(value)) {
            value = 'urqw';
        }
        if (value == 'dosurq') {
            Game.setVar('style_backcolor', '#000');
            Game.setVar('style_textcolor', '#FFF');
        }
    } else
    if (variable.toLowerCase() === 'urqw_title') {
        document.title = value;
    } else
    if (variable.toLowerCase() === 'urqw_game_lang') {
        // Area of text output
        document.getElementById('textfield').setAttribute('lang', value);
        // Area of buttons
        document.getElementById('buttons').setAttribute('lang', value);
        // Area of input
        document.getElementById('input').setAttribute('lang', value);
        // Area of inventory
        document.getElementById('inventory').setAttribute('lang', value);
        // Restore UrqW UI language for OK button in input area
        document.getElementById('input_enter').setAttribute('lang', document.getElementsByTagName('HTML')[0].getAttribute('lang'));
    } else

    // todo Move
    if (variable.toLowerCase() === 'image') {
        var file = value;
        if (files != null) {
            if (files[value] !== undefined) {
                file = value;
            } else if (files[value + '.png'] !== undefined) {
                file = value + '.png';
            } else if (files[value + '.jpg'] !== undefined) {
                file = value + '.jpg';
            } else if (files[value + '.gif'] !== undefined) {
                file = value + '.gif';
            }
        }

        this.image(file);
    } else
    if (variable.toLowerCase() === 'javascript') {
        this.javaScript(value);
        return;
    } else
    if (variable.toLowerCase() === 'fileread') {
        this.fileRead(value);
        return;
    } else
    if (variable.toLowerCase() === 'music') {
        if (value === '') resetAudio(gameMusic);
    }

    Game.setVar(variable, value);
};

/**
 * @param {String} src
 */
    // todo Move to client
Player.prototype.image = function(src) {
    if (src) {
        var alt = i18next.t('image');
        var srcParts = src.split('|');
        if (srcParts.length >= 2) {
            src = srcParts[0];
            alt = srcParts[1];
        }
        var imageHtml = $('<img>').attr({
            'src': src,
            'alt': alt,
            'style': 'margin: 5px auto; display: block;'
        }).prop('outerHTML');
        var caption = Game.getVar('image_caption');
        if (caption) {
            imageHtml = `<figure> ${imageHtml} <figcaption>${caption}</figcaption> </figure>`;
        }
        this.print(imageHtml, true);
    }
};

/**
 * @param {String} code
 */
    // todo Maybe move to client like image
Player.prototype.javaScript = function(code) {
    var result;
    if (code) {
        result = eval(code);
    } else {
        result = "";
    }
    Game.setVar('javascript', result);
};

/**
 * @param {String} fileURL
 */
    // todo Maybe move to client like image
Player.prototype.fileRead = function(fileURL) {
    var result = '';
    var errorMessage;

    if (fileURL) {
            if (files === null) {
                fileURL = normalizeInternalPath(questPath + '/' + fileURL.toString().trim());
            } else {
                fileURL = files[normalizeInternalPath(fileURL.toString().trim())];
            }

            if (fileURL) {
                $.ajax({
                    url: fileURL,
                    method: 'GET',
                    dataType: 'text',
                    contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
                    async: false,
                    success: function(data) {
                        result = data;
                    },
                    error: function(xhr, status, error) {
                        errorMessage = error;
                    }
                });
            } else {
                errorMessage = 'File not found.';
            }
    } else {
        errorMessage = 'The file path is empty.';
    }

    if (errorMessage) {
        console.error('Error reading file:', errorMessage);
    }

    Game.setVar('fileread', result);
};

/**
 * @param {String} src
 * @param {Boolean} loop
 */
Player.prototype.playMusic = function(src, loop) {
    if (src) {
        var file;
        if (files === null) {
            file = normalizeInternalPath(questPath + '/' + src);
        } else {
            file = files[normalizeInternalPath(src)];
        }
    
        if (loop) {
            // Music is played in a loop using the system variable
            if (gameMusic.paused) {
                // Music is not currently playing
                resetAudio(gameMusic);
                gameMusic.src = file;
                gameMusic.loop = true;
                gameMusic.play();
            } else {
                // Music is currently playing
                if (gameMusic.getAttribute('src') != file || !gameMusic.loop) {
                    // The file has changed or the file is not playing in a loop
                    resetAudio(gameMusic);
                    gameMusic.src = file;
                    gameMusic.loop = true;
                    gameMusic.play();
                }
            }
        } else {
            // Music is played once using the operator
            resetAudio(gameMusic);
            gameMusic.src = file;
            gameMusic.play();
        }
    } else {
        resetAudio(gameMusic);
    }
};










