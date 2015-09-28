/**
 * @author narmiel
 */

var PLAYER_STATUS_NEXT = 0;
var PLAYER_STATUS_END = 1;
var PLAYER_STATUS_ANYKEY = 2;
var PLAYER_STATUS_PAUSE = 3;
var PLAYER_STATUS_INPUT = 4;
var PLAYER_STATUS_QUIT = 5;

/**
 * @constructor
 */
function Player() {
    this.Parser = new Parser();
    this.Client = new Client();

    this.text = [];
    this.buttons = [];
    this.inf = false;

    this.proc_position = [];
    this.flow = 0;
    this.flowStack = [];
    this.flowStack[this.flow] = [];

    /**
     * @type {boolean}
     */
    this.lock = false;

    /**
     * @param {Quest} Game
     */
    this.play = function(Game) {
        this.lock = true;

        var line;

        this.status = PLAYER_STATUS_NEXT;

        while ((this.status == PLAYER_STATUS_NEXT)) {
            if (this.flowStack[this.flow].length == 0 && ((line = Game.next()) !== false)) {
                this.Parser.parse(line);
            }

            while (this.flowStack[this.flow].length > 0 && this.status == PLAYER_STATUS_NEXT) {
                this.Parser.parse(this.flowStack[this.flow].pop());
            }
        }

        this.Client.render({
            status: this.status,
            text: this.text,
            buttons: this.buttons,
            sysinf: this.inf
        });
    };

    /**
     * прыгнуть на метку
     *
     * @param {string} labelName
     */
    this.to = function(labelName) {
        var label = Game.getLabel(labelName);

        if (label) {
            Game.setVar('count_' + label.name, Game.getVar('count_' + label) + 1);
            Game.position = label.pos ;

            return true;
        }

        return false;
    };

    /**
     * удаление переменных
     */
    this.perkill = function() {
        Game.vars = {};

        $.each(Game.items, function(index, value) {
            Game.setVar(index, parseInt(value));
        });
    };

    /**
     * удаление предметов
     * @param {String} item
     */
    this.invkill = function(item) {
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
     */
    this.proc = function() {
        this.proc_position.push(Game.position);
        if (this.to(command)) {
            this.flow++;
            this.flowStack[this.flow] = [];
        } else {
            this.proc_position.pop();
        }
    };

    /**
     * end
     */
    this.end = function() {
        if (this.proc_position.length > 0) {
            this.flowStack[this.flow].pop();
            Game.position = this.proc_position.pop();
            this.flow--;
        } else {
            this.status = PLAYER_STATUS_END;
            this.lock = false;
        }
    }
}

