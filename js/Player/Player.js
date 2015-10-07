/**
 * @author narmiel
 */

var PLAYER_STATUS_NEXT = 0;
var PLAYER_STATUS_END = 1;
var PLAYER_STATUS_ANYKEY = 2;
var PLAYER_STATUS_PAUSE = 3;
var PLAYER_STATUS_INPUT = 4;
var PLAYER_STATUS_QUIT = 5;

var gameMusic = new Audio();

/**
 * @constructor
 */
function Player() {
    var me = this;

    this.Parser = new Parser();
    this.Client = new Client();

    this.text = [];
    this.buttons = [];
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

    /**
     *
     */
    this.continue = function() {
        this.lock = true;

        this.play();

        if (this.status != PLAYER_STATUS_NEXT) {
            this.Client.render({
                status: this.status,
                text: this.text,
                buttons: this.buttons,
                inf: this.inf
            });
        }

        this.lock = !(this.status == PLAYER_STATUS_END || this.status == PLAYER_STATUS_PAUSE);
    };

    /**
     *
     */
    this.play = function() {
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
    };

    /**
     * добавление команды в текущий поток
     *
     * @param {String} line
     */
    this.flowAdd = function(line) {
        this.flowStack[this.flow].push(line);
    };

    /**
     * команды далее исполняются юзером по ходу игры
     */

    /**
     * коммон
     */
    this.common = function() {
        var commonLabel = 'common';

        if (Game.getVar('common') !== 0) {
            commonLabel = commonLabel + '_' + Game.getVar('common');
        }

        if (this.proc(commonLabel)) {
            this.forgetProc();
            this.continue();
        }
    };

    /**
     *
     * @param {String} labelName
     * @returns {boolean}
     */
    this.btnAction = function(labelName) {
        if (this.lock) return false;

        this.common();

        if (this.goto(labelName, 'btn')) {
            Game.setVar('previous_loc', Game.getVar('current_loc'));
            Game.setVar('current_loc', labelName);

            this.continue();
        }
    };

    /**
     *
     * @param {String} labelName
     * @returns {boolean}
     */
    this.useAction = function(labelName) {
        if (this.lock) return false;

        var tmpLoc = Game.realCurrentLoc;

        Game.realCurrentLoc = null;

        if (this.proc(labelName)) {
            this.forgetProc();
            this.continue();
        }

        if (Game.realCurrentLoc === null) {
            Game.locked = true;
            this.goto(tmpLoc, 'return');
            this.continue();
            Game.locked = false;
        }
    };

    /**
     * @inheritDoc
     */
    this.setVar = function(variable, value) {
        if (Game.locked) return false;

        if (variable.toLowerCase() === 'image') {

            if (files === null) {
                if (value) {
                    this.print($('<img>').attr('src', value).prop('outerHTML'), true);
                }
            } else {
                var file;

                if (files[value] !== undefined) {
                    file = files[value];
                } else if (files[value + '.png'] !== undefined) {
                    file = files[value + '.png'];
                } else if (files[value + '.jpg'] !== undefined) {
                    file = files[value + '.jpg'];
                } else if (files[value + '.gif'] !== undefined) {
                    file = files[value + '.gif'];
                }

                me.print($('<img>').attr('src', file).prop('outerHTML'), true);
            }
        } else if (variable.toLowerCase() === 'music') {
            var file;

            if (files === null) {
                file = 'quests/' + Game.name + '/' + value;
            } else {
                file = files[value];
            }

            if (value) {
                if (gameMusic.getAttribute('src') != file) {
                    gameMusic.src = file;

                    gameMusic.addEventListener('ended', function() {
                        gameMusic.src = file;
                        gameMusic.play();
                    }, false);

                    gameMusic.play();
                }
            } else {
                gameMusic.pause();
            }
        }

        variable = variable.trim();

        Game.setVar(variable, value);
    };
}

