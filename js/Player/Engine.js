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

        // todo контанты 
        if ((type == 'btn' || (Game.getVar('urq_mode') != 'doqurq' && type == 'goto'))) {
            Game.setVar('previous_loc', Game.getVar('current_loc'));
            Game.setVar('current_loc', labelName);
        }

        if (type == 'goto') {
            if (Game.getVar('urq_mode') == 'ripurq') {
//                this.buttons = [];
//                this.text = [];
            }
        }

        if (type == 'btn' || type == 'goto' || type == 'proc') {
            if (Game.getVar('urq_mode') == 'ripurq') {
                Game.setVar(label.name, Game.getVar(label.name) + 1);
            } else {
                Game.setVar('count_' + label.name, Game.getVar('count_' + label.name) + 1);
            }
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
    this.links = [];

    this.Client.cls();
};

/**
 * cls
 */
Player.prototype.clsb = function() {
    this.buttons = [];
    this.links = [];
    
    for(var i = 0; i < this.text.length; i++) {
        this.text[i][0] = this.text[i][0].replace(/\<a.+?\>.+?\<\/a\>/gi, function (match) {
            return GlobalPlayer.Client.disableLink(match);
        });
    }

    this.Client.clsb();
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
        this.status = PLAYER_STATUS_END;
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

