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

        if (Game.realCurrentLoc == Game.firstLabel) {
            this.buttons.unshift({
                label: '#load$',
                desc: 'Загрузить игру'
            });
        }

        this.Client.render({
            status: this.status,
            text: this.text,
            buttons: this.buttons,
            inf: this.inf
        });

        this.lock = (this.status != PLAYER_STATUS_END);
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
            Game.previousLoc = Game.currentLoc;
            Game.currentLoc = labelName;
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

        if (this.proc(labelName)) {
            this.forgetProc();
            this.continue();
        }

        Game.locked = true;
        this.goto(tmpLoc, 'return');
        this.continue();
        Game.locked = false;
    };

}

