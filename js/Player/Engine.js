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
    var label = Game.getLabel(labelName);

    if (label) {
        if (type != 'proc') {
            Game.realCurrentLoc = label.name;
        }

            if (type == 'goto') {
                if (Game.getVar('urq_mode') == 'ripurq') {
                    this.buttons = [];
                }
//              this.text = [];
            }

        // todo контанты блять
        if (type == 'btn' || type == 'goto' || type == 'proc') {
            if (Game.getVar('urq_mode') == 'ripurq') {
                Game.setVar(label.name, Game.getVar(label.name) + 1);
            } else {
                Game.setVar('count_' + label.name, Game.getVar('count_' + label.name) + 1);
            }
        }

        Game.position = label.pos;

        return true;
    }

    return false;
};

/**
 * удаление переменных
 */
Player.prototype.perkill = function() {
    var urqMode = Game.getVar('urq_mode');
    
    Game.vars = {};
    this.setVar('urq_mode', urqMode);

    $.each(Game.items, function(index, value) {
        Game.setVar(index, parseInt(value));
    });
};

/**
 * cls
 */
Player.prototype.cls = function() {
    this.text = [];
    this.buttons = [];

    this.Client.cls();
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
        $.each(Game.items, function(index, value) {
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
    this.procPosition.push(Game.position);

    if (this.goto(label, 'proc')) {
        this.flow++;
        this.flowStack[this.flow] = [];

        return true;
    } else {
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
        this.status = PLAYER_STATUS_END;
    }
};

/**
 *
 */
Player.prototype.forgetProc = function() {
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
    this.status = PLAYER_STATUS_ANYKEY;
};

/**
 * @param {int} inf
 */
Player.prototype.pause = function(inf) {
    if (Game.locked) return false;

    this.inf = inf;
    this.status = PLAYER_STATUS_PAUSE;
};

/**
 * @param {String} inf
 */
Player.prototype.input = function(inf) {
    if (Game.locked) return false;

    this.inf = inf;
    this.status = PLAYER_STATUS_INPUT;
};

/**
 *
 */
Player.prototype.quit = function() {
    this.status = PLAYER_STATUS_QUIT;
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
    this.text.push([text, br, Game.getVar('style_textcolor')]);
};

/**
 * @param {String} command
 * @param {String} desc
 */
Player.prototype.btn = function(command, desc) {
    this.buttons.push({
        command: command,
        desc: desc 
    });
};

