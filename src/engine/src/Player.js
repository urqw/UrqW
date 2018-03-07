
import Parser from "./Parser";

var gameMusic = new Audio();

/**
 * @constructor
 */
function Player(Quest) {

    this.PLAYER_STATUS_NEXT = 0;
    this.PLAYER_STATUS_END = 1;
    this.PLAYER_STATUS_ANYKEY = 2;
    this.PLAYER_STATUS_PAUSE = 3;
    this.PLAYER_STATUS_INPUT = 4;
    this.PLAYER_STATUS_QUIT = 5;

    this.Quest = Quest;
    this.Parser = new Parser();

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
     * системные команды
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
 * рендер
 */
Player.prototype.fin = function() {
    if (Game.getVar('music')) this.playMusic(Game.getVar('music'), true);

    if (this.status != this.PLAYER_STATUS_NEXT) {
        Game.Client.render();
    }

    this.lock = !(this.status == this.PLAYER_STATUS_END || this.status == this.PLAYER_STATUS_PAUSE);
};

/**
 *
 */
Player.prototype.play = function(line) {
    this.lock = true;

    this.status = this.PLAYER_STATUS_NEXT;

    if (line !== undefined) {
        this.Parser.parse(line);
    }

    while (this.status == this.PLAYER_STATUS_NEXT) {
        if (this.flowStack[this.flow].length == 0 && ((line = this.next()) !== false)) {
            this.Parser.parse(line);
        }

        while (this.flowStack[this.flow].length > 0 && this.status == this.PLAYER_STATUS_NEXT) {
            this.Parser.parse(this.flowStack[this.flow].pop());
        }
    }
};

/**
 * следующая строка
 *
 * @param {String} line
 */
Player.prototype.next = function(line) {
    var line = this.Quest.get(Game.position);

    Game.position++;

    if (!line) {
        return false;
    }

    return line.replace(/\t/g, ' ');
};

/**
 * добавление команды в текущий поток
 *
 * @param {String} line
 */
Player.prototype.flowAdd = function(line) {
    this.flowStack[this.flow].push(line);
};

/**
 * команды далее исполняются юзером по ходу игры
 */

/**
 * коммон
 */
Player.prototype.common = function() {
    var commonLabel = 'common';

    if (Game.getVar('common') !== 0) {
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

    var label = this.Quest.getLabel(command);

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
        Game.setVar(this.inf, keycode);
    }

    this.continue();
};

/**
 * @param {String} value
 * @returns {boolean}
 */
Player.prototype.inputAction = function(value) {
    Game.setVar(this.inf, value);

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
    }

    if (variable.toLowerCase() === 'image') {
        // todo переместить

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
    }

    Game.setVar(variable, value);
};

/**
 * @param {String} src
 */
    // todo переместить в клиента
Player.prototype.image = function(src) {
    if (src) {
        this.print($('<img alt="Изображение" style="margin: 5px auto; display: block;">').attr('src', src).prop('outerHTML'), true);
    }
};

/**
 * @param {String} src
 * @param {Boolean} loop
 */
Player.prototype.playMusic = function(src, loop) {
    var file;

    if (files === null) {
        file = 'quests/' + Game.name + '/' + src;
    } else {
        file = files[src];
    }

    if (src) {
        if (gameMusic.getAttribute('src') != file) {
            gameMusic.src = file;

            if (loop) {
                gameMusic.addEventListener('ended', function() {
                    gameMusic.src = file;
                    gameMusic.play();
                }, false);
            }

            gameMusic.play();
        }
    } else {
        gameMusic.pause();
    }
};


/**
 * команды из квеста
 *
 * @author narmiel
 */

/**
 * прыгнуть на метку
 *
 * @param {string} labelName
 * @param {string} type
 */
Player.prototype.goto = function(labelName, type) {
    var label = this.Quest.getLabel(labelName);

    if (label) {
        // todo контанты
        if (type != 'proc') {
            Game.realCurrentLoc = label.name;
        }

        if ((type == 'btn' || type == 'goto')) {
            Game.setVar('previous_loc', Game.getVar('current_loc'));
            Game.setVar('current_loc', labelName);
        }

        if (type == 'btn' || type == 'goto' || type == 'proc') {
            Game.setVar('count_' + label.name, Game.getVar('count_' + label.name) + 1);
        }

        Game.position = label.pos;

        // весь стек что дальше очищается
        this.flowStack[this.flow] = [];

        return true;
    }

    return false;
};

/**
 * удаление переменных
 */
Player.prototype.perkill = function() {
    Game.vars = {};

    Game.items.forEach(function(index, value) {
        Game.setVar(index, parseInt(value));
    });
};

/**
 * cls
 */
Player.prototype.cls = function() {
    this.text = [];
    this.buttons = [];
    this.links = [];

    Game.Client.render();
};

/**
 * cls
 */
Player.prototype.clsb = function() {
    this.buttons = [];
    this.links = [];

    for(var i = 0; i < this.text.length; i++) {
        this.text[i][0] = this.text[i][0].replace(/\<a.+?\>.+?\<\/a\>/gi, function (match) {
            return Game.Client.disableLink(match);
        });
    }

    Game.Client.clsb();
};

/**
 * удаление предметов
 *
 * @param {String} item
 */
Player.prototype.invkill = function(item) {
    if (item != null) {
        Game.setItem(item, 0);
    } else {
        Game.items.forEach(function(index, value) {
            Game.setItem(index, 0);
        });
    }
};

/**
 * прок
 *
 * @param {String} label
 */
Player.prototype.proc = function(label) {
    this.flow++;
    this.procPosition.push(Game.position);

    if (this.goto(label, 'proc')) {
        this.flowStack[this.flow] = [];
        return true;
    } else {
        this.flow--;
        this.procPosition.pop();
        return false;
    }
};

/**
 * end
 */
Player.prototype.end = function() {
    if (this.procPosition.length > 0) {
        this.flowStack[this.flow].pop();
        Game.position = this.procPosition.pop();
        this.flow--;
    } else {
        this.flowStack[this.flow] = [];
        this.status = this.PLAYER_STATUS_END;
    }
};

/**
 *
 */
Player.prototype.forgetProcs = function() {
    this.flowStack[0] = this.flowStack[this.flow];
    this.procPosition = [];
    this.flow = 0;
};

/**
 * @param {String} inf
 */
Player.prototype.anykey = function(inf) {
    if (Game.locked) return false;

    this.inf = inf;
    this.status = this.PLAYER_STATUS_ANYKEY;
};

/**
 * @param {int} inf
 */
Player.prototype.pause = function(inf) {
    if (Game.locked) return false;

    this.inf = inf;
    this.status = this.PLAYER_STATUS_PAUSE;
};

/**
 * @param {String} inf
 */
Player.prototype.input = function(inf) {
    if (Game.locked) return false;

    this.inf = inf;
    this.status = this.PLAYER_STATUS_INPUT;
};

/**
 *
 */
Player.prototype.quit = function() {
    this.status = this.PLAYER_STATUS_QUIT;
};

/**
 * @param {String} item
 * @param {int} quantity
 */
Player.prototype.invRemove = function(item, quantity) {
    Game.removeItem(item, quantity);
};

/**
 * @param {String} item
 * @param {int} quantity
 */
Player.prototype.invAdd = function(item, quantity) {
    Game.addItem(item, quantity);
};

/**
 * @param {String} text
 * @param {bool} br
 */
Player.prototype.print = function(text, br) {
    var textColor = null;
    if (isNaN(Game.getVar('style_textcolor'))) {
        textColor = Game.getVar('style_textcolor');
    } else if (Game.getVar('style_textcolor') > 0) {
        var red = (Game.getVar('style_textcolor') >> 16) & 0xFF;
        var green = (Game.getVar('style_textcolor') >> 8) & 0xFF;
        var blue = Game.getVar('style_textcolor') & 0xFF;

        textColor = 'rgb(' + blue + ', ' + green  + ', ' + red + ')';
    }

    this.text.push([text, br,  textColor]);
};

/**
 * @param {String} command
 * @param {String} desc
 */
Player.prototype.btn = function(command, desc) {
    var id = this.buttons.length;

    this.buttons.push({
        id: id,
        command: command,
        desc: desc
    });
};

/**
 * @param {String} command
 */
Player.prototype.link = function(command) {
    var id = this.links.length;

    this.links[id] = command;

    return id;
};


export default Player;







