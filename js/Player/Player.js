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
        this.play();

        this.fin();
    };

    /**
     * рендер
     */
    this.fin = function() {
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
    this.play = function() {
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

        if (Game.getVar('urq_mode') != 'ripurq' && Game.getVar('common') !== 0) {
            commonLabel = commonLabel + '_' + Game.getVar('common');
        }

        if (this.proc(commonLabel)) {
            this.forgetProc();
            this.play();
        }
    };

    /**
     * @param {String} labelName
     * @returns {boolean}
     */
    this.btnAction = function(labelName) {
        if (this.lock) return false;

        this.cls();

        this.common();

        if (this.goto(labelName, 'btn')) {
            Game.setVar('previous_loc', Game.getVar('current_loc'));
            Game.setVar('current_loc', labelName);

            this.continue();
        }
    };

    /**
     * @param {String} command
     * @returns {boolean}
     */
    this.xbtnAction = function(command) {
        if (this.lock) return false;
        
        this.lock = true;
        
        var tmpLoc = Game.realCurrentLoc;

        this.Parser.parse(command);

        while (this.flowStack[this.flow].length > 0) {
            this.Parser.parse(this.flowStack[this.flow].pop());
        }
        
        if (tmpLoc != Game.realCurrentLoc) { // сдвинулись! играем квест дальше
            this.Client.cls();
            this.continue();
        } else { // стоим на месте. Порисуем что ли.
            this.fin();
        }
    };

    /**
     * @param {String} labelName
     * @returns {boolean}
     */
    this.useAction = function(labelName) {
        if (this.lock) return false;

        this.cls();

        var tmpLoc = Game.realCurrentLoc;

        Game.realCurrentLoc = null;

        if (this.proc(labelName)) {
            this.forgetProc();
            this.play();
        }

        if (Game.realCurrentLoc === null) {
            Game.locked = true;
            this.goto(tmpLoc, 'return');
            this.continue();
            Game.locked = false;
        } else {
            this.fin();
        }
    };

    /**
     * @param {String} keycode
     * @returns {boolean}
     */
    this.anykeyAction = function(keycode) {
        if (this.inf.length > 0) {
            this.setVar(this.inf, keycode);
        }

        GlobalPlayer.continue();
    };

    /**
     * @param {String} value
     * @returns {boolean}
     */
    this.inputAction = function(value) {
        this.setVar(this.inf, value);

        this.continue();
    };

    /**
     * @inheritDoc
     */
    this.setVar = function(variable, value) {
        if (Game.locked) return false;

        if (variable.toLowerCase() === 'style_dos_textcolor') {
            Game.setVar('style_textcolor', dosColorToHex(value));
        } else
        if (variable.toLowerCase() === 'urq_mode') {
            if (value == 'dosurq') {
                Game.setVar('style_backcolor', '#000');
            }
        } else

        // todo переместить в рендер
        if (variable.toLowerCase() === 'image') {
            if (files === null) {
                if (value) {
                    this.print($('<img style="margin: 5px auto; display: block;">').attr('src', value).prop('outerHTML'), true);
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

                this.print($('<img style="margin: 5px auto; display: block;">').attr('src', file).prop('outerHTML'), true);
            }
        }

        variable = variable.trim();

        Game.setVar(variable, value);
    };

    /**
     * @param {String} src
     * @param {bool} loop
     */
    this.playMusic = function(src, loop) {
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

}

