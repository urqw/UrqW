/**
 * команды из квеста
 *
 * @author narmiel
 */

/**
 * прыгнуть на метку
 *
 * @param {string} labelName
 */
Player.prototype.goto = function(labelName) {
    var label = Game.getLabel(labelName);

    if (label) {
        Game.realCurrentLoc = label.name;

        Game.setVar('count_' + label.name, Game.getVar('count_' + label) + 1);
        Game.position = label.pos ;

        return true;
    }

    return false;
};

/**
 * удаление переменных
 */
Player.prototype.perkill = function() {
    Game.vars = {};

    $.each(Game.items, function(index, value) {
        Game.setVar(index, parseInt(value));
    });
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
    var tmpLoc = Game.realCurrentLoc;

    if (this.goto(label)) {
        Game.realCurrentLoc = tmpLoc;

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
    this.inf = inf;
    this.status = PLAYER_STATUS_ANYKEY;
};

/**
 * @param {int} inf
 */
Player.prototype.pause = function(inf) {
    this.inf = inf;
    this.status = PLAYER_STATUS_PAUSE;
};

/**
 * @param {String} inf
 */
Player.prototype.input = function(inf) {
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
    this.text.push([text, br]);
};

/**
 * @param {String} labelName
 * @param {String} desc
 */
Player.prototype.btn = function(labelName, desc) {
    var btn;
    var label = Game.getLabel(labelName);

    if (label === false) {
        btn = {
            label: null,
            desc: desc + ' //phantom'
        };
    } else {
        btn = {
            label: label.name,
            desc: desc
        };
    }

    this.buttons.push(btn);
};

